from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel

import anthropic
from fastapi import APIRouter, HTTPException

from models.gift import FindGiftsResponse
from models.recipient import RecipientInput, RecipientProfile
from services import catalog_service, claude_service, serpapi_service

router = APIRouter()


class GiftMessageRequest(BaseModel):
    product_name: str
    explanation: str
    profile: RecipientProfile


class GiftMessageResponse(BaseModel):
    message: str


class FollowUpResponse(BaseModel):
    needs_followup: bool
    questions: List[str] = []


class RefineRequest(BaseModel):
    description: str
    budget_min: float = 25
    budget_max: float = 100
    occasion: str = "birthday"
    additional_context: str = ""
    gender: str = "not specified"


@router.post("/check-followup", response_model=FollowUpResponse)
def check_followup(body: RecipientInput) -> FollowUpResponse:
    try:
        result = claude_service.check_followup(body)
        return FollowUpResponse(**result)
    except anthropic.APIError as e:
        raise HTTPException(status_code=503, detail=f"Claude API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse-recipient", response_model=RecipientProfile)
def parse_recipient(body: RecipientInput) -> RecipientProfile:
    try:
        return claude_service.parse_recipient(body)
    except anthropic.APIError as e:
        raise HTTPException(status_code=503, detail=f"Claude API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/find-gifts", response_model=FindGiftsResponse)
def find_gifts(body: RefineRequest) -> FindGiftsResponse:
    try:
        # Merge additional context into description
        full_description = body.description
        if body.additional_context:
            full_description += f"\n\nAdditional details: {body.additional_context}"

        inp = RecipientInput(
            description=full_description,
            budget_min=body.budget_min,
            budget_max=body.budget_max,
            occasion=body.occasion,
            gender=body.gender,
        )

        # Step 1: Understand the recipient
        profile = claude_service.parse_recipient(inp)

        # Step 2: Get candidates
        if serpapi_service.is_available():
            queries = claude_service.generate_gift_queries(profile)
            candidates, total, _ = serpapi_service.get_candidates_with_fallback(
                queries, profile, top_n=16
            )
        else:
            candidates, total = catalog_service.get_candidates(profile, top_n=16)

        # Step 3: Claude ranks and explains
        results = claude_service.score_and_explain(profile, candidates)

        return FindGiftsResponse(
            profile=profile,
            results=results,
            total_candidates=total,
        )
    except anthropic.APIError as e:
        raise HTTPException(status_code=503, detail=f"Claude API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class CompareRequest(BaseModel):
    product_name: str
    price: float = 0


class PriceOption(BaseModel):
    store: str
    price: float
    rating: float = 0
    review_count: int = 0
    url: str
    thumbnail: str = ""


class CompareResponse(BaseModel):
    product_name: str
    options: List[PriceOption]


def _store_search_url(store: str, product_name: str, google_product_link: str = "") -> str:
    """Build a direct search URL for known stores, or use Google product page."""
    import urllib.parse
    words = product_name.replace("/", " ").replace("-", " ").split()
    skip = {"the", "a", "an", "for", "and", "with", "in", "of", "by", "to", "from", "set", "kit", "pack", "new"}
    clean = [w for w in words if w.lower() not in skip][:5]
    q = urllib.parse.quote_plus(" ".join(clean))

    s = store.lower().strip()
    if "amazon" in s:
        return f"https://www.amazon.com/s?k={q}"
    if "walmart" in s:
        return f"https://www.walmart.com/search?q={q}"
    if "target" in s:
        return f"https://www.target.com/s?searchTerm={q}"
    if "etsy" in s:
        return f"https://www.etsy.com/search?q={q}"
    if "ebay" in s:
        return f"https://www.ebay.com/sch/i.html?_nkw={q}"
    if "best buy" in s:
        return f"https://www.bestbuy.com/site/searchpage.jsp?st={q}"
    if "barnes" in s or "noble" in s:
        return f"https://www.barnesandnoble.com/s/{q}"
    if "kohls" in s or "kohl" in s:
        return f"https://www.kohls.com/search.jsp?search={q}"
    if "macy" in s:
        return f"https://www.macys.com/shop/featured/{q}"
    if "nordstrom" in s:
        return f"https://www.nordstrom.com/sr?keyword={q}"
    if "poshmark" in s:
        return f"https://poshmark.com/search?query={q}"
    if "wayfair" in s:
        return f"https://www.wayfair.com/keyword.php?keyword={q}"
    # For unknown stores: use Google Shopping product page if available
    # (shows the actual product with all buying options)
    if google_product_link:
        return google_product_link
    return f"https://www.google.com/search?tbm=shop&q={q}"


@router.post("/compare-prices", response_model=CompareResponse)
def compare_prices(body: CompareRequest) -> CompareResponse:
    try:
        import os, requests as req
        key = os.environ.get("SERPAPI_KEY", "")
        if not key:
            return CompareResponse(product_name=body.product_name, options=[])

        params = {
            "q": body.product_name,
            "tbm": "shop",
            "api_key": key,
            "num": 8,
            "gl": "us",
            "hl": "en",
        }
        r = req.get("https://serpapi.com/search", params=params, timeout=10)
        r.raise_for_status()
        items = r.json().get("shopping_results", [])

        options = []
        seen: set[str] = set()
        for item in items:
            store = item.get("source", "")
            price = float(item.get("extracted_price") or 0)
            if not store or not price:
                continue
            store_key = store.lower().strip()
            if store_key in seen:
                continue
            seen.add(store_key)
            options.append(PriceOption(
                store=store,
                price=price,
                rating=float(item.get("rating") or 0),
                review_count=int(item.get("reviews") or 0),
                url=_store_search_url(store, body.product_name, item.get("product_link", "")),
                thumbnail=item.get("thumbnail") or "",
            ))

        options.sort(key=lambda o: o.price)
        return CompareResponse(product_name=body.product_name, options=options[:6])
    except Exception:
        return CompareResponse(product_name=body.product_name, options=[])


@router.post("/gift-message", response_model=GiftMessageResponse)
def gift_message(body: GiftMessageRequest) -> GiftMessageResponse:
    try:
        msg = claude_service.generate_gift_message(
            body.product_name, body.profile, body.explanation
        )
        return GiftMessageResponse(message=msg)
    except anthropic.APIError as e:
        raise HTTPException(status_code=503, detail=f"Claude API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

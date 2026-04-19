from __future__ import annotations

import os
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Tuple

import requests

from models.gift import Product
from services.catalog_service import CandidateTuple, get_candidates
from services.scoring import wilson_lower_bound

_SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")


def is_available() -> bool:
    return bool(_SERPAPI_KEY)


def _search_one(query: str, budget_min: float, budget_max: float) -> List[dict]:
    params = {
        "q": query,
        "tbm": "shop",
        "api_key": _SERPAPI_KEY,
        "num": 15,
        "gl": "us",
        "hl": "en",
        "tbs": f"mr:1,price:1,ppr_min:{int(budget_min)},ppr_max:{int(budget_max)}",
    }
    try:
        r = requests.get("https://serpapi.com/search", params=params, timeout=12)
        r.raise_for_status()
        items = r.json().get("shopping_results", [])
        return [
            i for i in items
            if budget_min <= float(i.get("extracted_price") or 0) <= budget_max * 1.2
            and i.get("extracted_price")
        ]
    except Exception:
        return []


def _infer_category(title: str) -> str:
    t = title.lower()
    if any(w in t for w in ["football", "soccer", "jersey", "messi", "fifa", "cleat", "goal net"]):
        return "Football & Soccer"
    if any(w in t for w in ["cricket", "bat", "wicket", "dhoni", "ipl", "stumps"]):
        return "Cricket & Sports"
    if any(w in t for w in ["harry potter", "hogwarts", "wand", "gryffindor", "slytherin", "marauder"]):
        return "Fandom & Collectibles"
    if any(w in t for w in ["funko", "collectible", "figurine", "action figure", "manga", "anime", "marvel", "lego"]):
        return "Fandom & Collectibles"
    if any(w in t for w in ["camera", "lens", "tripod", "photography", "photo", "flash", "mirrorless", "polaroid", "instax"]):
        return "Photography"
    if any(w in t for w in ["coffee", "espresso", "kettle", "pour over", "grinder", "french press"]):
        return "Kitchen & Food"
    if any(w in t for w in ["cook", "recipe", "kitchen", "instant pot", "air fryer", "skillet", "cocktail"]):
        return "Kitchen & Food"
    if any(w in t for w in ["yoga", "meditation", "diffuser", "massage", "wellness", "spa", "bath"]):
        return "Wellness & Self-care"
    if any(w in t for w in ["hike", "hiking", "camp", "outdoor", "backpack", "hammock", "lantern"]):
        return "Outdoors & Adventure"
    if any(w in t for w in ["board game", "card game", "puzzle", "chess", "trivia"]):
        return "Games & Entertainment"
    if any(w in t for w in ["book", "journal", "notebook", "kindle", "audiobook"]):
        return "Books & Learning"
    if any(w in t for w in ["watercolor", "paint", "draw", "sketch", "craft", "embroidery"]):
        return "Arts & Creativity"
    if any(w in t for w in ["running", "gym", "fitness", "resistance band", "foam roller", "kettlebell"]):
        return "Sports & Fitness"
    if any(w in t for w in ["smart", "bluetooth", "wireless", "gadget", "charger", "speaker", "headphone"]):
        return "Tech & Gadgets"
    if any(w in t for w in ["wallet", "scarf", "bag", "tote", "sunglasses", "bracelet", "jewelry"]):
        return "Fashion & Accessories"
    if any(w in t for w in ["plant", "succulent", "candle", "throw", "blanket", "decor", "lamp"]):
        return "Home & Decor"
    return "Gifts & More"


def _to_product(raw: dict, uid: str, query_tag: str) -> Product:
    title = raw.get("title", "Unknown Product")[:120]
    snippet = raw.get("snippet") or f"Available on {raw.get('source', 'Google Shopping')}."
    source = raw.get("source", "")

    # Product URL: prefer product_link (Google Shopping redirect), then link
    product_url = raw.get("product_link") or raw.get("link") or ""

    return Product(
        id=uid,
        name=title,
        category=_infer_category(title),
        tags=[query_tag],
        price=float(raw.get("extracted_price", 0)),
        rating=float(raw.get("rating") or 0),
        review_count=int(raw.get("reviews") or 0),
        occasions=["general"],
        image_url=raw.get("thumbnail", ""),
        description=snippet,
        affiliate_url=product_url,
        source=source,
    )


def _enforce_diversity(
    candidates: List[CandidateTuple], max_per_category: int = 4
) -> List[CandidateTuple]:
    """Ensure no single category dominates the candidate pool."""
    by_cat: defaultdict[str, list[CandidateTuple]] = defaultdict(list)
    for c in candidates:
        by_cat[c[0].category].append(c)

    result: list[CandidateTuple] = []
    # First pass: take up to max_per_category from each
    for cat_items in by_cat.values():
        cat_items.sort(key=lambda x: x[1], reverse=True)
        result.extend(cat_items[:max_per_category])

    # Sort by score
    result.sort(key=lambda x: x[1], reverse=True)
    return result


def search_products_parallel(
    queries: List[str], budget_min: float, budget_max: float
) -> Tuple[List[CandidateTuple], int]:
    raw_by_query: dict[str, List[dict]] = {}

    with ThreadPoolExecutor(max_workers=8) as executor:
        future_map = {executor.submit(_search_one, q, budget_min, budget_max): q for q in queries}
        for future in as_completed(future_map):
            q = future_map[future]
            raw_by_query[q] = future.result()

    seen_titles: set[str] = set()
    candidates: List[CandidateTuple] = []
    total_raw = 0

    for q_idx, query in enumerate(queries):
        # Use first meaningful word of query as a tag
        query_tag = query.split()[0].lower() if query else "general"
        for p_idx, raw in enumerate(raw_by_query.get(query, [])):
            total_raw += 1
            title_key = (raw.get("title", "")[:40]).lower().strip()
            if title_key in seen_titles:
                continue
            seen_titles.add(title_key)

            uid = f"serp_{q_idx}_{p_idx}"
            product = _to_product(raw, uid, query_tag)
            wilson = wilson_lower_bound(product.rating, product.review_count)
            candidates.append((product, 0.5 + wilson * 0.3, wilson, []))

    # Enforce diversity BEFORE sending to Claude
    diverse = _enforce_diversity(candidates, max_per_category=4)
    return diverse, total_raw


def get_candidates_with_fallback(
    queries: List[str], profile: "RecipientProfile", top_n: int = 24
) -> Tuple[List[CandidateTuple], int, bool]:
    """Returns (candidates, total, used_live_search)."""
    from models.recipient import RecipientProfile

    if not is_available():
        c, t = get_candidates(profile, top_n=top_n)
        return c, t, False

    live, total = search_products_parallel(queries, profile.budget_min, profile.budget_max)

    if len(live) < 8:
        curated, ct = get_candidates(profile, top_n=top_n)
        merged = live + [c for c in curated if c[0].id not in {x[0].id for x in live}]
        return merged[:top_n], total + ct, bool(live)

    return live[:top_n], total, True

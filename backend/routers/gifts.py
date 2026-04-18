from __future__ import annotations

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


@router.post("/parse-recipient", response_model=RecipientProfile)
def parse_recipient(body: RecipientInput) -> RecipientProfile:
    try:
        return claude_service.parse_recipient(body)
    except anthropic.APIError as e:
        raise HTTPException(status_code=503, detail=f"Claude API error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/find-gifts", response_model=FindGiftsResponse)
def find_gifts(body: RecipientInput) -> FindGiftsResponse:
    try:
        # Step 1: Understand the recipient
        profile = claude_service.parse_recipient(body)

        # Step 2: Get candidates — live search if SerpAPI available, else curated catalog
        if serpapi_service.is_available():
            queries = claude_service.generate_gift_queries(profile)
            candidates, total, _ = serpapi_service.get_candidates_with_fallback(
                queries, profile, top_n=12
            )
        else:
            candidates, total = catalog_service.get_candidates(profile, top_n=10)

        # Step 3: Claude ranks top candidates and writes personalized explanations
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

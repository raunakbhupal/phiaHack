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
        )

        # Step 1: Understand the recipient
        profile = claude_service.parse_recipient(inp)

        # Step 2: Get candidates
        if serpapi_service.is_available():
            queries = claude_service.generate_gift_queries(profile)
            candidates, total, _ = serpapi_service.get_candidates_with_fallback(
                queries, profile, top_n=24
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

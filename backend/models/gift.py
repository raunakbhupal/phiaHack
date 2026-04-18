from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel

from models.recipient import RecipientProfile


class Product(BaseModel):
    id: str
    name: str
    category: str
    tags: List[str]
    price: float
    rating: float
    review_count: int
    occasions: List[str]
    image_url: str
    description: str
    affiliate_url: str
    source: str = ""


class GiftResult(BaseModel):
    product: Product
    relevance_score: float
    wilson_score: float
    match_score: int
    explanation: str
    tag_overlap: List[str]
    why_this_store: Optional[str] = None


class FindGiftsResponse(BaseModel):
    profile: RecipientProfile
    results: List[GiftResult]
    total_candidates: int

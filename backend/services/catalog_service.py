from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import List, Tuple

from models.gift import Product
from models.recipient import RecipientProfile
from services.scoring import (
    wilson_lower_bound,
    tag_match_score,
    occasion_match_score,
    combined_relevance,
)

_DATA_PATH = Path(__file__).parent.parent / "data" / "products.json"


CandidateTuple = Tuple[Product, float, float, List[str]]


@lru_cache(maxsize=1)
def _load_products() -> List[Product]:
    with open(_DATA_PATH) as f:
        raw = json.load(f)
    return [Product(**item) for item in raw]


def get_candidates(
    profile: RecipientProfile, top_n: int = 10
) -> Tuple[List[CandidateTuple], int]:
    all_products = _load_products()

    budget_low = profile.budget_min
    budget_high = profile.budget_max * 1.1
    budget_filtered = [
        p for p in all_products if budget_low <= p.price <= budget_high
    ]

    if not budget_filtered:
        budget_filtered = [
            p for p in all_products if p.price <= profile.budget_max * 1.3
        ]

    profile_tags = profile.interests + profile.personality_traits

    scored: List[CandidateTuple] = []
    for product in budget_filtered:
        wilson = wilson_lower_bound(product.rating, product.review_count)
        tag_score, matched_tags = tag_match_score(product.tags, profile_tags)
        occ_score = occasion_match_score(product.occasions, profile.occasion)
        rel = combined_relevance(tag_score, wilson, occ_score)
        scored.append((product, rel, wilson, matched_tags))

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_n], len(budget_filtered)

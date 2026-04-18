import math


def wilson_lower_bound(rating: float, review_count: int, z: float = 1.96) -> float:
    if review_count == 0:
        return 0.0
    n = review_count
    p = (rating - 1) / 4.0
    denominator = 1 + z**2 / n
    centre = p + z**2 / (2 * n)
    spread = z * math.sqrt((p * (1 - p) + z**2 / (4 * n)) / n)
    return max(0.0, (centre - spread) / denominator)


def tag_match_score(
    product_tags: list[str], profile_tags: list[str]
) -> tuple[float, list[str]]:
    if not profile_tags:
        return 0.0, []
    product_set = {t.lower() for t in product_tags}
    interest_set = {t.lower() for t in profile_tags}
    overlap = product_set & interest_set
    score = len(overlap) / max(len(product_set), len(interest_set))
    return score, sorted(overlap)


def occasion_match_score(product_occasions: list[str], occasion: str) -> float:
    if occasion in product_occasions:
        return 1.0
    if "general" in product_occasions:
        return 0.5
    return 0.0


def combined_relevance(
    tag_score: float,
    wilson: float,
    occasion_score: float,
) -> float:
    return 0.45 * tag_score + 0.25 * wilson + 0.15 * occasion_score + 0.15

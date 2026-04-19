from __future__ import annotations

import json
import os
import re
from typing import Dict, List, Tuple

import anthropic
from dotenv import load_dotenv

from models.gift import GiftResult, Product
from models.recipient import RecipientInput, RecipientProfile
from services.catalog_service import CandidateTuple

load_dotenv()

_MODEL = "claude-sonnet-4-6"
_client: "Optional[anthropic.Anthropic]" = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _client

_FOLLOWUP_SYSTEM = """You are a gifting assistant. Analyze the user's gift description and decide if you need more information to find great gifts.

Return ONLY a valid JSON object — no markdown, no explanation.

Schema:
{
  "needs_followup": boolean,
  "questions": [string] (1-3 short questions, only if needs_followup is true)
}

Ask follow-up questions ONLY if the description is missing critical details that would significantly change the gift recommendations. You should ask if:
- Age/age range is completely unclear AND would matter (e.g., gifts for a 10-year-old vs 40-year-old are very different)
- No interests or hobbies are mentioned at all
- The occasion is ambiguous and could change the gift type significantly
- Budget expectations are unclear AND the description hints at either very cheap or very expensive taste

DO NOT ask follow-ups if:
- The description already has 2+ clear interests/hobbies
- Age can be reasonably inferred (e.g., "my college friend" → ~20s)
- The occasion is already specified in the form
- You're just being overly thorough — bias toward ACTION over questions

Keep questions short, friendly, and specific. Max 3 questions. Examples:
- "How old is Jake? Gift ideas vary a lot by age."
- "Any hobbies or things they're into lately?"
- "Is this for a milestone birthday or just a casual gift?"

If the description is rich enough, return: {"needs_followup": false, "questions": []}"""

_PARSE_SYSTEM = """You are a gifting intelligence assistant. Parse a natural language description of a gift recipient into a structured JSON profile used to match products.

Return ONLY a valid JSON object — no markdown fences, no explanation.

Schema:
{
  "name_hint": string | null,
  "age_range": string | null,
  "gender_hint": "male" | "female" | "non-binary" | null,
  "relationship": "friend" | "partner" | "parent" | "sibling" | "colleague" | "child" | "other",
  "interests": [string],
  "personality_traits": [string],
  "occasion": "birthday" | "anniversary" | "holiday" | "graduation" | "general",
  "budget_min": number,
  "budget_max": number,
  "summary_sentence": string
}

CRITICAL DISTINCTION — Fandoms vs Hobbies:
- "Loves Harry Potter" = they are a FAN of the franchise → tags: ["harry-potter", "fandom", "collectible", "hogwarts"] — DO NOT add "reading" or "books" unless they explicitly say they love reading
- "Loves football / soccer" = sports fan → tags: ["football", "soccer", "sports", "fan", "training"]
- "Messi fan / admirer" → add: ["messi", "argentina", "football", "soccer"]
- "Dhoni fan / cricket" → add: ["dhoni", "cricket", "csk", "india-cricket", "sports"]
- "Loves photography / taking photos" → tags: ["photography", "camera", "visual-art", "creative"]
- "Reads a lot / bookworm / loves reading" → ONLY THEN add: ["reading", "books", "fiction"]
- "Loves Star Wars / Marvel / anime" → tags: ["fandom", "collectible", "{franchise-name}"]

Tag vocabulary (use these for other interests):
- coffee/espresso lover → ["specialty-coffee", "pour-over", "brewing", "espresso", "morning-routine"]
- rock climber → ["rock-climbing", "bouldering", "climbing", "grip-strength", "outdoors"]
- hiker / backpacker → ["hiking", "backpacking", "trail", "outdoors", "adventure", "camping"]
- home cook / foodie → ["cooking", "foodie", "culinary", "kitchen", "meal-prep"]
- yoga / meditation → ["yoga", "meditation", "mindfulness", "wellness", "self-care"]
- artist / painter → ["art", "painting", "drawing", "watercolor", "creative"]
- musician / guitarist → ["music", "guitar", "vinyl-records", "audio", "songwriting"]
- video gamer → ["gaming", "video-games", "ea-sports"]
- board game fan → ["board-games", "tabletop", "strategy"]
- traveler → ["travel", "exploring", "adventure", "backpacking"]
- runner / athlete → ["running", "fitness", "cardio", "marathon", "training"]
- cyclist → ["cycling", "biking", "outdoors", "fitness"]
- coder / developer → ["coding", "programming", "tech", "productivity"]
- plant lover → ["plants", "gardening", "succulents", "nature"]
- wine / cocktail lover → ["wine", "cocktails", "mixology", "spirits", "entertaining"]
- cricket fan → ["cricket", "bat", "sports", "india-cricket", "ipl"]

Rules:
1. interests: 5-10 tags, all lowercase with hyphens — BE SPECIFIC to the person, not generic
2. personality_traits: 3-5 lowercase adjectives (adventurous, creative, passionate, etc.)
3. summary_sentence: warm, specific, 15-30 words referencing actual details from the description
4. Infer occasion from context if possible; default to provided occasion
5. Use budget defaults if not mentioned in description
6. Never add "books" or "reading" just because someone likes a book-based franchise"""

_SCORE_SYSTEM = """You are an elite gifting expert. Given a recipient profile and candidate products, select the BEST 9 gifts and score them.

THINK STEP BY STEP before selecting:
1. What are this person's CORE passions? (not just surface interests)
2. What would make them say "wow, they really know me"?
3. Would this gift collect dust or get used regularly?
4. Is this a lazy/generic gift or something thoughtful?

SELECTION RULES:
1. Return EXACTLY 9 results — no fewer.
2. DIVERSITY: Select from AT LEAST 3 different categories. Max 3 from same category.
3. Cover the recipient's TOP interests — if they like cricket AND Harry Potter AND photography, include gifts for ALL three.
4. REJECT generic gifts — "gift card", "generic mug", plain t-shirts are lazy. Pick items that show you UNDERSTAND the person.
5. PREFER products with high review counts — a 4.5★ with 2000 reviews beats 5★ with 3 reviews.
6. MIX price points within the budget range.
7. Consider GENDER if specified — don't suggest women's jewelry for a male recipient or vice versa.
8. Think about OCCASION — birthday gifts should feel celebratory, holiday gifts can be cozy/festive.

GIFT QUALITY HIERARCHY (prefer higher):
- Tier 1: Directly enables their hobby/passion (e.g., camera lens for photographer)
- Tier 2: Celebrates their fandom in a unique way (e.g., custom art, not just a logo t-shirt)
- Tier 3: Combines two interests creatively (e.g., Harry Potter camera strap)
- Tier 4: High-quality everyday item related to their lifestyle
- Tier 5: Generic but well-reviewed gift in their interest area

Return ONLY a JSON array — no markdown, no preamble. Exactly 9 elements.

Each element:
{
  "product_id": string,
  "match_score": integer (50-99),
  "explanation": string,
  "why_this_store": string | null
}

Scoring:
- 90-99: Tier 1-2 gift + perfect occasion fit + excellent reviews
- 80-89: Tier 2-3 gift, strong match on 2+ interests
- 70-79: Tier 3-4 gift, solid single-interest match
- 60-69: Tier 4-5, acceptable but not exciting
- 50-59: Filler only if nothing better available

Explanation rules:
- 2-3 sentences that feel like a thoughtful friend explaining the gift
- MUST reference specific interests or traits — never be generic
- Mention what makes this gift SPECIAL, not just what it is
- If strong reviews, mention as a trust signal

why_this_store: Brief note if from a well-known retailer, null otherwise."""

_QUERY_SYSTEM = """You generate targeted Google Shopping search queries to find ideal gifts.

ABSOLUTE RULES — VIOLATION = FAILURE:
1. You MUST generate EXACTLY 8 queries
2. You MUST cover EVERY distinct interest the recipient has — if they like football, Harry Potter, AND photography, there MUST be at least 2 queries for EACH interest
3. NO TWO queries may return the same type of product (e.g., two different jersey queries = FAILURE)
4. Mix product TYPES across queries: merchandise, equipment, accessories, decor, books, gadgets, apparel, art
5. At least 1 query must be a creative crossover combining two interests (e.g., "Harry Potter camera strap photography gift")
6. At least 1 query must be for something unexpected/unique they wouldn't think to search for themselves

Return ONLY a JSON array of 8 query strings — no markdown, no explanation."""

_MESSAGE_SYSTEM = """You write warm, personal gift card messages. Return ONLY the message text — no quotes, no markdown."""


def _extract_json(text: str, expect_array: bool = False) -> str:
    text = text.strip()
    # Try markdown code block first
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    # Determine search order based on expected type
    if expect_array:
        pairs = [("[", "]"), ("{", "}")]
    else:
        pairs = [("{", "}"), ("[", "]")]
    for start_char, end_char in pairs:
        start = text.find(start_char)
        if start == -1:
            continue
        depth = 0
        for i in range(start, len(text)):
            if text[i] == start_char:
                depth += 1
            elif text[i] == end_char:
                depth -= 1
                if depth == 0:
                    return text[start:i + 1]
    return text


def check_followup(inp: RecipientInput) -> dict:
    """Check if we need follow-up questions before searching."""
    user_msg = (
        f"Description: {inp.description}\n"
        f"Occasion: {inp.occasion}\n"
        f"Budget: ${inp.budget_min:.0f}–${inp.budget_max:.0f}"
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=300,
        system=_FOLLOWUP_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = _extract_json(response.content[0].text)
    return json.loads(raw)


def parse_recipient(inp: RecipientInput) -> RecipientProfile:
    user_msg = (
        f"Description: {inp.description}\n"
        f"Gender: {inp.gender} (use this to tailor gift suggestions appropriately)\n"
        f"Default Budget: ${inp.budget_min:.0f} – ${inp.budget_max:.0f}\n"
        f"Occasion hint: {inp.occasion}"
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=1024,
        system=_PARSE_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = _extract_json(response.content[0].text)
    data = json.loads(raw)
    data.setdefault("budget_min", inp.budget_min)
    data.setdefault("budget_max", inp.budget_max)
    return RecipientProfile(**data)


def score_and_explain(
    profile: RecipientProfile,
    candidates: List[CandidateTuple],
) -> List[GiftResult]:
    profile_json = profile.model_dump_json(indent=2)

    candidates_payload = []
    product_map: Dict[str, Tuple[Product, float, float, List[str]]] = {}
    for product, rel, wilson, matched in candidates:
        product_map[product.id] = (product, rel, wilson, matched)
        candidates_payload.append({
            "product_id": product.id,
            "name": product.name,
            "category": product.category,
            "price": product.price,
            "tags": product.tags,
            "description": product.description,
            "occasions": product.occasions,
            "rating": product.rating,
            "review_count": product.review_count,
            "source": product.source,
            "algorithm_score": round(rel, 3),
            "matched_tags": matched,
        })

    user_msg = (
        f"Recipient Profile:\n{profile_json}\n\n"
        f"Candidate Products ({len(candidates_payload)} items):\n{json.dumps(candidates_payload, indent=2)}"
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=4096,
        system=_SCORE_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = _extract_json(response.content[0].text, expect_array=True)
    scored = json.loads(raw)

    results: list[GiftResult] = []
    for item in scored:
        if len(results) >= 9:
            break
        pid = item.get("product_id", "")
        if pid not in product_map:
            continue
        product, rel, wilson, matched = product_map[pid]
        results.append(
            GiftResult(
                product=product,
                relevance_score=round(rel, 3),
                wilson_score=round(wilson, 3),
                match_score=int(item["match_score"]),
                explanation=item["explanation"],
                tag_overlap=matched,
                why_this_store=item.get("why_this_store"),
            )
        )

    # Fallback: fill to 9 from remaining candidates
    seen_ids = {r.product.id for r in results}
    for product, rel, wilson, matched in candidates:
        if len(results) >= 9:
            break
        if product.id not in seen_ids:
            results.append(
                GiftResult(
                    product=product,
                    relevance_score=round(rel, 3),
                    wilson_score=round(wilson, 3),
                    match_score=60,
                    explanation=f"A well-reviewed {product.category.lower()} pick that fits the budget and occasion.",
                    tag_overlap=matched,
                    why_this_store=f"Available on {product.source}" if product.source else None,
                )
            )
    return results


def generate_gift_queries(profile: RecipientProfile) -> List[str]:
    # Group interests into distinct themes for the prompt
    interests_str = ", ".join(profile.interests[:10]) if profile.interests else "general gifts"
    traits_str = ", ".join(profile.personality_traits[:4]) if profile.personality_traits else ""
    user_msg = (
        f"Recipient: {profile.name_hint or 'someone'}, {profile.age_range or 'adult'}, {profile.relationship}\n"
        f"Occasion: {profile.occasion}, Budget: ${profile.budget_min:.0f}–${profile.budget_max:.0f}\n"
        f"ALL interests (MUST cover each one): {interests_str}\n"
        f"Personality: {traits_str}\n"
        f"About them: {profile.summary_sentence}\n\n"
        f"Generate 8 Google Shopping queries. MANDATORY: at least 2 queries per major interest area. "
        f"The interests are: {interests_str}. "
        f"Each query must target a DIFFERENT product type (jersey, figurine, equipment, book, accessory, decor, gadget, art). "
        f"Be very specific — e.g. 'Messi Argentina signed poster wall art' not 'football gift'. "
        f"Return ONLY a JSON array: [\"query1\", ...]"
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=500,
        system=_QUERY_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = _extract_json(response.content[0].text, expect_array=True)
    queries = json.loads(raw)
    return [str(q) for q in queries[:8]]


def generate_gift_message(
    product_name: str,
    profile: RecipientProfile,
    explanation: str,
) -> str:
    name = profile.name_hint or "you"
    user_msg = (
        f"Write a heartfelt gift card message (3-4 sentences) for this situation:\n\n"
        f"Gift: {product_name}\n"
        f"Recipient: {name}, {profile.age_range or 'adult'} — {profile.relationship}\n"
        f"Occasion: {profile.occasion}\n"
        f"About them: {profile.summary_sentence}\n"
        f"Why this gift fits: {explanation}\n\n"
        f"The message should feel personal and specific, not generic. "
        f"Reference what makes this gift perfect for them. Warm tone, no clichés."
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=200,
        system=_MESSAGE_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    return response.content[0].text.strip()

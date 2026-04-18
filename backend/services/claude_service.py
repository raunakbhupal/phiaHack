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

Rules:
1. interests: 4-8 tags, all lowercase with hyphens — BE SPECIFIC to the person, not generic
2. personality_traits: 3-5 lowercase adjectives (adventurous, creative, passionate, etc.)
3. summary_sentence: warm, specific, 15-30 words referencing actual details from the description
4. Infer occasion from context if possible; default to provided occasion
5. Use budget defaults if not mentioned in description
6. Never add "books" or "reading" just because someone likes a book-based franchise"""

_SCORE_SYSTEM = """You are a gifting expert who finds deeply personal, thoughtful gifts. Given a recipient profile and candidate products, select the best 6, score them, and explain why each is a great fit.

Return ONLY a JSON array — no markdown, no preamble. Exactly 6 elements.

Each element:
{
  "product_id": string,
  "match_score": integer,
  "explanation": string
}

Scoring:
- 90-100: Directly targets a core interest + fits occasion perfectly
- 75-89: Hits 2+ interests or strong personality match
- 60-74: Tangential but still meaningful
- 50-59: Acceptable if nothing better available

Explanation rules:
- 2-3 sentences, must reference at least one specific interest or trait
- Second sentence: why it works for the occasion
- Never be generic ("this is great for anyone who likes...")
- Be specific and warm

IMPORTANT: Prefer products with higher review counts — they represent greater confidence in quality."""

_QUERY_SYSTEM = """You generate targeted Google Shopping search queries to find ideal gifts. Return ONLY a JSON array of 5 query strings — no markdown, no explanation."""

_MESSAGE_SYSTEM = """You write warm, personal gift card messages. Return ONLY the message text — no quotes, no markdown."""


def _extract_json(text: str) -> str:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        return match.group(1).strip()
    return text


def parse_recipient(inp: RecipientInput) -> RecipientProfile:
    user_msg = (
        f"Description: {inp.description}\n"
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
            "algorithm_score": round(rel, 3),
            "matched_tags": matched,
        })

    user_msg = (
        f"Recipient Profile:\n{profile_json}\n\n"
        f"Candidate Products:\n{json.dumps(candidates_payload, indent=2)}"
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=2048,
        system=_SCORE_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = _extract_json(response.content[0].text)
    scored = json.loads(raw)

    results: list[GiftResult] = []
    for item in scored[:6]:
        pid = item["product_id"]
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
            )
        )

    # Fallback: if LLM returned fewer than 6, fill from remaining candidates
    seen_ids = {r.product.id for r in results}
    for product, rel, wilson, matched in candidates:
        if len(results) >= 6:
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
                )
            )
    return results


def generate_gift_queries(profile: RecipientProfile) -> List[str]:
    interests_str = ", ".join(profile.interests[:6]) if profile.interests else "general gifts"
    traits_str = ", ".join(profile.personality_traits[:3]) if profile.personality_traits else ""
    user_msg = (
        f"Recipient: {profile.name_hint or 'someone'}, {profile.age_range or 'adult'}, {profile.relationship}\n"
        f"Occasion: {profile.occasion}, Budget: ${profile.budget_min:.0f}–${profile.budget_max:.0f}\n"
        f"Interests: {interests_str}\n"
        f"Personality: {traits_str}\n"
        f"About them: {profile.summary_sentence}\n\n"
        f"Generate 5 specific Google Shopping search queries that will surface the most relevant gift products. "
        f"Each query must target a DIFFERENT interest. Be very specific — e.g. 'Argentina Messi jersey gift' not 'sports gift'. "
        f"Include budget-appropriate product types. Return ONLY a JSON array: [\"query1\", ...]"
    )
    response = _get_client().messages.create(
        model=_MODEL,
        max_tokens=300,
        system=_QUERY_SYSTEM,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = _extract_json(response.content[0].text)
    queries = json.loads(raw)
    return [str(q) for q in queries[:5]]


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

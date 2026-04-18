from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class RecipientInput(BaseModel):
    description: str = Field(..., min_length=10, max_length=2000)
    budget_min: float = Field(default=0, ge=0)
    budget_max: float = Field(default=200, ge=0)
    occasion: str = Field(default="general")
    gender: str = Field(default="not specified")


class RecipientProfile(BaseModel):
    name_hint: Optional[str] = None
    age_range: Optional[str] = None
    gender_hint: Optional[str] = None
    relationship: str = "friend"
    interests: List[str] = []
    personality_traits: List[str] = []
    occasion: str = "general"
    budget_min: float = 0
    budget_max: float = 200
    summary_sentence: str = ""

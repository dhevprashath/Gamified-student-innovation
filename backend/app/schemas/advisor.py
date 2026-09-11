from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AdvisorRequest(BaseModel):
    title: str = Field(..., example="Smart Waste Management with IoT")
    description: str = Field(..., example="An automated IoT bin monitoring system for urban areas.")
    target_market: str | None = Field(default="Smart Cities", example="Smart Cities & Municipalities")

class AIFeedbackStructure(BaseModel):
    score: int
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    market_potential: str
    actionable_recommendations: list[str]

class AdvisorResponse(BaseModel):
    id: int
    title: str
    description: str
    target_market: str | None
    ai_feedback: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ResearchGapAnalyzeRequest(BaseModel):
    project_id: int = Field(..., example=1)
    research_topic: str = Field(..., example="Smart Waste Routing Algorithms")
    problem_area: str = Field(..., example="Static collection schedules fail under dynamic waste generation.")
    existing_solution: str | None = Field(default="Fixed daily truck routes", example="Fixed daily truck routes")
    target_domain: str | None = Field(default="Smart Cities", example="Smart Cities & Municipal Logistics")

class ResearchGapData(BaseModel):
    existing_solution_summary: str
    existing_limitations: list[str]
    research_gap: str
    why_gap_matters: str
    innovation_opportunity: str
    suggested_features: list[str]
    research_questions: list[str]
    future_scope: list[str]

class ResearchGapResponse(BaseModel):
    id: int
    project_id: int
    research_topic: str
    problem_area: str
    existing_solution: str | None
    target_domain: str | None
    gap_data: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

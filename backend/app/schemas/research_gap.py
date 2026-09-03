from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ResearchGapAnalyzeRequest(BaseModel):
    project_id: int = Field(..., example=1)
    research_topic: str = Field(..., example="Smart Waste Routing Algorithms")
    problem_area: str = Field(..., example="Static collection schedules fail under dynamic waste generation.")
    existing_solution: Optional[str] = Field(default="Fixed daily truck routes", example="Fixed daily truck routes")
    target_domain: Optional[str] = Field(default="Smart Cities", example="Smart Cities & Municipal Logistics")

class ResearchGapData(BaseModel):
    existing_solution_summary: str
    existing_limitations: List[str]
    research_gap: str
    why_gap_matters: str
    innovation_opportunity: str
    suggested_features: List[str]
    research_questions: List[str]
    future_scope: List[str]

class ResearchGapResponse(BaseModel):
    id: int
    project_id: int
    research_topic: str
    problem_area: str
    existing_solution: Optional[str]
    target_domain: Optional[str]
    gap_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

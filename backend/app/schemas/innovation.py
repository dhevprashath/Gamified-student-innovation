from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class InnovationAnalyzeRequest(BaseModel):
    project_id: int = Field(..., example=1)
    project_title: str = Field(..., example="Smart Waste Management")
    problem_statement: str = Field(..., example="Overfilled public bins in urban centers cause pollution.")
    proposed_solution: str = Field(..., example="Automated fill-level IoT sensor network with dynamic truck routing.")
    target_users: str = Field(..., example="Municipal waste management authorities")
    technology_domain: str = Field(..., example="IoT, Machine Learning & Web Dashboard")
    expected_impact: str = Field(..., example="30% reduction in truck fuel usage and zero bin overflow.")

class InnovationAnalysisData(BaseModel):
    innovation_score: int
    problem_clarity: int
    technical_feasibility: int
    market_potential: int
    financial_feasibility: int
    ethical_score: int
    privacy_security_score: int
    overall_risk: str  # Low, Medium, High
    recommendation: str
    strengths: list[str]
    weaknesses: list[str]
    improvements: list[str]
    recommended_technologies: list[str]
    mvp_suggestions: list[str]

class InnovationResponse(BaseModel):
    id: int
    project_id: int
    project_title: str
    problem_statement: str
    proposed_solution: str
    target_users: str | None
    technology_domain: str | None
    expected_impact: str | None
    analysis_data: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class ReadinessResponse(BaseModel):
    project_id: int
    overall_score: int
    research_score: int
    validation_score: int
    team_score: int
    prototype_score: int
    testing_score: int
    pitch_score: int
    completed_areas: List[str]
    missing_areas: List[str]
    recommendations: List[str]

    class Config:
        from_attributes = True

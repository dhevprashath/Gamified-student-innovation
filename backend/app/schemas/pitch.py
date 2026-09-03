from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class PitchGenerateRequest(BaseModel):
    project_id: int = Field(..., example=1)

class PitchData(BaseModel):
    project_introduction: str
    problem: str
    solution: str
    innovation: str
    target_users: str
    market_opportunity: str
    business_model: str
    social_environmental_impact: str
    future_scope: str
    pitch_script: str  # 2-Minute Pitch Script

class PitchResponse(BaseModel):
    id: int
    project_id: int
    pitch_data: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

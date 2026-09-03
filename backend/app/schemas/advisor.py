from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AdvisorRequest(BaseModel):
    title: str = Field(..., example="Smart Waste Management with IoT")
    description: str = Field(..., example="An automated IoT bin monitoring system for urban areas.")
    target_market: Optional[str] = Field(default="Smart Cities", example="Smart Cities & Municipalities")

class AIFeedbackStructure(BaseModel):
    score: int
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    market_potential: str
    actionable_recommendations: List[str]

class AdvisorResponse(BaseModel):
    id: int
    title: str
    description: str
    target_market: Optional[str]
    ai_feedback: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

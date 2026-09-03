from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class ResearchRequest(BaseModel):
    domain: str = Field(..., example="Healthcare AI")
    topic: str = Field(..., example="Early Diagnosis of Diabetes using Wearables")
    abstract_text: Optional[str] = Field(default="", example="Recent studies analyze heart rate patterns...")

class ResearchResponse(BaseModel):
    id: int
    domain: str
    topic: str
    abstract_text: Optional[str]
    analysis_result: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

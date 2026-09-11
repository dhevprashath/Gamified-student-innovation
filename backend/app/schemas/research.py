from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):
    domain: str = Field(..., example="Healthcare AI")
    topic: str = Field(..., example="Early Diagnosis of Diabetes using Wearables")
    abstract_text: str | None = Field(default="", example="Recent studies analyze heart rate patterns...")

class ResearchResponse(BaseModel):
    id: int
    domain: str
    topic: str
    abstract_text: str | None
    analysis_result: dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ModuleSuggestion(BaseModel):
    id: int
    project_id: int
    name: str
    category: str | None
    description: str | None
    priority: str | None
    complexity: str | None
    estimated_duration: str | None
    tech_stack: List[str] | None
    key_features: List[str] | None
    deliverable: str | None
    status: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class ModuleSuggestionRequest(BaseModel):
    project_id: int = Field(..., example=1)


class ModuleSuggestionListResponse(BaseModel):
    project_id: int
    modules: List[ModuleSuggestion]
    is_fallback: bool = False
    source: str = "AI"   # "Sample" = starter set, "AI" = generated set

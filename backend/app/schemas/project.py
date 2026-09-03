from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ProjectCreate(BaseModel):
    title: str = Field(..., example="Smart Campus Waste Recycling")
    description: Optional[str] = Field(default="", example="IoT bin sensor with automated sorting.")
    domain: Optional[str] = Field(default="IoT & Sustainability", example="IoT & Sustainability")

class ProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str]
    domain: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

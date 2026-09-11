from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    title: str = Field(..., example="Smart Campus Waste Recycling")
    description: str | None = Field(default="", example="IoT bin sensor with automated sorting.")
    domain: str | None = Field(default="IoT & Sustainability", example="IoT & Sustainability")
    problem_statement: str | None = Field(default=None, example="Municipal waste collection relies on static schedules causing overflow.")
    target_users: str | None = Field(default=None, example="Municipalities, Campus Operations")
    expected_impact: str | None = Field(default=None, example="30% reduction in truck fuel consumption")

class ProjectResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    domain: str | None
    problem_statement: str | None
    target_users: str | None
    expected_impact: str | None
    created_at: datetime

    class Config:
        from_attributes = True

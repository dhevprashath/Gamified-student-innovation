from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CompleteStageRequest(BaseModel):
    stage_name: str = Field(..., example="Idea")  # Idea, Research, Validation, Team, Prototype, Testing, Pitch

class StageItem(BaseModel):
    stage_name: str
    xp_reward: int
    is_completed: bool
    completed_at: Optional[str] = None

class BadgeItem(BaseModel):
    badge_name: str
    icon: str
    unlocked_at: Optional[str] = None

class JourneyResponse(BaseModel):
    project_id: int
    total_xp: int
    current_level: int
    xp_for_next_level: int
    current_stage: str
    completed_count: int
    completion_percentage: float
    stages: List[StageItem]
    badges: List[BadgeItem]

    class Config:
        from_attributes = True

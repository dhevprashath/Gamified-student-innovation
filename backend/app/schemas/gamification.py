from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class QuestActionRequest(BaseModel):
    user_id: Optional[str] = "student_innovator"
    quest_id: str = Field(..., example="ideation_1")
    xp_reward: int = Field(default=50, example=50)

class ProgressResponse(BaseModel):
    user_id: str
    xp: int
    level: int
    completed_quests: List[str]
    unlocked_badges: List[Dict[str, Any]]

    class Config:
        from_attributes = True

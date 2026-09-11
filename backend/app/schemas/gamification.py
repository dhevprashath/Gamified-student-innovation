from typing import Any

from pydantic import BaseModel, Field


class QuestActionRequest(BaseModel):
    user_id: str | None = "student_innovator"
    quest_id: str = Field(..., example="ideation_1")
    xp_reward: int = Field(default=50, example=50)

class ProgressResponse(BaseModel):
    user_id: str
    xp: int
    level: int
    completed_quests: list[str]
    unlocked_badges: list[dict[str, Any]]

    class Config:
        from_attributes = True

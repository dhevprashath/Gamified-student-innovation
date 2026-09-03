from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.gamification import UserQuestProgress
from app.schemas.gamification import QuestActionRequest, ProgressResponse

router = APIRouter(prefix="/api/gamification", tags=["Gamified Innovation Journey"])

# Predefined Quests for student innovation stages
QUESTS_CATALOG = [
    {
        "stage": "Ideation",
        "quests": [
            {"id": "ideation_1", "title": "Define Core Problem Statement", "xp": 50, "description": "Formulate a concise 2-sentence description of the problem you are solving."},
            {"id": "ideation_2", "title": "Target User Persona", "xp": 75, "description": "Identify 3 key characteristics of your ideal early adopter user."},
            {"id": "ideation_3", "title": "Run AI Innovation Advisor", "xp": 100, "description": "Submit your concept to the AI Innovation Advisor for feedback."}
        ]
    },
    {
        "stage": "Validation",
        "quests": [
            {"id": "val_1", "title": "Identify Research Gaps", "xp": 100, "description": "Use the AI Research Gap Finder to evaluate literature & existing products."},
            {"id": "val_2", "title": "Conduct 5 User Interviews", "xp": 150, "description": "Gather qualitative feedback from 5 target market interviews."},
            {"id": "val_3", "title": "Competitor Analysis Matrix", "xp": 125, "description": "Map top 3 competitors and your key differentiator points."}
        ]
    },
    {
        "stage": "Prototyping",
        "quests": [
            {"id": "proto_1", "title": "Map System Architecture", "xp": 150, "description": "Define frontend, API, database, and third-party service connections."},
            {"id": "proto_2", "title": "Build Working MVP", "xp": 250, "description": "Implement core functionality enabling end-to-end user flow."},
            {"id": "proto_3", "title": "Run Readiness Evaluation", "xp": 150, "description": "Calculate project readiness score with AI Evaluator."}
        ]
    },
    {
        "stage": "Pitching",
        "quests": [
            {"id": "pitch_1", "title": "Generate AI Pitch Deck", "xp": 200, "description": "Create automated 4-slide deck outline using Project Readiness module."},
            {"id": "pitch_2", "title": "Record 60s Elevator Pitch", "xp": 200, "description": "Deliver elevator pitch summarizing problem, solution, and traction."},
            {"id": "pitch_3", "title": "Final Incubator Demo Day", "xp": 500, "description": "Present project live to mentors, investors, or judges."}
        ]
    }
]

BADGES_CATALOG = {
    "level_1": {"id": "novice", "title": "🌱 Rookie Innovator", "description": "Started your innovation journey!"},
    "level_2": {"id": "explorer", "title": "⚡ Idea Explorer", "description": "Reached Level 2 & unlocked validation tools!"},
    "level_3": {"id": "builder", "title": "🛠️ Prototype Architect", "description": "Reached Level 3 & building functional MVPs!"},
    "level_4": {"id": "pitcher", "title": "🚀 Pitch Champion", "description": "Reached Level 4 & master of innovation pitching!"}
}

def get_or_create_user_progress(user_id: str, db: Session) -> UserQuestProgress:
    progress = db.query(UserQuestProgress).filter(UserQuestProgress.user_id == user_id).first()
    if not progress:
        progress = UserQuestProgress(
            user_id=user_id,
            xp=100,
            level=1,
            completed_quests=["ideation_1"],
            unlocked_badges=[BADGES_CATALOG["level_1"]]
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress

@router.get("/quests")
def list_quests():
    return {"catalog": QUESTS_CATALOG}

@router.get("/progress", response_model=ProgressResponse)
def get_progress(user_id: str = "student_innovator", db: Session = Depends(get_db)):
    progress = get_or_create_user_progress(user_id, db)
    return progress

@router.post("/complete-quest", response_model=ProgressResponse)
def complete_quest(payload: QuestActionRequest, db: Session = Depends(get_db)):
    user_id = payload.user_id or "student_innovator"
    progress = get_or_create_user_progress(user_id, db)
    
    current_completed = list(progress.completed_quests or [])
    if payload.quest_id not in current_completed:
        current_completed.append(payload.quest_id)
        progress.completed_quests = current_completed
        progress.xp = (progress.xp or 0) + payload.xp_reward

        # Level calculation: Level = (XP // 200) + 1
        new_level = (progress.xp // 200) + 1
        progress.level = new_level

        # Unlock badges based on level
        current_badges = list(progress.unlocked_badges or [])
        badge_key = f"level_{min(new_level, 4)}"
        if badge_key in BADGES_CATALOG:
            badge_info = BADGES_CATALOG[badge_key]
            if not any(b.get("id") == badge_info["id"] for b in current_badges):
                current_badges.append(badge_info)
                progress.unlocked_badges = current_badges

        db.commit()
        db.refresh(progress)

    return progress

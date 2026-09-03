import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.journey import JourneyStage, JourneyProgress
from app.models.badge import Badge

STAGES_CONFIG = [
    {"name": "Idea", "xp": 100, "badge": "💡 Idea Starter", "icon": "💡"},
    {"name": "Research", "xp": 150, "badge": "🔬 Research Explorer", "icon": "🔬"},
    {"name": "Validation", "xp": 200, "badge": "🎯 Validator", "icon": "🎯"},
    {"name": "Team", "xp": 100, "badge": "👥 Team Builder", "icon": "👥"},
    {"name": "Prototype", "xp": 250, "badge": "🛠️ Prototype Builder", "icon": "🛠️"},
    {"name": "Testing", "xp": 200, "badge": "🧪 Testing Master", "icon": "🧪"},
    {"name": "Pitch", "xp": 300, "badge": "🚀 Innovation Champion", "icon": "🚀"},
]

class JourneyService:

    @staticmethod
    def get_or_create_journey(project_id: int, db: Session) -> Dict[str, Any]:
        # Ensure stages exist
        existing_stages = db.query(JourneyStage).filter(JourneyStage.project_id == project_id).all()
        existing_names = {s.stage_name: s for s in existing_stages}

        for cfg in STAGES_CONFIG:
            if cfg["name"] not in existing_names:
                new_stage = JourneyStage(
                    project_id=project_id,
                    stage_name=cfg["name"],
                    xp_reward=cfg["xp"],
                    is_completed=False
                )
                db.add(new_stage)
                db.flush()

        # Ensure progress record exists
        progress = db.query(JourneyProgress).filter(JourneyProgress.project_id == project_id).first()
        if not progress:
            progress = JourneyProgress(
                project_id=project_id,
                total_xp=0,
                current_level=1,
                current_stage="Idea",
                completed_count=0
            )
            db.add(progress)
            db.flush()

        db.commit()

        # Build response payload
        return JourneyService._build_journey_payload(project_id, db)

    @staticmethod
    def complete_stage(project_id: int, stage_name: str, db: Session) -> Dict[str, Any]:
        # Verify stage config
        stage_cfg = next((c for c in STAGES_CONFIG if c["name"].lower() == stage_name.lower()), None)
        if not stage_cfg:
            raise ValueError(f"Invalid stage name: {stage_name}")

        # Fetch or create journey
        JourneyService.get_or_create_journey(project_id, db)

        stage_obj = db.query(JourneyStage).filter(
            JourneyStage.project_id == project_id,
            JourneyStage.stage_name == stage_cfg["name"]
        ).first()

        if stage_obj and not stage_obj.is_completed:
            stage_obj.is_completed = True
            stage_obj.completed_at = datetime.datetime.utcnow()

            # Award XP & update progress
            progress = db.query(JourneyProgress).filter(JourneyProgress.project_id == project_id).first()
            progress.total_xp += stage_cfg["xp"]

            # Recalculate level: level = (total_xp // 200) + 1
            progress.current_level = (progress.total_xp // 200) + 1

            # Count completed stages
            completed_stages = db.query(JourneyStage).filter(
                JourneyStage.project_id == project_id,
                JourneyStage.is_completed == True
            ).all()
            progress.completed_count = len(completed_stages)

            # Update current stage to next uncompleted stage
            all_stages = db.query(JourneyStage).filter(JourneyStage.project_id == project_id).all()
            next_uncompleted = next((s for s in all_stages if not s.is_completed), None)
            if next_uncompleted:
                progress.current_stage = next_uncompleted.stage_name
            else:
                progress.current_stage = "Completed"

            # Unlock Badge if applicable
            badge_name = stage_cfg["badge"]
            existing_badge = db.query(Badge).filter(
                Badge.project_id == project_id,
                Badge.badge_name == badge_name
            ).first()

            if not existing_badge:
                new_badge = Badge(
                    project_id=project_id,
                    badge_name=badge_name,
                    icon=stage_cfg["icon"]
                )
                db.add(new_badge)

            db.commit()

        return JourneyService._build_journey_payload(project_id, db)

    @staticmethod
    def _build_journey_payload(project_id: int, db: Session) -> Dict[str, Any]:
        progress = db.query(JourneyProgress).filter(JourneyProgress.project_id == project_id).first()
        stages = db.query(JourneyStage).filter(JourneyStage.project_id == project_id).all()
        badges = db.query(Badge).filter(Badge.project_id == project_id).all()

        # Sort stages according to STAGES_CONFIG order
        stage_order_map = {cfg["name"]: idx for idx, cfg in enumerate(STAGES_CONFIG)}
        sorted_stages = sorted(stages, key=lambda s: stage_order_map.get(s.stage_name, 99))

        total_xp = progress.total_xp if progress else 0
        level = progress.current_level if progress else 1
        xp_for_next_level = level * 200
        completed_count = progress.completed_count if progress else 0
        total_stages = len(STAGES_CONFIG)
        completion_percentage = round((completed_count / total_stages) * 100, 1)

        return {
            "project_id": project_id,
            "total_xp": total_xp,
            "current_level": level,
            "xp_for_next_level": xp_for_next_level,
            "current_stage": progress.current_stage if progress else "Idea",
            "completed_count": completed_count,
            "completion_percentage": completion_percentage,
            "stages": [
                {
                    "stage_name": s.stage_name,
                    "xp_reward": s.xp_reward,
                    "is_completed": s.is_completed,
                    "completed_at": s.completed_at.isoformat() if s.completed_at else None
                }
                for s in sorted_stages
            ],
            "badges": [
                {
                    "badge_name": b.badge_name,
                    "icon": b.icon,
                    "unlocked_at": b.unlocked_at.isoformat() if b.unlocked_at else None
                }
                for b in badges
            ]
        }

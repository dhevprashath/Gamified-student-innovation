from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.journey import JourneyStage
from app.models.readiness import ProjectReadiness

WEIGHTS = {
    "Research": 20,
    "Validation": 20,
    "Team": 10,
    "Prototype": 25,
    "Testing": 15,
    "Pitch": 10,
}

RECOMMENDATIONS_MAP = {
    "Research": "Conduct literature research & complete the AI Research Gap Finder analysis.",
    "Validation": "Conduct user interviews and competitor matrix analysis to validate problem fit.",
    "Team": "Formulate core team roles, responsibilities, and advisor mentorship network.",
    "Prototype": "Build a working functional MVP demonstrating core user flows.",
    "Testing": "Run pilot testing sessions with 10+ target users and collect bug telemetry.",
    "Pitch": "Generate AI 2-minute elevator pitch script and 4-slide deck outline.",
}

class ReadinessService:

    @staticmethod
    def calculate_readiness(project_id: int, db: Session) -> Dict[str, Any]:
        stages = db.query(JourneyStage).filter(JourneyStage.project_id == project_id).all()
        stage_status = {s.stage_name: s.is_completed for s in stages}

        scores = {}
        completed_areas = []
        missing_areas = []
        recommendations = []

        total_score = 0
        for area, weight in WEIGHTS.items():
            is_done = stage_status.get(area, False)
            if is_done:
                score_value = 100
                total_score += weight
                completed_areas.append(area)
            else:
                score_value = 0
                missing_areas.append(area)
                if area in RECOMMENDATIONS_MAP:
                    recommendations.append(RECOMMENDATIONS_MAP[area])

            scores[f"{area.lower()}_score"] = score_value

        overall_score = round(total_score)

        # Update or create ProjectReadiness record in DB
        readiness_rec = db.query(ProjectReadiness).filter(ProjectReadiness.project_id == project_id).first()
        if not readiness_rec:
            readiness_rec = ProjectReadiness(project_id=project_id)
            db.add(readiness_rec)

        readiness_rec.overall_score = overall_score
        readiness_rec.research_score = scores.get("research_score", 0)
        readiness_rec.validation_score = scores.get("validation_score", 0)
        readiness_rec.team_score = scores.get("team_score", 0)
        readiness_rec.prototype_score = scores.get("prototype_score", 0)
        readiness_rec.testing_score = scores.get("testing_score", 0)
        readiness_rec.pitch_score = scores.get("pitch_score", 0)
        readiness_rec.recommendations = recommendations

        db.commit()
        db.refresh(readiness_rec)

        return {
            "project_id": project_id,
            "overall_score": overall_score,
            "research_score": scores.get("research_score", 0),
            "validation_score": scores.get("validation_score", 0),
            "team_score": scores.get("team_score", 0),
            "prototype_score": scores.get("prototype_score", 0),
            "testing_score": scores.get("testing_score", 0),
            "pitch_score": scores.get("pitch_score", 0),
            "completed_areas": completed_areas,
            "missing_areas": missing_areas,
            "recommendations": recommendations
        }

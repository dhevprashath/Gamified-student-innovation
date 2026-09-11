from pydantic import BaseModel


class ReadinessResponse(BaseModel):
    project_id: int
    overall_score: int
    research_score: int
    validation_score: int
    team_score: int
    prototype_score: int
    testing_score: int
    pitch_score: int
    completed_areas: list[str]
    missing_areas: list[str]
    recommendations: list[str]

    class Config:
        from_attributes = True

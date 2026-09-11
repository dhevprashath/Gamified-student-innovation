import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class JourneyStage(Base):
    __tablename__ = "journey_stages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    stage_name = Column(String(100), nullable=False)  # Idea, Research, Validation, Team, Prototype, Testing, Pitch
    xp_reward = Column(Integer, nullable=False)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="journey_stages")

class JourneyProgress(Base):
    __tablename__ = "journey_progress"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    current_stage = Column(String(100), default="Idea")
    completed_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="journey_progress")

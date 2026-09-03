import datetime
from sqlalchemy import Column, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ProjectReadiness(Base):
    __tablename__ = "project_readiness"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    overall_score = Column(Integer, default=0)
    research_score = Column(Integer, default=0)
    validation_score = Column(Integer, default=0)
    team_score = Column(Integer, default=0)
    prototype_score = Column(Integer, default=0)
    testing_score = Column(Integer, default=0)
    pitch_score = Column(Integer, default=0)
    
    recommendations = Column(JSON, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="readiness")

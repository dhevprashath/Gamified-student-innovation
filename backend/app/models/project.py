import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String(255), nullable=True)
    problem_statement = Column(Text, nullable=True)
    target_users = Column(String(255), nullable=True)
    expected_impact = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="projects")
    innovation_analyses = relationship("InnovationAnalysis", back_populates="project", cascade="all, delete-orphan")
    research_gaps = relationship("ResearchGap", back_populates="project", cascade="all, delete-orphan")
    journey_stages = relationship("JourneyStage", back_populates="project", cascade="all, delete-orphan")
    journey_progress = relationship("JourneyProgress", back_populates="project", uselist=False, cascade="all, delete-orphan")
    badges = relationship("Badge", back_populates="project", cascade="all, delete-orphan")
    readiness = relationship("ProjectReadiness", back_populates="project", uselist=False, cascade="all, delete-orphan")
    pitches = relationship("Pitch", back_populates="project", cascade="all, delete-orphan")

import datetime

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class ProjectModule(Base):
    __tablename__ = "project_modules"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Core Architecture")
    description = Column(Text, nullable=True)
    priority = Column(String(50), default="High")          # Core / Critical, High, Recommended, Optional
    complexity = Column(String(50), default="Medium")      # Beginner, Intermediate, Advanced
    estimated_duration = Column(String(50), default="1-2 Weeks")
    tech_stack = Column(JSON, nullable=True)               # e.g. ["ESP32", "MQTT", "Python"]
    key_features = Column(JSON, nullable=True)             # e.g. ["Feature 1", "Feature 2"]
    deliverable = Column(String(255), nullable=True)
    status = Column(String(50), default="Suggested")       # Suggested, Planned, In Progress, Completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="modules")

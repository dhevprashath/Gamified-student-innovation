import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ResearchGap(Base):
    __tablename__ = "research_gaps"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    research_topic = Column(String(255), nullable=False)
    problem_area = Column(Text, nullable=False)
    existing_solution = Column(Text, nullable=True)
    target_domain = Column(String(255), nullable=True)
    
    # AI gap analysis stored as JSON
    gap_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="research_gaps")

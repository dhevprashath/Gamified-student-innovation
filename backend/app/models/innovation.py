import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class InnovationAnalysis(Base):
    __tablename__ = "innovation_analyses"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project_title = Column(String(255), nullable=False)
    problem_statement = Column(Text, nullable=False)
    proposed_solution = Column(Text, nullable=False)
    target_users = Column(String(255), nullable=True)
    technology_domain = Column(String(255), nullable=True)
    expected_impact = Column(Text, nullable=True)
    
    # AI returned fields stored as JSON
    analysis_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="innovation_analyses")

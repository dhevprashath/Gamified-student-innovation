import datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String, Text

from app.database import Base


class ResearchGapAnalysis(Base):
    __tablename__ = "research_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    abstract_text = Column(Text, nullable=True)
    analysis_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

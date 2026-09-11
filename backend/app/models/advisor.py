import datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String, Text

from app.database import Base


class AdvisorSubmission(Base):
    __tablename__ = "advisor_submissions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    target_market = Column(String(255), nullable=True)
    ai_feedback = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

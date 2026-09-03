import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    badge_name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=False)
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="badges")

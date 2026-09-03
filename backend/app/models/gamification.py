import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.database import Base

class UserQuestProgress(Base):
    __tablename__ = "user_quest_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), unique=True, index=True, default="student_innovator")
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    completed_quests = Column(JSON, default=list)  # list of quest strings
    unlocked_badges = Column(JSON, default=list)   # list of badge objects/strings
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

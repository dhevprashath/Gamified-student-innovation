import datetime

from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Integer, String, Text
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

    # 384-dimensional vector embedding from sentence-transformers/all-MiniLM-L6-v2
    embedding = Column(JSON, nullable=True)

    # True when these scores were produced by the local heuristic because the
    # AI service was unreachable. Surfaced as a column so that a degraded run
    # can never shadow a genuine analysis in read queries.
    is_fallback = Column(Boolean, default=False, nullable=False, index=True)

    # SHA-256 of the six analysis inputs. Lets a re-analyze of unchanged text
    # reuse the stored result instead of spending another API call.
    input_hash = Column(String(64), nullable=True, index=True)

    # AI returned fields stored as JSON
    analysis_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="innovation_analyses")

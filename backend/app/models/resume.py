from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, Boolean
from app.core.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)  # pdf, docx, txt
    raw_text = Column(Text, nullable=True)  # extracted text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class OptimizationResult(Base):
    __tablename__ = "optimization_results"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # AI optimization results
    optimized_text = Column(Text, nullable=True)  # full optimized resume text
    summary = Column(Text, nullable=True)          # summary assessment
    score = Column(Integer, nullable=True)         # ATS score 0-100
    suggestions = Column(Text, nullable=True)      # JSON list of suggestions
    keyword_matches = Column(Text, nullable=True)  # JSON keyword analysis
    ats_feedback = Column(Text, nullable=True)     # ATS-specific feedback

    # Job matching
    target_position = Column(String(200), nullable=True)
    target_industry = Column(String(100), nullable=True)
    match_score = Column(Float, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

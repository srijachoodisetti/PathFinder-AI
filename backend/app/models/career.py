from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime, timezone
from app.core.database import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    ats_score = Column(Float, default=0.0)
    resume_strength = Column(String, nullable=True)  # "Weak", "Average", "Strong", "Excellent"
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resume_url = Column(String, nullable=True)
    parsed_text = Column(Text, nullable=True)

    user = orm_relationship("User")
    feedback = orm_relationship("ATSFeedback", back_populates="analysis", uselist=False, cascade="all, delete-orphan")


class ATSFeedback(Base):
    __tablename__ = "ats_feedbacks"
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id", ondelete="CASCADE"), nullable=False)
    strengths = Column(Text, nullable=True)          # JSON list
    weaknesses = Column(Text, nullable=True)         # JSON list
    missing_keywords = Column(Text, nullable=True)   # JSON list
    formatting_issues = Column(Text, nullable=True)  # JSON list
    grammar_score = Column(Float, default=0.0)
    overall_feedback = Column(Text, nullable=True)
    keyword_match_percent = Column(Float, default=0.0)
    improvement_tips = Column(Text, nullable=True)   # JSON list (Gemini generated)
    recommended_certs = Column(Text, nullable=True)  # JSON list (Gemini generated)
    recommended_projects = Column(Text, nullable=True)  # JSON list (Gemini generated)

    analysis = orm_relationship("ResumeAnalysis", back_populates="feedback")


class CareerSuggestion(Base):
    __tablename__ = "career_suggestions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_role = Column(String, nullable=False)
    recommended_skills = Column(Text, nullable=True)         # JSON list
    recommended_projects = Column(Text, nullable=True)       # JSON list
    recommended_certifications = Column(Text, nullable=True) # JSON list
    recommended_courses = Column(Text, nullable=True)        # JSON list
    roadmap_text = Column(Text, nullable=True)               # Full roadmap markdown
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = orm_relationship("User")


class ResumeHistory(Base):
    __tablename__ = "resume_histories"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    ats_score = Column(Float, default=0.0)
    improvement = Column(Float, default=0.0)  # Score delta from previous upload
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    analysis_id = Column(Integer, ForeignKey("resume_analyses.id", ondelete="SET NULL"), nullable=True)

    user = orm_relationship("User")
    analysis = orm_relationship("ResumeAnalysis")

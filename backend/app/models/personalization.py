from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime, timezone
from app.core.database import Base

class LearningHistory(Base):
    __tablename__ = "learning_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    time_spent_minutes = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    last_accessed = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = orm_relationship("User")
    topic = orm_relationship("Topic")

class RecommendationRecord(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String, nullable=False) # topic, video, quiz, coding, project, internship, certification, placement
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    priority = Column(String, default="Medium") # High, Medium, Low
    reasons = Column(Text, nullable=True)

    user = orm_relationship("User")

class StudentGoal(Base):
    __tablename__ = "student_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_cgpa = Column(Float, default=8.0)
    daily_study_hours = Column(Float, default=2.0)
    weekly_xp_goal = Column(Integer, default=300)
    monthly_cert_goal = Column(Integer, default=1)

    user = orm_relationship("User")

class LearningAnalytic(Base):
    __tablename__ = "learning_analytics"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    learning_hours = Column(Float, default=0.0)
    quiz_scores_average = Column(Float, default=0.0)
    coding_progress_count = Column(Integer, default=0)
    placement_readiness_score = Column(Float, default=0.0)
    cgpa_growth = Column(Float, default=0.0)
    attendance_percentage = Column(Float, default=75.0)

    user = orm_relationship("User")

class RevisionSchedule(Base):
    __tablename__ = "revision_schedules"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    revision_type = Column(String, nullable=False) # daily, weekly, monthly, exam
    next_revision_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)

    user = orm_relationship("User")
    topic = orm_relationship("Topic")

class SkillProgress(Base):
    __tablename__ = "skill_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String, nullable=False)
    proficiency_level = Column(Integer, default=0) # 0 to 100
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = orm_relationship("User")

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)
    questions_json = Column(Text, nullable=False)  # JSON representation of questions list
    xp_reward = Column(Integer, default=50)

    # Relationships
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)  # Percentage score
    answers_json = Column(Text, nullable=False)  # Student's submitted answers
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    quiz = relationship("Quiz", back_populates="results")
    user = relationship("User")

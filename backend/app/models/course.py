from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)  # Mathematics, Science, English, etc.
    grade = Column(String, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content_markdown = Column(Text, nullable=False)
    video_url = Column(String, nullable=True)
    is_offline_ready = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    course = relationship("Course", back_populates="lessons")

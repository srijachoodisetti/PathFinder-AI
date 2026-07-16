from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # student, teacher, parent, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")
    parent_profile = relationship("Parent", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    grade = Column(String, nullable=True)
    learning_goals = Column(Text, nullable=True)
    xp_points = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    weak_topics = Column(Text, nullable=True)  # JSON or comma-separated string
    language_preference = Column(String, default="English")

    user = relationship("User", back_populates="student_profile")

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    subject_specialization = Column(String, nullable=True)
    classes_managed = Column(String, nullable=True)  # Comma-separated grades

    user = relationship("User", back_populates="teacher_profile")

class Parent(Base):
    __tablename__ = "parents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    child_email = Column(String, nullable=True)

    user = relationship("User", back_populates="parent_profile")

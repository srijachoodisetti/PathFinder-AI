from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime, timezone
from app.core.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    branches = orm_relationship("Branch", back_populates="department", cascade="all, delete-orphan")

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False) # e.g. CSE, IT, ECE

    department = orm_relationship("Department", back_populates="branches")
    semesters = orm_relationship("Semester", back_populates="branch", cascade="all, delete-orphan")

class Semester(Base):
    __tablename__ = "semesters"
    id = Column(Integer, primary_key=True, index=True)
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    semester_number = Column(Integer, nullable=False) # 1 to 8

    branch = orm_relationship("Branch", back_populates="semesters")
    subjects = orm_relationship("Subject", back_populates="semester", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    semester_id = Column(Integer, ForeignKey("semesters.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)

    semester = orm_relationship("Semester", back_populates="subjects")
    units = orm_relationship("Unit", back_populates="subject", cascade="all, delete-orphan")

class Unit(Base):
    __tablename__ = "units"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    unit_number = Column(Integer, nullable=False)

    subject = orm_relationship("Subject", back_populates="units")
    topics = orm_relationship("Topic", back_populates="unit", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    unit = orm_relationship("Unit", back_populates="topics")
    resources = orm_relationship("TopicResource", back_populates="topic", cascade="all, delete-orphan")
    videos = orm_relationship("VideoResource", back_populates="topic", cascade="all, delete-orphan")

class TopicResource(Base):
    __tablename__ = "topic_resources"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    resource_type = Column(String, nullable=False) # detailed_notes, short_notes, revision_notes, formula_sheet, diagram, ppt, pdf, practice_questions, pyq, interview_questions, lab_program, assignment
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True) # For markdown text
    file_url = Column(String, nullable=True) # For attachments

    topic = orm_relationship("Topic", back_populates="resources")

class VideoResource(Base):
    __tablename__ = "video_resources"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    course_title = Column(String, nullable=False)
    instructor = Column(String, nullable=True)
    platform = Column(String, nullable=False) # NPTEL, MIT, CS50, freeCodeCamp, etc.
    duration = Column(String, nullable=True)
    difficulty = Column(String, nullable=True) # Beginner, Intermediate, Advanced
    thumbnail_url = Column(String, nullable=True)
    video_url = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    topic = orm_relationship("Topic", back_populates="videos")

class CodingProgress(Base):
    __tablename__ = "coding_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    language = Column(String, nullable=False)
    problem_name = Column(String, nullable=False)
    code_content = Column(Text, nullable=False)
    status = Column(String, default="solved") # attempted, solved
    complexity_analysis = Column(Text, nullable=True)
    solved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ProjectRecord(Base):
    __tablename__ = "project_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String, nullable=False) # mini, major, hackathon
    github_url = Column(String, nullable=True)
    documentation_markdown = Column(Text, nullable=True)
    architecture_diagram_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class CertificateRecord(Base):
    __tablename__ = "certificate_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    issuer = Column(String, nullable=False) # Google, Microsoft, NPTEL...
    status = Column(String, default="completed") # recommended, completed
    credential_url = Column(String, nullable=True)
    date_earned = Column(DateTime, nullable=True)

class InternshipRecord(Base):
    __tablename__ = "internship_records"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, default="applied") # recommended, applied, offered, completed
    details_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    domain = Column(String, nullable=False) # e.g. Fullstack Developer, AI Engineer
    steps_json = Column(Text, nullable=False) # JSON list of checkpoints
    target_role = Column(String, nullable=True)

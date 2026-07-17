from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime, timezone
from app.core.database import Base

class Discussion(Base):
    __tablename__ = "discussions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = orm_relationship("User")
    subject = orm_relationship("Subject")
    topic = orm_relationship("Topic")
    replies = orm_relationship("DiscussionReply", back_populates="discussion", cascade="all, delete-orphan")

class DiscussionReply(Base):
    __tablename__ = "discussion_replies"
    id = Column(Integer, primary_key=True, index=True)
    discussion_id = Column(Integer, ForeignKey("discussions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_best_answer = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    discussion = orm_relationship("Discussion", back_populates="replies")
    user = orm_relationship("User")

class StudyGroup(Base):
    __tablename__ = "study_groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    creator = orm_relationship("User")
    members = orm_relationship("StudyGroupMember", back_populates="study_group", cascade="all, delete-orphan")

class StudyGroupMember(Base):
    __tablename__ = "study_group_members"
    id = Column(Integer, primary_key=True, index=True)
    study_group_id = Column(Integer, ForeignKey("study_groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    study_group = orm_relationship("StudyGroup", back_populates="members")
    user = orm_relationship("User")

class ProjectCollaboration(Base):
    __tablename__ = "project_collaborations"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    github_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    creator = orm_relationship("User")
    tasks = orm_relationship("ProjectTask", back_populates="project", cascade="all, delete-orphan")

class ProjectTask(Base):
    __tablename__ = "project_tasks"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project_collaborations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String, default="todo") # todo, in_progress, done
    due_date = Column(DateTime, nullable=True)

    project = orm_relationship("ProjectCollaboration", back_populates="tasks")
    assignee = orm_relationship("User")

class ResourceLibrary(Base):
    __tablename__ = "resource_libraries"
    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    resource_type = Column(String, nullable=False) # pdf, ppt, lab_code, research
    title = Column(String, nullable=False)
    file_url = Column(String, nullable=False)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    uploader = orm_relationship("User")
    subject = orm_relationship("Subject")

class InterviewExperience(Base):
    __tablename__ = "interview_experiences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    rounds_description = Column(Text, nullable=False)
    preparation_tips = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = orm_relationship("User")

class CampusEvent(Base):
    __tablename__ = "campus_events"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String, nullable=False) # hackathon, workshop, coding_contest, drive
    event_date = Column(DateTime, nullable=False)
    registration_count = Column(Integer, default=0)

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    publisher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    announcement_type = Column(String, nullable=False) # exam, holiday, placement, general
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    publisher = orm_relationship("User")

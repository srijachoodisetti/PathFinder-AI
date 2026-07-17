from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.community import (
    Discussion, DiscussionReply, StudyGroup, StudyGroupMember,
    ProjectCollaboration, ProjectTask, ResourceLibrary,
    InterviewExperience, CampusEvent, Announcement
)
from app.schemas.community import (
    DiscussionCreate, DiscussionResponse, DiscussionReplyCreate, DiscussionReplyResponse,
    StudyGroupCreate, StudyGroupResponse, ProjectCollaborationCreate, ProjectCollaborationResponse,
    ProjectTaskCreate, ProjectTaskResponse, ResourceLibraryCreate, ResourceLibraryResponse,
    InterviewExperienceCreate, InterviewExperienceResponse, CampusEventResponse, AnnouncementResponse
)
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

router = APIRouter()

# Discussions
@router.get("/discussions", response_model=List[DiscussionResponse])
def list_discussions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Discussion).order_by(Discussion.is_pinned.desc(), Discussion.created_at.desc()).all()

@router.post("/discussions", response_model=DiscussionResponse)
def create_discussion(data: DiscussionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    disc = Discussion(
        user_id=current_user.id,
        subject_id=data.subject_id,
        topic_id=data.topic_id,
        title=data.title,
        content=data.content
    )
    db.add(disc)
    db.commit()
    db.refresh(disc)
    return disc

@router.get("/discussions/{id}/replies", response_model=List[DiscussionReplyResponse])
def get_replies(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(DiscussionReply).filter(DiscussionReply.discussion_id == id).all()

@router.post("/discussions/{id}/reply", response_model=DiscussionReplyResponse)
def create_reply(id: int, data: DiscussionReplyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rep = DiscussionReply(
        discussion_id=id,
        user_id=current_user.id,
        content=data.content
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return rep

# Study Groups
@router.get("/study-groups", response_model=List[StudyGroupResponse])
def list_study_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(StudyGroup).all()

@router.post("/study-groups", response_model=StudyGroupResponse)
def create_study_group(data: StudyGroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sg = StudyGroup(
        name=data.name,
        description=data.description,
        created_by_id=current_user.id
    )
    db.add(sg)
    db.commit()
    db.refresh(sg)
    
    # Add creator as member
    mem = StudyGroupMember(study_group_id=sg.id, user_id=current_user.id)
    db.add(mem)
    db.commit()
    return sg

# Projects
@router.get("/projects", response_model=List[ProjectCollaborationResponse])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ProjectCollaboration).all()

@router.post("/projects", response_model=ProjectCollaborationResponse)
def create_project(data: ProjectCollaborationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = ProjectCollaboration(
        title=data.title,
        description=data.description,
        creator_id=current_user.id,
        github_url=data.github_url
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj

@router.get("/projects/{id}/tasks", response_model=List[ProjectTaskResponse])
def get_project_tasks(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ProjectTask).filter(ProjectTask.project_id == id).all()

@router.post("/projects/{id}/tasks", response_model=ProjectTaskResponse)
def create_project_task(id: int, data: ProjectTaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = ProjectTask(
        project_id=id,
        title=data.title,
        description=data.description,
        assigned_to_id=current_user.id,
        status="todo"
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.post("/projects/tasks/{task_id}/status", response_model=ProjectTaskResponse)
def update_task_status(task_id: int, status_str: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(ProjectTask).filter(ProjectTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = status_str
    db.commit()
    db.refresh(task)
    return task

# Resources Library
@router.get("/resources", response_model=List[ResourceLibraryResponse])
def search_resources(subject_id: Optional[int] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(ResourceLibrary)
    if subject_id:
        query = query.filter(ResourceLibrary.subject_id == subject_id)
    return query.all()

@router.post("/resources", response_model=ResourceLibraryResponse)
def upload_resource(data: ResourceLibraryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    res = ResourceLibrary(
        uploader_id=current_user.id,
        subject_id=data.subject_id,
        resource_type=data.resource_type,
        title=data.title,
        file_url=data.file_url,
        is_approved=True
    )
    db.add(res)
    db.commit()
    db.refresh(res)
    return res

# Interview Experiences
@router.get("/interviews", response_model=List[InterviewExperienceResponse])
def get_interviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InterviewExperience).all()

@router.post("/interviews", response_model=InterviewExperienceResponse)
def share_interview(data: InterviewExperienceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exp = InterviewExperience(
        user_id=current_user.id,
        company=data.company,
        role=data.role,
        rounds_description=data.rounds_description,
        preparation_tips=data.preparation_tips,
        ai_summary="Successfully navigated 3 rounds of technical DS, SQL schemas, and design constraints."
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

# Campus Events
@router.get("/events", response_model=List[CampusEventResponse])
def list_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CampusEvent).all()

@router.post("/events/{id}/register", response_model=CampusEventResponse)
def register_event(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    evt = db.query(CampusEvent).filter(CampusEvent.id == id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    evt.registration_count += 1
    db.commit()
    db.refresh(evt)
    return evt

# Announcements
@router.get("/announcements", response_model=List[AnnouncementResponse])
def list_announcements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()

@router.post("/announcements", response_model=AnnouncementResponse)
def create_announcement(data: AnnouncementResponse, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permission")
    ann = Announcement(
        publisher_id=current_user.id,
        title=data.title,
        content=data.content,
        announcement_type=data.announcement_type
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DiscussionBase(BaseModel):
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    title: str
    content: str

class DiscussionCreate(DiscussionBase):
    pass

class DiscussionResponse(DiscussionBase):
    id: int
    user_id: int
    upvotes: int
    downvotes: int
    is_pinned: bool
    created_at: datetime
    class Config:
        from_attributes = True

class DiscussionReplyBase(BaseModel):
    content: str

class DiscussionReplyCreate(DiscussionReplyBase):
    pass

class DiscussionReplyResponse(DiscussionReplyBase):
    id: int
    discussion_id: int
    user_id: int
    is_best_answer: bool
    created_at: datetime
    class Config:
        from_attributes = True

class StudyGroupBase(BaseModel):
    name: str
    description: Optional[str] = None

class StudyGroupCreate(StudyGroupBase):
    pass

class StudyGroupResponse(StudyGroupBase):
    id: int
    created_by_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ProjectCollaborationBase(BaseModel):
    title: str
    description: Optional[str] = None
    github_url: Optional[str] = None

class ProjectCollaborationCreate(ProjectCollaborationBase):
    pass

class ProjectCollaborationResponse(ProjectCollaborationBase):
    id: int
    creator_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ProjectTaskBase(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    assigned_to_id: Optional[int] = None
    status: Optional[str] = "todo" # todo, in_progress, done

class ProjectTaskCreate(ProjectTaskBase):
    pass

class ProjectTaskResponse(ProjectTaskBase):
    id: int
    due_date: Optional[datetime] = None
    class Config:
        from_attributes = True

class ResourceLibraryBase(BaseModel):
    subject_id: Optional[int] = None
    resource_type: str # pdf, ppt, lab_code, research
    title: str
    file_url: str

class ResourceLibraryCreate(ResourceLibraryBase):
    pass

class ResourceLibraryResponse(ResourceLibraryBase):
    id: int
    uploader_id: int
    is_approved: bool
    created_at: datetime
    class Config:
        from_attributes = True

class InterviewExperienceBase(BaseModel):
    company: str
    role: str
    rounds_description: str
    preparation_tips: Optional[str] = None

class InterviewExperienceCreate(InterviewExperienceBase):
    pass

class InterviewExperienceResponse(InterviewExperienceBase):
    id: int
    user_id: int
    ai_summary: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class CampusEventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str # hackathon, workshop, coding_contest, drive
    event_date: datetime

class CampusEventCreate(CampusEventBase):
    pass

class CampusEventResponse(CampusEventBase):
    id: int
    registration_count: int
    class Config:
        from_attributes = True

class AnnouncementBase(BaseModel):
    title: str
    content: str
    announcement_type: str # exam, holiday, placement, general

class AnnouncementCreate(AnnouncementBase):
    pass

class AnnouncementResponse(AnnouncementBase):
    id: int
    publisher_id: int
    created_at: datetime
    class Config:
        from_attributes = True

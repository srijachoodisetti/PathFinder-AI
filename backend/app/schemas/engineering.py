from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

class BranchBase(BaseModel):
    name: str
    code: str
    department_id: int

class BranchCreate(BranchBase):
    pass

class BranchResponse(BranchBase):
    id: int
    class Config:
        from_attributes = True

class SemesterBase(BaseModel):
    branch_id: int
    semester_number: int

class SemesterCreate(SemesterBase):
    pass

class SemesterResponse(SemesterBase):
    id: int
    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    semester_id: int
    name: str
    code: str

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    class Config:
        from_attributes = True

class UnitBase(BaseModel):
    subject_id: int
    name: str
    unit_number: int

class UnitCreate(UnitBase):
    pass

class UnitResponse(UnitBase):
    id: int
    class Config:
        from_attributes = True

class TopicBase(BaseModel):
    unit_id: int
    name: str
    description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
    id: int
    class Config:
        from_attributes = True

class TopicResourceBase(BaseModel):
    topic_id: int
    resource_type: str
    title: str
    content: Optional[str] = None
    file_url: Optional[str] = None

class TopicResourceCreate(TopicResourceBase):
    pass

class TopicResourceResponse(TopicResourceBase):
    id: int
    class Config:
        from_attributes = True

class VideoResourceBase(BaseModel):
    topic_id: int
    course_title: str
    instructor: Optional[str] = None
    platform: str
    duration: Optional[str] = None
    difficulty: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_url: str
    description: Optional[str] = None

class VideoResourceCreate(VideoResourceBase):
    pass

class VideoResourceResponse(VideoResourceBase):
    id: int
    class Config:
        from_attributes = True

class CodingProgressBase(BaseModel):
    language: str
    problem_name: str
    code_content: str
    status: Optional[str] = "solved"
    complexity_analysis: Optional[str] = None

class CodingProgressCreate(CodingProgressBase):
    pass

class CodingProgressResponse(CodingProgressBase):
    id: int
    user_id: int
    solved_at: datetime
    class Config:
        from_attributes = True

class ProjectRecordBase(BaseModel):
    title: str
    description: Optional[str] = None
    project_type: str
    github_url: Optional[str] = None
    documentation_markdown: Optional[str] = None
    architecture_diagram_url: Optional[str] = None

class ProjectRecordCreate(ProjectRecordBase):
    pass

class ProjectRecordResponse(ProjectRecordBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CertificateRecordBase(BaseModel):
    title: str
    issuer: str
    status: Optional[str] = "completed"
    credential_url: Optional[str] = None

class CertificateRecordCreate(CertificateRecordBase):
    pass

class CertificateRecordResponse(CertificateRecordBase):
    id: int
    user_id: int
    date_earned: Optional[datetime] = None
    class Config:
        from_attributes = True

class InternshipRecordBase(BaseModel):
    company: str
    role: str
    status: Optional[str] = "applied"
    details_url: Optional[str] = None
    notes: Optional[str] = None

class InternshipRecordCreate(InternshipRecordBase):
    pass

class InternshipRecordResponse(InternshipRecordBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class CareerRoadmapBase(BaseModel):
    domain: str
    steps_json: str
    target_role: Optional[str] = None

class CareerRoadmapCreate(CareerRoadmapBase):
    pass

class CareerRoadmapResponse(CareerRoadmapBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

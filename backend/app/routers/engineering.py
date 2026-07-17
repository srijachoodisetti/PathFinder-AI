from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user, get_current_active_teacher
from app.models.user import User
from app.models.engineering import (
    Department, Branch, Semester, Subject, Unit, Topic,
    TopicResource, VideoResource, CodingProgress, ProjectRecord,
    CertificateRecord, InternshipRecord, CareerRoadmap
)
from app.schemas.engineering import (
    DepartmentCreate, DepartmentResponse,
    BranchCreate, BranchResponse,
    SemesterCreate, SemesterResponse,
    SubjectCreate, SubjectResponse,
    UnitCreate, UnitResponse,
    TopicCreate, TopicResponse,
    TopicResourceCreate, TopicResourceResponse,
    VideoResourceCreate, VideoResourceResponse,
    CodingProgressCreate, CodingProgressResponse,
    ProjectRecordCreate, ProjectRecordResponse,
    CertificateRecordCreate, CertificateRecordResponse,
    InternshipRecordCreate, InternshipRecordResponse,
    CareerRoadmapCreate, CareerRoadmapResponse
)
from typing import List, Optional
import json

router = APIRouter()

# --- Departments ---
@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).all()

@router.post("/departments", response_model=DepartmentResponse)
def create_department(data: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_dept = Department(name=data.name, description=data.description)
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

# --- Branches ---
@router.get("/branches", response_model=List[BranchResponse])
def get_branches(department_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Branch)
    if department_id:
        query = query.filter(Branch.department_id == department_id)
    return query.all()

@router.post("/branches", response_model=BranchResponse)
def create_branch(data: BranchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_branch = Branch(name=data.name, code=data.code, department_id=data.department_id)
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

# --- Semesters ---
@router.get("/semesters", response_model=List[SemesterResponse])
def get_semesters(branch_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Semester)
    if branch_id:
        query = query.filter(Semester.branch_id == branch_id)
    return query.all()

@router.post("/semesters", response_model=SemesterResponse)
def create_semester(data: SemesterCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_sem = Semester(branch_id=data.branch_id, semester_number=data.semester_number)
    db.add(db_sem)
    db.commit()
    db.refresh(db_sem)
    return db_sem

# --- Subjects ---
@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(semester_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Subject)
    if semester_id:
        query = query.filter(Subject.semester_id == semester_id)
    return query.all()

@router.post("/subjects", response_model=SubjectResponse)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_subj = Subject(name=data.name, code=data.code, semester_id=data.semester_id)
    db.add(db_subj)
    db.commit()
    db.refresh(db_subj)
    return db_subj

# --- Units ---
@router.get("/units", response_model=List[UnitResponse])
def get_units(subject_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Unit)
    if subject_id:
        query = query.filter(Unit.subject_id == subject_id)
    return query.all()

@router.post("/units", response_model=UnitResponse)
def create_unit(data: UnitCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_unit = Unit(name=data.name, unit_number=data.unit_number, subject_id=data.subject_id)
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit

# --- Topics ---
@router.get("/topics", response_model=List[TopicResponse])
def get_topics(unit_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Topic)
    if unit_id:
        query = query.filter(Topic.unit_id == unit_id)
    return query.all()

@router.post("/topics", response_model=TopicResponse)
def create_topic(data: TopicCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_topic = Topic(name=data.name, description=data.description, unit_id=data.unit_id)
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

# --- Topic Resources (Notes, PPTs, Formulas, PYQs, Lab programs) ---
@router.get("/topics/{topic_id}/resources", response_model=List[TopicResourceResponse])
def get_topic_resources(topic_id: int, resource_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(TopicResource).filter(TopicResource.topic_id == topic_id)
    if resource_type:
        query = query.filter(TopicResource.resource_type == resource_type)
    return query.all()

@router.post("/topics/{topic_id}/resources", response_model=TopicResourceResponse)
def create_topic_resource(topic_id: int, data: TopicResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_res = TopicResource(
        topic_id=topic_id,
        resource_type=data.resource_type,
        title=data.title,
        content=data.content,
        file_url=data.file_url
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

# --- Video Resources (NPTEL, MIT, CS50, freeCodeCamp, AWS) ---
@router.get("/topics/{topic_id}/videos", response_model=List[VideoResourceResponse])
def get_topic_videos(topic_id: int, db: Session = Depends(get_db)):
    return db.query(VideoResource).filter(VideoResource.topic_id == topic_id).all()

@router.post("/topics/{topic_id}/videos", response_model=VideoResourceResponse)
def create_video_resource(topic_id: int, data: VideoResourceCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_teacher)):
    db_vid = VideoResource(
        topic_id=topic_id,
        course_title=data.course_title,
        instructor=data.instructor,
        platform=data.platform,
        duration=data.duration,
        difficulty=data.difficulty,
        thumbnail_url=data.thumbnail_url,
        video_url=data.video_url,
        description=data.description
    )
    db.add(db_vid)
    db.commit()
    db.refresh(db_vid)
    return db_vid

# --- Coding Progress ---
@router.get("/coding/progress", response_model=List[CodingProgressResponse])
def get_user_coding_progress(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CodingProgress).filter(CodingProgress.user_id == current_user.id).all()

@router.post("/coding/save", response_model=CodingProgressResponse)
def save_coding_progress(data: CodingProgressCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if entry already exists to update
    db_entry = db.query(CodingProgress).filter(
        CodingProgress.user_id == current_user.id,
        CodingProgress.problem_name == data.problem_name,
        CodingProgress.language == data.language
    ).first()
    
    if db_entry:
        db_entry.code_content = data.code_content
        db_entry.status = data.status
        db_entry.complexity_analysis = data.complexity_analysis
    else:
        db_entry = CodingProgress(
            user_id=current_user.id,
            language=data.language,
            problem_name=data.problem_name,
            code_content=data.code_content,
            status=data.status,
            complexity_analysis=data.complexity_analysis
        )
        db.add(db_entry)
        
    db.commit()
    db.refresh(db_entry)
    return db_entry

# --- Project Records ---
@router.get("/projects", response_model=List[ProjectRecordResponse])
def get_user_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(ProjectRecord).filter(ProjectRecord.user_id == current_user.id).all()

@router.post("/projects", response_model=ProjectRecordResponse)
def create_project_record(data: ProjectRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_proj = ProjectRecord(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        project_type=data.project_type,
        github_url=data.github_url,
        documentation_markdown=data.documentation_markdown,
        architecture_diagram_url=data.architecture_diagram_url
    )
    db.add(db_proj)
    db.commit()
    db.refresh(db_proj)
    return db_proj

# --- Certificate Records ---
@router.get("/certificates", response_model=List[CertificateRecordResponse])
def get_user_certificates(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CertificateRecord).filter(CertificateRecord.user_id == current_user.id).all()

@router.post("/certificates", response_model=CertificateRecordResponse)
def create_certificate_record(data: CertificateRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_cert = CertificateRecord(
        user_id=current_user.id,
        title=data.title,
        issuer=data.issuer,
        status=data.status,
        credential_url=data.credential_url
    )
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

# --- Internship Records ---
@router.get("/internships", response_model=List[InternshipRecordResponse])
def get_user_internships(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InternshipRecord).filter(InternshipRecord.user_id == current_user.id).all()

@router.post("/internships", response_model=InternshipRecordResponse)
def create_internship_record(data: InternshipRecordCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_intern = InternshipRecord(
        user_id=current_user.id,
        company=data.company,
        role=data.role,
        status=data.status,
        details_url=data.details_url,
        notes=data.notes
    )
    db.add(db_intern)
    db.commit()
    db.refresh(db_intern)
    return db_intern

# --- Career Roadmaps ---
@router.get("/career/roadmap", response_model=List[CareerRoadmapResponse])
def get_user_career_roadmaps(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CareerRoadmap).filter(CareerRoadmap.user_id == current_user.id).all()

@router.post("/career/roadmap", response_model=CareerRoadmapResponse)
def create_career_roadmap(data: CareerRoadmapCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_road = CareerRoadmap(
        user_id=current_user.id,
        domain=data.domain,
        steps_json=data.steps_json,
        target_role=data.target_role
    )
    db.add(db_road)
    db.commit()
    db.refresh(db_road)
    return db_road

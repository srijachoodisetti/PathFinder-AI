from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str  # student, teacher, parent, admin

class UserCreate(UserBase):
    password: str
    grade: Optional[str] = None  # for student
    subject_specialization: Optional[str] = None  # for teacher
    classes_managed: Optional[str] = None  # for teacher (comma separated grades)
    child_email: Optional[str] = None  # for parent to track child

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class StudentProfile(BaseModel):
    id: int
    grade: Optional[str] = None
    learning_goals: Optional[str] = None
    xp_points: int
    streak: int
    weak_topics: Optional[str] = None
    language_preference: str

    class Config:
        from_attributes = True

class TeacherProfile(BaseModel):
    id: int
    subject_specialization: Optional[str] = None
    classes_managed: Optional[str] = None

    class Config:
        from_attributes = True

class ParentProfile(BaseModel):
    id: int
    child_email: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    student_profile: Optional[StudentProfile] = None
    teacher_profile: Optional[TeacherProfile] = None
    parent_profile: Optional[ParentProfile] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

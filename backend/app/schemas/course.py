from pydantic import BaseModel
from typing import Optional, List

class LessonBase(BaseModel):
    title: str
    content_markdown: str
    video_url: Optional[str] = None
    is_offline_ready: bool = True
    sort_order: int = 0

class LessonCreate(LessonBase):
    course_id: int

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content_markdown: Optional[str] = None
    video_url: Optional[str] = None
    is_offline_ready: Optional[bool] = None
    sort_order: Optional[int] = None

class LessonResponse(LessonBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str  # Mathematics, Science, English, etc.
    year: str

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    year: Optional[str] = None

class CourseResponse(CourseBase):
    id: int
    created_by: Optional[int] = None
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse, LessonCreate, LessonUpdate, LessonResponse, LessonBase
from app.crud import course as crud_course
from app.routers.deps import get_current_user, get_current_active_teacher
from app.models.user import User
from typing import List, Optional, Any

router = APIRouter()

@router.get("/", response_model=List[CourseResponse])
def read_courses(
    subject: Optional[str] = None,
    grade: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve all courses. Optionally filter by subject and grade.
    """
    if subject:
        return crud_course.get_courses_by_subject(db, subject=subject, grade=grade)
    return crud_course.get_courses(db)

@router.get("/{course_id}", response_model=CourseResponse)
def read_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get course by ID.
    """
    db_course = crud_course.get_course(db, course_id=course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

@router.post("/", response_model=CourseResponse)
def create_new_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Create a new course (Educators only).
    """
    return crud_course.create_course(db, course_in=course_in, teacher_id=current_user.id)

@router.put("/{course_id}", response_model=CourseResponse)
def update_existing_course(
    course_id: int,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Update a course (Educators only).
    """
    db_course = crud_course.get_course(db, course_id=course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return crud_course.update_course(db, db_course=db_course, course_in=course_in)

@router.delete("/{course_id}")
def delete_existing_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Delete a course (Educators only).
    """
    success = crud_course.delete_course(db, course_id=course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# Lesson Endpoints
@router.post("/{course_id}/lessons", response_model=LessonResponse)
def create_new_lesson(
    course_id: int,
    lesson_in: LessonBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Add a lesson to a course.
    """
    db_course = crud_course.get_course(db, course_id=course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    full_lesson_in = LessonCreate(
        course_id=course_id,
        title=lesson_in.title,
        content_markdown=lesson_in.content_markdown,
        video_url=lesson_in.video_url,
        is_offline_ready=lesson_in.is_offline_ready,
        sort_order=lesson_in.sort_order
    )
    return crud_course.create_lesson(db, lesson_in=full_lesson_in)

@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
def update_existing_lesson(
    lesson_id: int,
    lesson_in: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Update a lesson content.
    """
    db_lesson = crud_course.get_lesson(db, lesson_id=lesson_id)
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return crud_course.update_lesson(db, db_lesson=db_lesson, lesson_in=lesson_in)

@router.delete("/lessons/{lesson_id}")
def delete_existing_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Delete a lesson.
    """
    success = crud_course.delete_lesson(db, lesson_id=lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Lesson deleted successfully"}

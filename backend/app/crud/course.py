from sqlalchemy.orm import Session
from typing import Optional
from app.models.course import Course, Lesson
from app.schemas.course import CourseCreate, CourseUpdate, LessonCreate, LessonUpdate

def get_course(db: Session, course_id: int):
    return db.query(Course).filter(Course.id == course_id).first()

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Course).offset(skip).limit(limit).all()

def get_courses_by_subject(db: Session, subject: str, year: Optional[str] = None):
    query = db.query(Course).filter(Course.subject == subject)
    if year:
        query = query.filter(Course.year == year)
    return query.all()

def create_course(db: Session, course_in: CourseCreate, teacher_id: int):
    db_course = Course(
        title=course_in.title,
        description=course_in.description,
        subject=course_in.subject,
        year=course_in.year,
        created_by=teacher_id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_course(db: Session, db_course: Course, course_in: CourseUpdate):
    for field, value in course_in.dict(exclude_unset=True).items():
        setattr(db_course, field, value)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def delete_course(db: Session, course_id: int):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    return False

# Lesson CRUD
def get_lesson(db: Session, lesson_id: int):
    return db.query(Lesson).filter(Lesson.id == lesson_id).first()

def create_lesson(db: Session, lesson_in: LessonCreate):
    db_lesson = Lesson(
        course_id=lesson_in.course_id,
        title=lesson_in.title,
        content_markdown=lesson_in.content_markdown,
        video_url=lesson_in.video_url,
        is_offline_ready=lesson_in.is_offline_ready,
        sort_order=lesson_in.sort_order
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def update_lesson(db: Session, db_lesson: Lesson, lesson_in: LessonUpdate):
    for field, value in lesson_in.dict(exclude_unset=True).items():
        setattr(db_lesson, field, value)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def delete_lesson(db: Session, lesson_id: int):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if db_lesson:
        db.delete(db_lesson)
        db.commit()
        return True
    return False

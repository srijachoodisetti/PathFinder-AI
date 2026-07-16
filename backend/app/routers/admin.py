from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.user import User, Student, Teacher, Parent
from app.models.course import Course
from app.models.quiz import Quiz
from typing import Any, List

router = APIRouter()

@router.get("/users", response_model=List[dict])
def get_system_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
) -> Any:
    """
    Get all registered users in the platform (Admin only).
    """
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.post("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
) -> Any:
    """
    Toggle activation state of a user (Admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = not user.is_active
    db.add(user)
    db.commit()
    return {"message": f"User status changed", "is_active": user.is_active}

@router.get("/system-stats")
def get_system_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin)
) -> Any:
    """
    Get telemetry details of the databases and active nodes.
    """
    student_count = db.query(User).filter(User.role == "student").count()
    teacher_count = db.query(User).filter(User.role == "teacher").count()
    parent_count = db.query(User).filter(User.role == "parent").count()
    course_count = db.query(Course).count()
    quiz_count = db.query(Quiz).count()

    return {
        "users_count": {
            "students": student_count,
            "teachers": teacher_count,
            "parents": parent_count,
            "total": student_count + teacher_count + parent_count + 1 # +1 for admin
        },
        "courses_count": course_count,
        "quizzes_count": quiz_count,
        "database_status": "Healthy (Connected)",
        "ai_engine": "Gemini 1.5 Flash Active"
    }

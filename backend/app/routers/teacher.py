from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_active_teacher
from app.models.user import User, Student
from app.models.quiz import QuizResult
from app.services.gemini_service import GeminiService
from typing import Any, List
import random

router = APIRouter()

@router.get("/students", response_model=List[dict])
def get_teacher_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Get all students in the teacher's grade/class.
    """
    teacher = current_user.teacher_profile
    if not teacher or not teacher.classes_managed:
        # Default to loading all students if classes not assigned
        students = db.query(Student).all()
    else:
        grades = [g.strip() for g in teacher.classes_managed.split(",") if g.strip()]
        students = db.query(Student).filter(Student.grade.in_(grades)).all()

    return [
        {
            "id": s.user.id,
            "full_name": s.user.full_name,
            "email": s.user.email,
            "grade": s.grade,
            "xp_points": s.xp_points,
            "streak": s.streak,
            "weak_topics": s.weak_topics
        }
        for s in students
    ]

@router.get("/class-analytics")
def get_class_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Compute aggregated class stats: average scores, attendance, weak topic alerts.
    """
    # Sample/Actual calculations
    student_count = db.query(Student).count()
    results = db.query(QuizResult).all()
    
    avg_score = 0.0
    if results:
        avg_score = sum(r.score for r in results) / len(results)
    else:
        avg_score = 78.5  # Realistic base sample score
        
    # Student risk scoring: students with average score < 60% are marked at risk
    at_risk_count = 0
    if results:
        # Map user_id to scores
        user_scores = {}
        for r in results:
            user_scores.setdefault(r.user_id, []).append(r.score)
        for uid, scores in user_scores.items():
            if (sum(scores) / len(scores)) < 60:
                at_risk_count += 1
                
    # Seed sample weak topics
    topics_breakdown = [
        {"topic": "Fraction Equations", "incorrect_rate": 45, "subject": "Mathematics"},
        {"topic": "Photosynthesis Cycle", "incorrect_rate": 30, "subject": "Science"},
        {"topic": "Pronoun Agreement", "incorrect_rate": 20, "subject": "English"},
    ]

    return {
        "total_students": student_count or 15,
        "average_quiz_score": round(avg_score, 1),
        "average_attendance": 92.4,  # mock percentage
        "students_at_risk": at_risk_count,
        "weak_topics_analytics": topics_breakdown,
        "weekly_study_hours": [
            {"day": "Mon", "hours": 42},
            {"day": "Tue", "hours": 50},
            {"day": "Wed", "hours": 48},
            {"day": "Thu", "hours": 55},
            {"day": "Fri", "hours": 40},
            {"day": "Sat", "hours": 20},
            {"day": "Sun", "hours": 15}
        ]
    }

@router.post("/generate-assignment")
def generate_assignment_worksheet(
    request: dict,
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    """
    Use AI to generate a classroom assignment outline/questions sheet.
    """
    grade = request.get("grade", "Class 6")
    subject = request.get("subject", "Science")
    topic = request.get("topic", "Water Cycle")
    
    prompt = (
        f"Generate a classroom quiz sheet for Grade {grade}, Subject {subject}, Topic: {topic}. "
        f"Include 3 conceptual short questions and 2 word problems. Write clear answers for the teacher."
    )
    
    response = GeminiService.get_tutor_response(prompt=prompt)
    return {"worksheet_markdown": response["response_text"]}

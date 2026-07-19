from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.personalization import RecommendationResponse
from app.routers.deps import get_current_user
from app.models.user import User, Student
from app.models.course import Course
from app.models.activity import Achievement, Notification
from app.models.quiz import QuizResult
from app.crud.user import update_student_streak, update_student_weak_topics
from app.services.gemini_service import GeminiService
from typing import List, Any
import json

router = APIRouter()

@router.get("/recommendations", response_model=RecommendationResponse)
def get_personalized_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    courses = db.query(Course).all()
    recommended_courses = []
    
    # Simple recommendation selector: if student has weak topics, matches subject
    if courses:
        for c in courses[:2]:
            recommended_courses.append({
                "id": c.id,
                "title": c.title,
                "subject": c.subject,
                "description": c.description,
                "year": c.year
            })
            
    weak_topics_list = ["Fraction Division", "Soil Nutrients"]
    if student.weak_topics:
        weak_topics_list = [t.strip() for t in student.weak_topics.split(",") if t.strip()]

    return {
        "recommended_courses": recommended_courses,
        "weak_topics": weak_topics_list,
        "xp_points": student.xp_points,
        "streak": student.streak
    }

@router.post("/claim-streak")
def claim_streak(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    new_streak = student.streak + 1
    update_student_streak(db, student_id=student.id, streak_value=new_streak)
    
    notif = Notification(
        user_id=current_user.id,
        title="Streak Extended! 🔥",
        message=f"You have kept your learning streak alive! Current streak: {new_streak} days."
    )
    db.add(notif)
    db.commit()
    
    return {"message": "Streak updated", "streak": new_streak}

@router.get("/achievements", response_model=List[dict])
def get_student_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).all()
    if not achievements:
        first_achievement = Achievement(
            user_id=current_user.id,
            title="Pioneer Learner 🌱",
            description="Started the PathFinder learning journey.",
            badge_icon="Compass"
        )
        db.add(first_achievement)
        db.commit()
        achievements = [first_achievement]

    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "badge_icon": a.badge_icon,
            "unlocked_at": a.unlocked_at
        }
        for a in achievements
    ]

@router.put("/profile")
def update_profile(
    profile_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    if "language_preference" in profile_data:
        student.language_preference = profile_data["language_preference"]
    if "learning_goals" in profile_data:
        student.learning_goals = profile_data["learning_goals"]
    if "year" in profile_data:
        student.year = profile_data["year"]
    if "weak_topics" in profile_data:
        student.weak_topics = profile_data["weak_topics"]
        
    db.add(student)
    db.commit()
    return {"message": "Profile updated successfully"}

@router.get("/notifications", response_model=List[dict])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifs
    ]

@router.get("/motivation")
def get_daily_motivation(current_user: User = Depends(get_current_user)) -> Any:
    """
    Get a custom motivating quote for students.
    """
    quote = GeminiService.get_motivation()
    return {"quote": quote}

@router.get("/habit-analysis")
def get_student_habit_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Run habit analyzer on student's past quiz results.
    """
    results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    scores = [r.score for r in results]
    analysis = GeminiService.analyze_habits(scores)
    return analysis

@router.get("/goals")
def get_study_goals(current_user: User = Depends(get_current_user)) -> Any:
    """
    Retrieve daily & weekly hours goals. Parses learning_goals JSON or returns defaults.
    """
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    
    default_goals = {
        "daily_hour_goal": 2.0,
        "weekly_xp_goal": 300,
        "completed_today_hours": 1.2
    }
    
    try:
        if student.learning_goals and student.learning_goals.startswith("{"):
            parsed = json.loads(student.learning_goals)
            return {**default_goals, **parsed}
    except Exception:
        pass
        
    return default_goals

@router.put("/goals")
def save_study_goals(
    goals_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Update target study goals.
    """
    student = current_user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    student.learning_goals = json.dumps(goals_data)
    db.add(student)
    db.commit()
    return {"message": "Goals updated successfully"}

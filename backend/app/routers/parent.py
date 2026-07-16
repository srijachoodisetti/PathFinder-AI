from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User, Student
from app.models.quiz import QuizResult
from app.services.speech_service import SpeechService
from app.services.gemini_service import GeminiService
from typing import Any

router = APIRouter()

@router.get("/child-progress")
def get_child_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get detailed progress metrics of the student linked to this parent.
    """
    parent = current_user.parent_profile
    if not parent or not parent.child_email:
        raise HTTPException(status_code=400, detail="No child email is associated with this parent account")
        
    # Find child
    child_user = db.query(User).filter(User.email == parent.child_email, User.role == "student").first()
    if not child_user or not child_user.student_profile:
        return {
            "linked": False,
            "child_email": parent.child_email,
            "message": "Child account not found in database yet. Please register the child using this email."
        }

    student = child_user.student_profile
    attempts = db.query(QuizResult).filter(QuizResult.user_id == child_user.id).all()
    
    avg_score = 0
    if attempts:
        avg_score = sum(a.score for a in attempts) / len(attempts)
        
    return {
        "linked": True,
        "child_name": child_user.full_name,
        "child_email": child_user.email,
        "grade": student.grade,
        "xp_points": student.xp_points,
        "streak": student.streak,
        "weak_topics": student.weak_topics,
        "average_score": round(avg_score, 1),
        "recent_attempts": [
            {
                "quiz_title": a.quiz.title,
                "score": a.score,
                "completed_at": a.completed_at
            }
            for a in attempts[-5:]  # Get last 5 attempts
        ]
    }

@router.post("/voice-report")
def generate_parent_voice_report(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Generate a spoken vocal report of child progress translated to parent's language.
    """
    language = request.get("language", "Hindi")
    parent = current_user.parent_profile
    if not parent or not parent.child_email:
        raise HTTPException(status_code=400, detail="No child email is associated with this parent account")

    child_user = db.query(User).filter(User.email == parent.child_email).first()
    if not child_user or not child_user.student_profile:
        raise HTTPException(status_code=404, detail="Child profile not found")

    student = child_user.student_profile
    
    # Generate progress text summary
    progress_summary = (
        f"Hello. This is PathFinder AI progress report for your child {child_user.full_name}. "
        f"They have earned {student.xp_points} learning points and maintained a streak of {student.streak} days. "
        f"They are doing great in class, keep supporting them!"
    )
    
    # Translate report text into parent local tongue
    translated_summary = GeminiService.translate_text(progress_summary, language)
    
    # Create speech audio url
    audio_url = SpeechService.get_tts_url(translated_summary, language_code=language)
    
    return {
        "report_text": translated_summary,
        "audio_url": audio_url
    }

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.tutor import ChatPrompt, ChatResponse, LessonPlanRequest, LessonPlanResponse
from app.services.gemini_service import GeminiService
from app.services.speech_service import SpeechService
from app.routers.deps import get_current_user
from app.models.activity import Message
from app.models.user import User
from typing import List, Any, Dict
import json

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def tutor_chat(
    prompt_in: ChatPrompt,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Submit a prompt to the AI Tutor.
    Includes last 5 messages as conversation memory for context awareness.
    """
    # 1. Fetch conversation history for memory (last 5 messages)
    history_logs = db.query(Message).filter(
        Message.user_id == current_user.id
    ).order_by(Message.created_at.desc()).limit(5).all()
    
    # Format history (reverse to chronologically ascending)
    history_context = [
        {"is_from_user": m.is_from_user, "content": m.content}
        for m in reversed(history_logs)
    ]

    # 2. Save current user message
    user_msg = Message(
        user_id=current_user.id,
        content=prompt_in.prompt,
        is_from_user=True
    )
    db.add(user_msg)
    db.commit()

    # 3. Query Gemini with history
    ai_result = GeminiService.get_tutor_response(
        prompt=prompt_in.prompt,
        image_base64=prompt_in.image_base64,
        language=prompt_in.language,
        history=history_context
    )

    response_text = ai_result["response_text"]
    translated_text = ai_result["translated_text"]

    # 4. Generate audio readout URL if requested
    audio_url = None
    if prompt_in.voice_output_requested:
        audio_url = SpeechService.get_tts_url(translated_text, language_code=prompt_in.language)

    # 5. Save AI reply
    ai_msg = Message(
        user_id=current_user.id,
        content=response_text,
        is_from_user=False,
        audio_url=audio_url,
        translated_content=translated_text if prompt_in.language.lower() != "english" else None
    )
    db.add(ai_msg)
    db.commit()

    return {
        "response_text": response_text,
        "translated_text": translated_text,
        "audio_url": audio_url,
        "step_by_step_explanation": ai_result["step_by_step_explanation"],
        "practice_questions": ai_result["practice_questions"]
    }

@router.get("/history", response_model=List[Dict[str, Any]])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Retrieve message history.
    """
    history = db.query(Message).filter(Message.user_id == current_user.id).order_by(Message.created_at.asc()).all()
    return [
        {
            "id": m.id,
            "content": m.content,
            "is_from_user": m.is_from_user,
            "audio_url": m.audio_url,
            "translated_content": m.translated_content,
            "is_bookmarked": m.is_bookmarked,
            "created_at": m.created_at
        }
        for m in history
    ]

@router.post("/bookmark/{message_id}")
def toggle_bookmark(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    msg = db.query(Message).filter(Message.id == message_id, Message.user_id == current_user.id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    msg.is_bookmarked = not msg.is_bookmarked
    db.add(msg)
    db.commit()
    return {"message": "Bookmark updated", "is_bookmarked": msg.is_bookmarked}

@router.get("/bookmarks", response_model=List[Dict[str, Any]])
def get_bookmarked_explanations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    bookmarked = db.query(Message).filter(
        Message.user_id == current_user.id,
        Message.is_bookmarked == True
    ).order_by(Message.created_at.desc()).all()
    
    return [
        {
            "id": m.id,
            "content": m.content,
            "translated_content": m.translated_content,
            "created_at": m.created_at
        }
        for m in bookmarked
    ]

@router.post("/lesson-plan", response_model=LessonPlanResponse)
def generate_tutor_lesson_plan(
    plan_in: LessonPlanRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role not in ["teacher", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    plan_md = GeminiService.generate_lesson_plan(
        year=plan_in.year,
        subject=plan_in.subject,
        topic=plan_in.topic,
        duration=plan_in.duration_minutes
    )
    return {"plan_markdown": plan_md}

@router.post("/flashcards")
def get_ai_flashcards(
    request: dict,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Endpoint to generate interactive revision flashcards.
    """
    subject = request.get("subject", "Science")
    topic = request.get("topic", "Solar Panels")
    return GeminiService.generate_flashcards(subject=subject, topic=topic)

@router.post("/mindmap")
def get_ai_mindmap(
    request: dict,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Endpoint to generate a structured nested mind map node list.
    """
    subject = request.get("subject", "Science")
    topic = request.get("topic", "Water Cycle")
    return GeminiService.generate_mindmap(subject=subject, topic=topic)

@router.post("/study-plan")
def get_ai_study_plan(
    request: dict,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Endpoint to generate a revision plan table.
    """
    year = request.get("year", "2nd Year")
    subject = request.get("subject", "Science")
    topic = request.get("topic", "Solar energy")
    plan = GeminiService.generate_study_plan(year=year, subject=subject, topic=topic)
    return {"plan": plan}

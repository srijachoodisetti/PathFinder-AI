from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageResponse(BaseModel):
    id: int
    user_id: int
    content: str
    is_from_user: bool
    audio_url: Optional[str] = None
    translated_content: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatPrompt(BaseModel):
    prompt: str
    language: str = "English"  # English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali
    voice_output_requested: bool = False
    image_base64: Optional[str] = None  # for OCR/Image upload

class ChatResponse(BaseModel):
    response_text: str
    translated_text: str
    audio_url: Optional[str] = None
    step_by_step_explanation: Optional[str] = None
    practice_questions: Optional[List[Dict[str, Any]]] = None

class LessonPlanRequest(BaseModel):
    grade: str
    subject: str
    topic: str
    duration_minutes: int = 45

class LessonPlanResponse(BaseModel):
    plan_markdown: str

class RecommendationResponse(BaseModel):
    recommended_courses: List[Dict[str, Any]]
    weak_topics: List[str]
    xp_points: int
    streak: int

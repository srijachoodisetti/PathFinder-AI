from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class QuestionSchema(BaseModel):
    id: str
    type: str  # mcq, fill_in_the_blanks, true_false, short_answer, coding
    question_text: str
    options: Optional[List[str]] = None  # for MCQ
    correct_answer: str
    explanation: Optional[str] = None

class QuizBase(BaseModel):
    title: str
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    xp_reward: int = 50

class QuizCreate(QuizBase):
    questions: List[QuestionSchema]

class QuizResponse(QuizBase):
    id: int
    questions: List[QuestionSchema]

    class Config:
        from_attributes = True

class QuizResultCreate(BaseModel):
    quiz_id: int
    score: int  # 0 to 100
    answers: Dict[str, str]  # question_id -> student_answer

class QuizResultResponse(BaseModel):
    id: int
    quiz_id: int
    user_id: int
    score: int
    answers_json: str
    completed_at: datetime
    quiz: Optional[QuizBase] = None

    class Config:
        from_attributes = True

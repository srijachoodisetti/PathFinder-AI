from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QuestionBankBase(BaseModel):
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    type: str # mcq, true_false, fill_blanks, short_answer, long_answer, numerical, coding, case_study, viva
    question_text: str
    options_json: Optional[str] = None
    correct_answer: str
    explanation: Optional[str] = None
    difficulty: Optional[str] = "Medium"
    sample_input: Optional[str] = None
    sample_output: Optional[str] = None
    test_cases_json: Optional[str] = None

class QuestionBankCreate(QuestionBankBase):
    pass

class QuestionBankResponse(QuestionBankBase):
    id: int
    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    title: str
    exam_type: str # unit, internal, semester, placement, coding, lab
    time_limit_minutes: int
    negative_marking: float
    random_questions: bool
    is_active: bool

class ExamCreate(ExamBase):
    question_ids: List[int] = []

class ExamResponse(ExamBase):
    id: int
    creator_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True

class StudentAnswerBase(BaseModel):
    question_id: int
    answered_text: Optional[str] = None

class StudentAnswerCreate(StudentAnswerBase):
    pass

class StudentAnswerResponse(StudentAnswerBase):
    id: int
    is_correct: bool
    marks_awarded: float
    ai_feedback: Optional[str] = None
    class Config:
        from_attributes = True

class StudentExamBase(BaseModel):
    exam_id: int

class StudentExamCreate(StudentExamBase):
    pass

class StudentExamResponse(StudentExamBase):
    id: int
    user_id: int
    status: str
    score: float
    started_at: datetime
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class StudentAnswerSubmit(BaseModel):
    question_id: int
    answered_text: str

class ExamSubmission(BaseModel):
    answers: List[StudentAnswerSubmit]

class ExamResultResponse(BaseModel):
    id: int
    student_exam_id: int
    total_score: float
    percentage: float
    subject_analysis_json: Optional[str] = None
    difficulty_analysis_json: Optional[str] = None
    ai_feedback: Optional[str] = None
    class Config:
        from_attributes = True

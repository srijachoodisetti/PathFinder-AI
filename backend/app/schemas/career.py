from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ResumeAnalysisResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    ats_score: float
    resume_strength: Optional[str] = None
    uploaded_at: datetime
    resume_url: Optional[str] = None
    class Config:
        from_attributes = True


class ATSFeedbackResponse(BaseModel):
    id: int
    analysis_id: int
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    missing_keywords: Optional[str] = None
    formatting_issues: Optional[str] = None
    grammar_score: float
    overall_feedback: Optional[str] = None
    keyword_match_percent: float
    improvement_tips: Optional[str] = None
    recommended_certs: Optional[str] = None
    recommended_projects: Optional[str] = None
    class Config:
        from_attributes = True


class ResumeAnalysisWithFeedback(BaseModel):
    analysis: ResumeAnalysisResponse
    feedback: Optional[ATSFeedbackResponse] = None


class CareerSuggestionResponse(BaseModel):
    id: int
    user_id: int
    target_role: str
    recommended_skills: Optional[str] = None
    recommended_projects: Optional[str] = None
    recommended_certifications: Optional[str] = None
    recommended_courses: Optional[str] = None
    roadmap_text: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class ResumeHistoryResponse(BaseModel):
    id: int
    user_id: int
    file_name: str
    ats_score: float
    improvement: float
    uploaded_at: datetime
    analysis_id: Optional[int] = None
    class Config:
        from_attributes = True


class CareerDashboardResponse(BaseModel):
    latest_ats_score: float
    latest_resume_strength: str
    history: List[ResumeHistoryResponse]
    total_uploads: int


class GenerateRoadmapRequest(BaseModel):
    target_role: str
    branch: Optional[str] = "CSE"
    semester: Optional[int] = 6
    career_goal: Optional[str] = "placement"


class InterviewPrepRequest(BaseModel):
    target_role: str
    interview_type: str  # technical, hr, coding, mock
    difficulty: Optional[str] = "medium"


class InterviewHistoryResponse(BaseModel):
    id: int
    user_id: int
    target_role: str
    interview_type: str
    difficulty: str
    questions_json: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


class RoadmapHistoryResponse(BaseModel):
    id: int
    user_id: int
    target_role: str
    branch: Optional[str] = None
    semester: Optional[int] = None
    roadmap_text: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

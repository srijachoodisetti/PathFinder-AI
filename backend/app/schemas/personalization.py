from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class LearningHistoryBase(BaseModel):
    topic_id: int
    time_spent_minutes: int
    completion_percentage: float

class LearningHistoryCreate(LearningHistoryBase):
    pass

class LearningHistoryResponse(LearningHistoryBase):
    id: int
    user_id: int
    last_accessed: datetime
    class Config:
        from_attributes = True

class RecommendationRecordBase(BaseModel):
    category: str
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    difficulty: Optional[str] = None
    priority: Optional[str] = "Medium"
    reasons: Optional[str] = None

class RecommendationRecordCreate(RecommendationRecordBase):
    pass

class RecommendationRecordResponse(RecommendationRecordBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class StudentGoalBase(BaseModel):
    target_cgpa: float
    daily_study_hours: float
    weekly_xp_goal: int
    monthly_cert_goal: int

class StudentGoalCreate(StudentGoalBase):
    pass

class StudentGoalResponse(StudentGoalBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class LearningAnalyticBase(BaseModel):
    learning_hours: float
    quiz_scores_average: float
    coding_progress_count: int
    placement_readiness_score: float
    cgpa_growth: float
    attendance_percentage: float

class LearningAnalyticResponse(LearningAnalyticBase):
    id: int
    user_id: int
    date: datetime
    class Config:
        from_attributes = True

class RevisionScheduleBase(BaseModel):
    topic_id: int
    revision_type: str
    next_revision_date: datetime
    is_completed: bool

class RevisionScheduleCreate(RevisionScheduleBase):
    pass

class RevisionScheduleResponse(RevisionScheduleBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class SkillProgressBase(BaseModel):
    skill_name: str
    proficiency_level: int

class SkillProgressCreate(SkillProgressBase):
    pass

class SkillProgressResponse(SkillProgressBase):
    id: int
    user_id: int
    last_updated: datetime
    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    recommended_courses: List[Dict[str, Any]]
    weak_topics: List[str]
    xp_points: int
    streak: int


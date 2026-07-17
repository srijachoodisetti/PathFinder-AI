from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routers.deps import get_current_user
from app.models.user import User
from app.models.engineering import Topic, Subject, CodingProgress
from app.models.quiz import QuizResult, Quiz
from app.models.personalization import (
    LearningHistory, RecommendationRecord, StudentGoal,
    LearningAnalytic, RevisionSchedule, SkillProgress
)
from app.schemas.personalization import (
    StudentGoalCreate, StudentGoalResponse,
    LearningHistoryCreate, LearningHistoryResponse,
    RecommendationRecordResponse, LearningAnalyticResponse,
    RevisionScheduleResponse, SkillProgressResponse
)
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
import random

router = APIRouter()

@router.get("/recommendations", response_model=List[RecommendationRecordResponse])
def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    recs = db.query(RecommendationRecord).filter(RecommendationRecord.user_id == current_user.id).all()
    if not recs:
        # Generate some default mock recommendations if none exist
        default_recs = [
            RecommendationRecord(
                user_id=current_user.id,
                category="topic",
                title="Three-Schema Architecture",
                description="Read through the database architecture layers to bolster your Conceptual Data modeling skills.",
                url="/academic",
                difficulty="Beginner",
                priority="High",
                reasons="Required for DBMS Sem 5."
            ),
            RecommendationRecord(
                user_id=current_user.id,
                category="video",
                title="MIT 6.006 Lecture 1: Algorithms",
                description="Watch Prof. Erik Demaine introduce algorithmic analyses and Big O sorting bounds.",
                url="/videos",
                difficulty="Intermediate",
                priority="Medium",
                reasons="Improves time complexity scores."
            ),
            RecommendationRecord(
                user_id=current_user.id,
                category="coding",
                title="Solve Maximum Subarray Sum",
                description="Practice array pointer offsets and Kadane's dynamic programming optimizations.",
                url="/coding",
                difficulty="Medium",
                priority="High",
                reasons="Highly asked in Google / Amazon placement tests."
            ),
            RecommendationRecord(
                user_id=current_user.id,
                category="certification",
                title="AWS Cloud Practitioner Certification",
                description="Recommended for your Semester 5 path to cloud DevOps domains.",
                url="/certifications",
                difficulty="Beginner",
                priority="Medium",
                reasons="Aligns with target Cloud Engineer career path."
            )
        ]
        for dr in default_recs:
            db.add(dr)
        db.commit()
        recs = db.query(RecommendationRecord).filter(RecommendationRecord.user_id == current_user.id).all()
    return recs

@router.get("/learning-journey", response_model=Dict[str, Any])
def get_learning_journey(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Retrieve student goals
    goal = db.query(StudentGoal).filter(StudentGoal.user_id == current_user.id).first()
    if not goal:
        goal = StudentGoal(user_id=current_user.id)
        db.add(goal)
        db.commit()
        db.refresh(goal)
        
    # Weak topics check: Find quizzes where user scored under 60%
    quiz_results = db.query(QuizResult).filter(QuizResult.user_id == current_user.id).all()
    weak_subjects = []
    strong_subjects = []
    for qr in quiz_results:
        # Check parent quiz
        quiz = db.query(Quiz).filter(Quiz.id == qr.quiz_id).first()
        if quiz and quiz.course_id:
            # We map course subjects
            if qr.score < 60:
                weak_subjects.append("Database Management Systems")
            elif qr.score >= 80:
                strong_subjects.append("Mathematics (Fractions)")

    # Deduplicate
    weak_subjects = list(set(weak_subjects)) or ["Theory of Computation"]
    strong_subjects = list(set(strong_subjects)) or ["Database Management Systems"]

    return {
        "continue_learning": {
            "topic": "Three-Schema Architecture & Data Independence",
            "subject": "Database Management Systems",
            "completion_percentage": 45
        },
        "today_recommendation": "Read 'Functional Dependencies & Normalization' cheat sheet and solve 3 Practice SQL queries.",
        "weak_subjects": weak_subjects,
        "strong_subjects": strong_subjects,
        "revision_required": ["Entity-Relationship Model Keys"],
        "upcoming_deadlines": [
            {"title": "DBMS Lab Program 3 Submission", "due": "In 2 days"},
            {"title": "Theory of Computation Quiz 2", "due": "In 5 days"}
        ],
        "placement_readiness_score": 72,
        "goals": {
            "daily_target": goal.daily_study_hours,
            "weekly_xp_target": goal.weekly_xp_goal,
            "completed_today_hours": 1.2
        }
    }

@router.get("/goals", response_model=StudentGoalResponse)
def get_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(StudentGoal).filter(StudentGoal.user_id == current_user.id).first()
    if not goal:
        goal = StudentGoal(user_id=current_user.id)
        db.add(goal)
        db.commit()
        db.refresh(goal)
    return goal

@router.post("/goals", response_model=StudentGoalResponse)
def save_goals(data: StudentGoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(StudentGoal).filter(StudentGoal.user_id == current_user.id).first()
    if not goal:
        goal = StudentGoal(user_id=current_user.id)
        db.add(goal)
    
    goal.target_cgpa = data.target_cgpa
    goal.daily_study_hours = data.daily_study_hours
    goal.weekly_xp_goal = data.weekly_xp_goal
    goal.monthly_cert_goal = data.monthly_cert_goal
    
    db.commit()
    db.refresh(goal)
    return goal

@router.get("/learning-paths", response_model=List[Dict[str, Any]])
def get_learning_paths(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {
            "id": 1,
            "level": "Beginner",
            "topic": "Introduction to Databases & ER Diagrams",
            "duration": "2 hours",
            "priority": "High",
            "difficulty": "Easy",
            "completion": 100
        },
        {
            "id": 2,
            "level": "Intermediate",
            "topic": "SQL Joins & Normalization Bounds",
            "duration": "4 hours",
            "priority": "High",
            "difficulty": "Medium",
            "completion": 45
        },
        {
            "id": 3,
            "level": "Advanced",
            "topic": "Query Optimization & Concurrency Transactions",
            "duration": "6 hours",
            "priority": "Medium",
            "difficulty": "Hard",
            "completion": 0
        }
    ]

@router.get("/weak-topics", response_model=List[Dict[str, Any]])
def get_weak_topics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {
            "topic_id": 1,
            "name": "Entity-Relationship (ER) Keys Mapping",
            "quiz_score": 52,
            "time_spent_mins": 18,
            "suggested_videos": [
                {"title": "Gate Smashers: ER Model Cardinalities", "url": "https://youtube.com"}
            ]
        }
    ]

@router.get("/revision-schedule", response_model=List[RevisionScheduleResponse])
def get_revision_schedule(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    revs = db.query(RevisionSchedule).filter(RevisionSchedule.user_id == current_user.id).all()
    if not revs:
        # Seed default schedules
        t = db.query(Topic).first()
        topic_id = t.id if t else 1
        default_revs = [
            RevisionSchedule(
                user_id=current_user.id,
                topic_id=topic_id,
                revision_type="daily",
                next_revision_date=datetime.now(timezone.utc) + timedelta(days=1),
                is_completed=False
            ),
            RevisionSchedule(
                user_id=current_user.id,
                topic_id=topic_id,
                revision_type="weekly",
                next_revision_date=datetime.now(timezone.utc) + timedelta(days=7),
                is_completed=False
            )
        ]
        for dr in default_revs:
            db.add(dr)
        db.commit()
        revs = db.query(RevisionSchedule).filter(RevisionSchedule.user_id == current_user.id).all()
    return revs

@router.post("/history/log", response_model=LearningHistoryResponse)
def log_learning_history(data: LearningHistoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_hist = db.query(LearningHistory).filter(
        LearningHistory.user_id == current_user.id,
        LearningHistory.topic_id == data.topic_id
    ).first()
    
    if db_hist:
        db_hist.time_spent_minutes += data.time_spent_minutes
        db_hist.completion_percentage = data.completion_percentage
        db_hist.last_accessed = datetime.now(timezone.utc)
    else:
        db_hist = LearningHistory(
            user_id=current_user.id,
            topic_id=data.topic_id,
            time_spent_minutes=data.time_spent_minutes,
            completion_percentage=data.completion_percentage,
            last_accessed=datetime.now(timezone.utc)
        )
        db.add(db_hist)
        
    db.commit()
    db.refresh(db_hist)
    return db_hist

@router.get("/analytics", response_model=List[LearningAnalyticResponse])
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    an = db.query(LearningAnalytic).filter(LearningAnalytic.user_id == current_user.id).order_by(LearningAnalytic.date.asc()).all()
    if not an:
        # Create a series of weekly metrics
        for day_offset in range(7, 0, -1):
            date_val = datetime.now(timezone.utc) - timedelta(days=day_offset)
            entry = LearningAnalytic(
                user_id=current_user.id,
                date=date_val,
                learning_hours=round(random.uniform(0.5, 4.0), 1),
                quiz_scores_average=random.randint(60, 95),
                coding_progress_count=random.randint(1, 3),
                placement_readiness_score=70 + (7 - day_offset) * 2,
                cgpa_growth=8.1 + (7 - day_offset) * 0.05,
                attendance_percentage=78 + random.randint(-2, 4)
            )
            db.add(entry)
        db.commit()
        an = db.query(LearningAnalytic).filter(LearningAnalytic.user_id == current_user.id).order_by(LearningAnalytic.date.asc()).all()
    return an

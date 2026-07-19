from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.quiz import QuizCreate, QuizResponse, QuizResultCreate, QuizResultResponse
from app.crud import quiz as crud_quiz
from app.routers.deps import get_current_user, get_current_active_teacher
from app.models.user import User, Student
from app.models.quiz import Quiz, QuizResult
from typing import List, Any, Dict
import json

router = APIRouter()

@router.get("/", response_model=List[QuizResponse])
def read_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    quizzes = crud_quiz.get_quizzes(db)
    result = []
    for q in quizzes:
        result.append({
            "id": q.id,
            "title": q.title,
            "course_id": q.course_id,
            "lesson_id": q.lesson_id,
            "xp_reward": q.xp_reward,
            "questions": json.loads(q.questions_json)
        })
    return result

@router.get("/{quiz_id}", response_model=QuizResponse)
def read_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    q = crud_quiz.get_quiz(db, quiz_id=quiz_id)
    if not q:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return {
        "id": q.id,
        "title": q.title,
        "course_id": q.course_id,
        "lesson_id": q.lesson_id,
        "xp_reward": q.xp_reward,
        "questions": json.loads(q.questions_json)
    }

@router.post("/generate", response_model=QuizResponse)
def generate_ai_quiz(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_teacher)
) -> Any:
    subject = request.get("subject", "Science")
    topic = request.get("topic", "Water Cycle")
    title = request.get("title", f"AI Quiz: {topic}")
    course_id = request.get("course_id")
    lesson_id = request.get("lesson_id")
    count = request.get("count", 5)

    questions = GeminiService.generate_quiz(subject=subject, topic=topic, count=count)
    
    quiz_in = QuizCreate(
        title=title,
        course_id=course_id,
        lesson_id=lesson_id,
        questions=questions,
        xp_reward=20 * len(questions)
      )
    
    return crud_quiz.create_quiz(db, quiz_in=quiz_in)

@router.post("/{quiz_id}/submit")
def submit_quiz(
    quiz_id: int,
    result_in: QuizResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Submits student responses, calculates corrections, and outputs wrong answer analysis.
    Adds weak topic updates to student profile if the score is low.
    """
    if result_in.quiz_id != quiz_id:
        raise HTTPException(status_code=400, detail="Quiz ID mismatch")

    # 1. Fetch Quiz details
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz_questions = json.loads(quiz.questions_json)
    wrong_answers_analysis = []
    
    # 2. Compare answers and build review list
    for q in quiz_questions:
        student_ans = result_in.answers.get(q["id"])
        correct_ans = q.get("correct_answer")
        
        is_correct = False
        if student_ans and correct_ans and student_ans.strip().lower() == correct_ans.strip().lower():
            is_correct = True
            
        if not is_correct:
            wrong_answers_analysis.append({
                "question_id": q["id"],
                "question_text": q["question_text"],
                "your_answer": student_ans or "No response",
                "correct_answer": correct_ans,
                "explanation": q.get("explanation", "Review the lesson overview to understand this concept.")
            })

    # Save attempt in database
    result = crud_quiz.submit_quiz_result(db, result_in=result_in, user_id=current_user.id)
    
    # 3. Detect weak topics
    if result_in.score < 60:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            # Add topic to weak topics list
            current_weak = [t.strip() for t in student.weak_topics.split(",") if t.strip()] if student.weak_topics else []
            topic_to_add = quiz.title.replace("AI Quiz:", "").replace("Challenge 1", "").strip()
            if topic_to_add not in current_weak:
                current_weak.append(topic_to_add)
                student.weak_topics = ", ".join(current_weak)
                db.add(student)
                db.commit()

    return {
        "id": result.id,
        "quiz_id": result.quiz_id,
        "user_id": result.user_id,
        "score": result.score,
        "answers_json": result.answers_json,
        "completed_at": result.completed_at,
        "wrong_answers_analysis": wrong_answers_analysis,
        "quiz": {
            "title": quiz.title,
            "xp_reward": quiz.xp_reward
        }
    }

@router.get("/user/attempts", response_model=List[dict])
def get_user_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    results = crud_quiz.get_user_quiz_results(db, user_id=current_user.id)
    return [
        {
            "id": r.id,
            "quiz_id": r.quiz_id,
            "quiz_title": r.quiz.title,
            "score": r.score,
            "completed_at": r.completed_at
        }
        for r in results
    ]

@router.get("/analytics/leaderboard", response_model=List[dict])
def read_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    top_students = crud_quiz.get_leaderboard(db, limit=10)
    return [
        {
            "full_name": s.user.full_name,
            "xp_points": s.xp_points,
            "streak": s.streak,
            "year": s.year
        }
        for s in top_students
    ]

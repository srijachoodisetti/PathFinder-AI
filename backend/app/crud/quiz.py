from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.quiz import Quiz, QuizResult
from app.models.user import Student
from app.schemas.quiz import QuizCreate, QuizResultCreate
import json

def get_quiz(db: Session, quiz_id: int):
    return db.query(Quiz).filter(Quiz.id == quiz_id).first()

def get_quizzes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Quiz).offset(skip).limit(limit).all()

def create_quiz(db: Session, quiz_in: QuizCreate):
    questions_list = [q.dict() for q in quiz_in.questions]
    db_quiz = Quiz(
        title=quiz_in.title,
        course_id=quiz_in.course_id,
        lesson_id=quiz_in.lesson_id,
        questions_json=json.dumps(questions_list),
        xp_reward=quiz_in.xp_reward
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

def submit_quiz_result(db: Session, result_in: QuizResultCreate, user_id: int):
    db_result = QuizResult(
        quiz_id=result_in.quiz_id,
        user_id=user_id,
        score=result_in.score,
        answers_json=json.dumps(result_in.answers)
    )
    db.add(db_result)
    
    # Award XP if score is passing (e.g. >= 50%)
    quiz = db.query(Quiz).filter(Quiz.id == result_in.quiz_id).first()
    if quiz and result_in.score >= 50:
        student = db.query(Student).filter(Student.user_id == user_id).first()
        if student:
            # Grant proportional XP based on score
            xp_reward = int(quiz.xp_reward * (result_in.score / 100))
            student.xp_points += xp_reward
            db.add(student)

    db.commit()
    db.refresh(db_result)
    return db_result

def get_user_quiz_results(db: Session, user_id: int):
    return db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(desc(QuizResult.completed_at)).all()

def get_leaderboard(db: Session, limit: int = 10):
    # Join Student and User to get the highest XP scorers
    from app.models.user import User
    return db.query(Student).join(User).filter(User.role == "student").order_by(desc(Student.xp_points)).limit(limit).all()

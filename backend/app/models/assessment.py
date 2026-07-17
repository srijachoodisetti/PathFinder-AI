from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship as orm_relationship
from datetime import datetime, timezone
from app.core.database import Base

class QuestionBank(Base):
    __tablename__ = "question_bank"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="SET NULL"), nullable=True)
    type = Column(String, nullable=False) # mcq, true_false, fill_blanks, short_answer, long_answer, numerical, coding, case_study, viva
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=True) # JSON list for MCQ options
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="Medium") # Easy, Medium, Hard
    sample_input = Column(Text, nullable=True)
    sample_output = Column(Text, nullable=True)
    test_cases_json = Column(Text, nullable=True) # JSON list of dicts: {"input": "...", "output": "..."}

    subject = orm_relationship("Subject")
    topic = orm_relationship("Topic")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    exam_type = Column(String, nullable=False) # unit, internal, semester, placement, coding, lab
    time_limit_minutes = Column(Integer, default=60)
    negative_marking = Column(Float, default=0.0)
    random_questions = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    creator = orm_relationship("User")
    questions = orm_relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan")

class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)

    exam = orm_relationship("Exam", back_populates="questions")
    question = orm_relationship("QuestionBank")

class StudentExam(Base):
    __tablename__ = "student_exams"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="started") # started, completed
    score = Column(Float, default=0.0)
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    user = orm_relationship("User")
    exam = orm_relationship("Exam")
    answers = orm_relationship("StudentAnswer", back_populates="student_exam", cascade="all, delete-orphan")

class StudentAnswer(Base):
    __tablename__ = "student_answers"
    id = Column(Integer, primary_key=True, index=True)
    student_exam_id = Column(Integer, ForeignKey("student_exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    answered_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, default=False)
    marks_awarded = Column(Float, default=0.0)
    ai_feedback = Column(Text, nullable=True)

    student_exam = orm_relationship("StudentExam", back_populates="answers")
    question = orm_relationship("QuestionBank")

class ExamResult(Base):
    __tablename__ = "exam_results"
    id = Column(Integer, primary_key=True, index=True)
    student_exam_id = Column(Integer, ForeignKey("student_exams.id", ondelete="CASCADE"), nullable=False)
    total_score = Column(Float, default=0.0)
    percentage = Column(Float, default=0.0)
    subject_analysis_json = Column(Text, nullable=True)
    difficulty_analysis_json = Column(Text, nullable=True)
    ai_feedback = Column(Text, nullable=True)

    student_exam = orm_relationship("StudentExam")

class CodingSubmission(Base):
    __tablename__ = "coding_submissions"
    id = Column(Integer, primary_key=True, index=True)
    student_exam_id = Column(Integer, ForeignKey("student_exams.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    language = Column(String, nullable=False)
    code_content = Column(Text, nullable=False)
    test_cases_passed = Column(Integer, default=0)
    complexity_analysis = Column(String, nullable=True)

    student_exam = orm_relationship("StudentExam")
    question = orm_relationship("QuestionBank")

class ExamAnalytics(Base):
    __tablename__ = "exam_analytics"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(Integer, ForeignKey("topics.id", ondelete="CASCADE"), nullable=False)
    incorrect_count = Column(Integer, default=0)
    average_score = Column(Float, default=0.0)

    exam = orm_relationship("Exam")
    topic = orm_relationship("Topic")

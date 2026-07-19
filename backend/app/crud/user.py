from sqlalchemy.orm import Session
from app.models.user import User, Student, Teacher, Parent
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Create role-specific profiles
    if user_in.role == "student":
        student_profile = Student(
            user_id=db_user.id,
            year=user_in.year,
            xp_points=0,
            streak=1,
            language_preference="English"
        )
        db.add(student_profile)
    elif user_in.role == "teacher":
        teacher_profile = Teacher(
            user_id=db_user.id,
            subject_specialization=user_in.subject_specialization,
            years_managed=user_in.years_managed
        )
        db.add(teacher_profile)
    elif user_in.role == "parent":
        parent_profile = Parent(
            user_id=db_user.id,
            child_email=user_in.child_email
        )
        db.add(parent_profile)

    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, db_user: User, user_in: UserUpdate):
    if user_in.full_name is not None:
        db_user.full_name = user_in.full_name
    if user_in.email is not None:
        db_user.email = user_in.email
    if user_in.password is not None:
        db_user.hashed_password = get_password_hash(user_in.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_student_xp(db: Session, student_id: int, xp_to_add: int):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student:
        student.xp_points += xp_to_add
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

def update_student_streak(db: Session, student_id: int, streak_value: int):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student:
        student.streak = streak_value
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

def update_student_weak_topics(db: Session, student_id: int, weak_topics: str):
    student = db.query(Student).filter(Student.id == student_id).first()
    if student:
        student.weak_topics = weak_topics
        db.add(student)
        db.commit()
        db.refresh(student)
    return student

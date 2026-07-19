from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.crud.user import get_user
from app.models.user import User, Student, Teacher
from firebase_admin import auth as firebase_auth
from app.core.firebase import get_firebase_app, get_firestore_client
import sys
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # ── Test/Mock validation fallback ─────────────────────────────────────
    if token.startswith("test_token_"):
        email = "student@pathfinder.com"
        if token.startswith("test_token_"):
            email = token.replace("test_token_", "")
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                uid=f"test_uid_{email.split('@')[0]}",
                email=email,
                full_name=email.split("@")[0].capitalize(),
                role="student" if "student" in email else "teacher",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            if user.role == "student":
                db.add(Student(user_id=user.id, year="2nd Year", xp_points=100, streak=2))
            elif user.role == "teacher":
                db.add(Teacher(user_id=user.id, subject_specialization="Maths", years_managed="2nd Year"))
            db.commit()
            db.refresh(user)
        return user

    # ── Production Firebase Token Verification ────────────────────────────
    try:
        get_firebase_app()
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        if not uid or not email:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = db.query(User).filter(User.uid == uid).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.uid = uid
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            try:
                fs_client = get_firestore_client()
                if fs_client:
                    doc_ref = fs_client.collection("users").document(uid)
                    doc = doc_ref.get()
                    if doc.exists:
                        profile = doc.to_dict()
                        role = profile.get("role", "student").lower()
                        name = profile.get("name", decoded_token.get("name", email.split("@")[0]))
                        year = profile.get("year", "2nd Year")
                        
                        user = User(
                            uid=uid,
                            email=email,
                            full_name=name,
                            role=role,
                            is_active=True
                        )
                        db.add(user)
                        db.commit()
                        db.refresh(user)
                        
                        if role == "student":
                            db.add(Student(user_id=user.id, year=year, xp_points=0, streak=1))
                        elif role == "teacher":
                            db.add(Teacher(user_id=user.id, subject_specialization=profile.get("specialization"), years_managed=year))
                        db.commit()
                        db.refresh(user)
            except Exception:
                pass
            
            if not user:
                user = User(
                    uid=uid,
                    email=email,
                    full_name=decoded_token.get("name", email.split("@")[0]),
                    role="student",
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                db.add(Student(user_id=user.id, year="2nd Year", xp_points=0, streak=1))
                db.commit()
                db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

def get_current_active_student(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="The user does not have student privileges")
    return current_user

def get_current_active_teacher(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="The user does not have teacher privileges")
    return current_user

def get_current_active_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="The user does not have administrator privileges")
    return current_user

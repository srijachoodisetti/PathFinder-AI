from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.crud.user import get_user_by_email, create_user
from app.schemas.user import UserCreate, UserResponse, Token
from app.routers.deps import get_current_user
from typing import Any

router = APIRouter()

@router.post("/signup", response_model=UserResponse)
def signup(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Create a new user profile.
    """
    db_user = get_user_by_email(db, email=user_in.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    return create_user(db, user_in=user_in)

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, retrieve access token for future requests.
    """
    user = get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
        "user": user
    }

@router.post("/login-json", response_model=Token)
def login_json(
    credentials: dict,
    db: Session = Depends(get_db)
) -> Any:
    """
    Standard JSON login option for simple frontend integrations.
    """
    email = credentials.get("username") or credentials.get("email")
    password = credentials.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Username and password are required")
        
    user = get_user_by_email(db, email=email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(user.id, expires_delta=access_token_expires),
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: Any = Depends(get_current_user)) -> Any:
    """
    Get profile of the logged-in user.
    """
    return current_user

@router.post("/forgot-password")
def forgot_password(request: dict) -> Any:
    """
    Forgot password simulation endpoint.
    """
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    # Simulate sending reset instructions
    return {"message": f"Password reset instructions sent to {email}"}

@router.post("/verify-email")
def verify_email(request: dict) -> Any:
    """
    Email verification simulator.
    """
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    return {"message": f"Email {email} has been verified successfully."}

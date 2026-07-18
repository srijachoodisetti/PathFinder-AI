import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PathFinder AI"

    # ── Runtime ───────────────────────────────────────────────────────────
    # Set to "true" on Render / production to disable reload and enable prod logging
    PRODUCTION: bool = os.getenv("PRODUCTION", "false").lower() == "true"

    # Port — Render sets this automatically; default 8000 for local dev
    PORT: int = int(os.getenv("PORT", "8000"))

    # ── Security ──────────────────────────────────────────────────────────
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "super-secret-key-change-this-in-production-minimum-32-chars"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # ── Database ──────────────────────────────────────────────────────────
    # Render provides DATABASE_URL from the linked PostgreSQL service
    # Falls back to SQLite for local development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pathfinder.db")

    # ── AI ────────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # SkillBridge AI external ATS microservice (has built-in Gemini fallback)
    SKILLBRIDGE_ATS_URL: str = os.getenv(
        "SKILLBRIDGE_ATS_URL",
        "https://skillbridge-ai.onrender.com"
    )

    # ── CORS ──────────────────────────────────────────────────────────────
    # In single-service mode: set to "*" — FastAPI serves the frontend itself
    # In separate-service mode: set to your frontend URL
    CORS_ORIGINS: List[str] = [
        i.strip()
        for i in os.getenv("CORS_ORIGINS", "*").split(",")
        if i.strip()
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # ── Allowed Hosts ─────────────────────────────────────────────────────
    # Allowed hosts for TrustedHostMiddleware
    ALLOWED_HOSTS: List[str] = [
        i.strip()
        for i in os.getenv("ALLOWED_HOSTS", "*").split(",")
        if i.strip()
    ]

    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # ── Firebase Admin SDK ────────────────────────────────────────────────
    # Optional placeholders for backend verification if needed
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_CLIENT_EMAIL: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")

    class Config:
        case_sensitive = True


settings = Settings()

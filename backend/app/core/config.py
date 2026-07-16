import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "PathFinder AI"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-for-development-hackathon-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./pathfinder.db")
    
    # AI Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        case_sensitive = True

settings = Settings()

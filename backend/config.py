from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_EXPIRE_DAYS: int = 30
    
    # APIs
    GOOGLE_AI_STUDIO_API_KEY: Optional[str] = None
    OPENWEATHER_API_KEY: Optional[str] = None

    # CORS — set to your Vercel URL in production
    FRONTEND_URL: str = "http://localhost:3000"

    # AI — Gemini Model & Backend
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_MAX_OUTPUT_TOKENS: int = 2048
    GEMINI_TEMPERATURE: float = 0.7
    AI_BACKEND: str = "gemini"
    
    # Push Notifications (VAPID)
    VAPID_PUBLIC_KEY: Optional[str] = None
    VAPID_PRIVATE_KEY: Optional[str] = None
    VAPID_EMAIL: Optional[str] = None

    # ── Email: Google OAuth 2.0 (User Token - Primary) ───
    GOOGLE_OAUTH_CREDENTIALS_FILE: Optional[str] = None
    GOOGLE_OAUTH_TOKEN_FILE: Optional[str] = None

    # ── Email: SMTP Fallback ─────────────────────────────
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@agrifarm.app"

    # ── OTP Settings ─────────────────────────────────────
    OTP_LENGTH: int = 6
    OTP_TTL_SECONDS: int = 300
    OTP_MAX_ATTEMPTS: int = 3

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

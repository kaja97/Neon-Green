from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    # ── Database ──
    CHAT_DATABASE_URL: str

    # ── Redis ──
    REDIS_URL: str = "redis://redis:6379/1"

    # ── JWT (same secret as main backend — validate only, never issue) ──
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    # ── Main Backend API (for user profile sync) ──
    MAIN_BACKEND_URL: str = "http://backend:8000/api/v1"

    # ── Voice uploads ──
    UPLOAD_DIR: str = "uploads"
    MAX_VOICE_SIZE_MB: int = 10
    ALLOWED_VOICE_TYPES: list[str] = [
        "audio/webm",
        "audio/ogg",
        "audio/mp4",
        "audio/mpeg",
    ]
    MAX_VOICE_DURATION_SECONDS: int = 300  # 5 minutes

    # ── WebSocket ──
    WS_HEARTBEAT_SECONDS: int = 30
    WS_MAX_CONNECTIONS_PER_USER: int = 3

    # ── Pagination ──
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 100

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

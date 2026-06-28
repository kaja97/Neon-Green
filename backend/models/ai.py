from sqlalchemy import String, ForeignKey, Text, DateTime, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
from .base import BaseModel
import uuid

class AIProjectSummary(BaseModel):
    __tablename__ = "ai_project_summaries"
    
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), unique=True)
    summary_json: Mapped[dict] = mapped_column(JSONB) # Flattened project state
    last_updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    hash_signature: Mapped[str | None] = mapped_column(String(64), nullable=True) # To detect if state changed

class AIConversation(BaseModel):
    __tablename__ = "ai_conversations"
    
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"))
    session_title: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class AIQueryLog(BaseModel):
    __tablename__ = "ai_query_logs"
    
    conversation_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ai_conversations.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(50)) # user, model
    content: Mapped[str] = mapped_column(Text)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)

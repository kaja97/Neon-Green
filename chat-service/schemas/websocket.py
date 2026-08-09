"""WebSocket message envelopes for client↔server communication."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone


class WSIncoming(BaseModel):
    """Envelope for all client → server WebSocket messages."""

    type: str  # "message" | "typing" | "read" | "ping"
    conversation_id: Optional[str] = None
    data: dict = {}


class WSOutgoing(BaseModel):
    """Envelope for all server → client WebSocket messages."""

    type: str  # "message" | "typing" | "read" | "online" | "offline" | "pong" | "error" | "deleted" | "connected"
    conversation_id: Optional[str] = None
    data: dict = {}
    timestamp: str = ""

    def __init__(self, **kwargs):
        if "timestamp" not in kwargs or not kwargs["timestamp"]:
            kwargs["timestamp"] = datetime.now(timezone.utc).isoformat()
        super().__init__(**kwargs)

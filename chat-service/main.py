from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
import os

from config import settings
from core.errors.exceptions import ChatException
from core.errors.handlers import (
    chat_exception_handler,
    validation_exception_handler,
    unhandled_exception_handler,
)
from routers import users, conversations, messages, voice
from websocket.manager import manager
from websocket.handler import websocket_endpoint

app = FastAPI(
    title="AgriFarm Chat Service",
    description="Standalone Real-time Chat Backend for AgriFarm ecosystem",
    version="1.0.0",
)

# ── Static file serving (voice recordings) ──
os.makedirs(os.path.join(settings.UPLOAD_DIR, "voice"), exist_ok=True)
app.mount(
    "/static/uploads",
    StaticFiles(directory=settings.UPLOAD_DIR),
    name="chat-uploads",
)

# ── Global Exception Handlers ──
app.add_exception_handler(ChatException, chat_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"^https?://.*$",  # Allow any origin (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ──
@app.get("/health")
async def health():
    return {"success": True, "data": {"status": "healthy", "service": "chat"}}

# ── REST Routes ──
app.include_router(users.router, prefix="/api/v1/chat")
app.include_router(conversations.router, prefix="/api/v1/chat")
app.include_router(messages.router, prefix="/api/v1/chat")
app.include_router(voice.router, prefix="/api/v1/chat")

# ── WebSocket Route ──
app.add_api_websocket_route("/ws/chat", websocket_endpoint)

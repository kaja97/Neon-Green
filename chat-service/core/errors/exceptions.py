"""Custom exception hierarchy for the chat service."""

from fastapi import HTTPException


class ChatException(HTTPException):
    """Base exception for chat-specific errors."""

    def __init__(self, status_code: int = 400, detail: str = "Chat error"):
        super().__init__(status_code=status_code, detail=detail)


class ConversationNotFoundError(ChatException):
    def __init__(self):
        super().__init__(status_code=404, detail="Conversation not found")


class NotParticipantError(ChatException):
    def __init__(self):
        super().__init__(
            status_code=403, detail="You are not a participant of this conversation"
        )


class MessageNotFoundError(ChatException):
    def __init__(self):
        super().__init__(status_code=404, detail="Message not found")


class VoiceUploadError(ChatException):
    def __init__(self, detail: str = "Voice upload failed"):
        super().__init__(status_code=400, detail=detail)

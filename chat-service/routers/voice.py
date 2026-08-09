from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import get_db
from core.response import success_response
from services.voice_service import VoiceService
from routers.conversations import get_current_chat_user_id

router = APIRouter(tags=["Voice"])


def get_voice_service() -> VoiceService:
    return VoiceService()


@router.post("/voice/upload", response_model=dict)
async def upload_voice(
    file: UploadFile = File(...),
    chat_user_id: uuid.UUID = Depends(get_current_chat_user_id),
    voice_service: VoiceService = Depends(get_voice_service),
):
    """Upload a voice recording file."""
    url_path, duration = await voice_service.upload(file, str(chat_user_id))
    return success_response({"voice_url": url_path, "duration": duration})

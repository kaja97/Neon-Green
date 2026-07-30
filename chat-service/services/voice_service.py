"""Voice service — upload, validate, and store voice recordings."""

import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from config import settings


class VoiceService:
    """Handles voice recording file uploads."""

    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR) / "voice"
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def upload(
        self, file: UploadFile, user_id: str
    ) -> tuple[str, int | None]:
        """Upload a voice recording file.

        1. Validate content_type against allowed types
        2. Validate file size
        3. Save to uploads/voice/{user_id}/{uuid}.{ext}
        4. Optionally extract duration via mutagen
        5. Return (url_path, duration_seconds)
        """
        # Validate content type
        if file.content_type not in settings.ALLOWED_VOICE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type '{file.content_type}'. Allowed: {', '.join(settings.ALLOWED_VOICE_TYPES)}",
            )

        # Read file content
        content = await file.read()

        # Validate size
        size_mb = len(content) / (1024 * 1024)
        if size_mb > settings.MAX_VOICE_SIZE_MB:
            raise HTTPException(
                status_code=400,
                detail=f"File too large ({size_mb:.1f}MB). Maximum: {settings.MAX_VOICE_SIZE_MB}MB",
            )

        # Generate unique path
        ext = self._get_extension(file.content_type)
        user_dir = self.upload_dir / user_id
        user_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = user_dir / filename

        # Write file
        with open(file_path, "wb") as f:
            f.write(content)

        # Try to extract duration
        duration = self._extract_duration(str(file_path))

        # Return relative URL path
        url_path = f"/static/uploads/voice/{user_id}/{filename}"
        return url_path, duration

    def delete(self, voice_url: str) -> None:
        """Delete a voice file from disk."""
        if not voice_url:
            return
        # Convert URL path to filesystem path
        relative = voice_url.replace("/static/uploads/", "")
        file_path = Path(settings.UPLOAD_DIR) / relative
        if file_path.exists():
            file_path.unlink()

    def _get_extension(self, content_type: str) -> str:
        """Map MIME type to file extension."""
        mapping = {
            "audio/webm": "webm",
            "audio/ogg": "ogg",
            "audio/mp4": "m4a",
            "audio/mpeg": "mp3",
            "audio/wav": "wav",
            "audio/x-wav": "wav",
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "image/gif": "gif",
            "application/pdf": "pdf",
            "application/msword": "doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
            "text/plain": "txt",
            "video/mp4": "mp4",
            "video/webm": "webm",
        }
        return mapping.get(content_type, "bin")

    def _extract_duration(self, file_path: str) -> int | None:
        """Try to extract audio duration using mutagen. Returns seconds or None."""
        try:
            from mutagen import File as MutagenFile

            audio = MutagenFile(file_path)
            if audio and audio.info:
                return int(audio.info.length)
        except Exception:
            pass
        return None

"""User service — profile sync from main backend and user discovery."""

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
import httpx
import uuid

from repositories.user_repo import ChatUserRepository
from models.user import ChatUser
from config import settings


class UserService:
    def __init__(self, user_repo: ChatUserRepository):
        self.user_repo = user_repo

    async def sync_user(
        self, db: AsyncSession, account_id: str, jwt_token: str
    ) -> ChatUser:
        """Fetch profile from main backend API and upsert into chat_users.

        Called on first JWT-authenticated contact or when the local record is
        stale (>24h since last update).
        """
        account_uuid = uuid.UUID(account_id)
        existing = await self.user_repo.get_by_account_id(db, account_uuid)

        # If recently synced, return as-is
        if existing and existing.updated_at:
            from datetime import datetime, timezone, timedelta

            age = datetime.now(timezone.utc) - existing.updated_at.replace(
                tzinfo=timezone.utc
            )
            if age < timedelta(hours=24):
                return existing

        # Fetch from main backend
        profile_data = await self._fetch_profile(account_id, jwt_token)

        user = await self.user_repo.upsert(
            db,
            account_id=account_uuid,
            display_name=profile_data.get("display_name", "User"),
            email=profile_data.get("email"),
            phone=profile_data.get("phone"),
            avatar_url=profile_data.get("avatar_url"),
        )
        await db.commit()
        return user

    async def _fetch_profile(self, account_id: str, jwt_token: str) -> dict:
        """Call the main backend to get the user's profile data.

        Tries the farmer profile endpoint first, then falls back to a minimal
        record if the main backend is unavailable.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # Try farmer profile
                resp = await client.get(
                    f"{settings.MAIN_BACKEND_URL}/farmer/profile",
                    headers={"Authorization": f"Bearer {jwt_token}"},
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    return {
                        "display_name": data.get("full_name", "User"),
                        "email": data.get("email"),
                        "phone": data.get("phone"),
                        "avatar_url": data.get("avatar_url"),
                    }

                # Fallback: try auth/me endpoint for basic info
                resp = await client.get(
                    f"{settings.MAIN_BACKEND_URL}/auth/me",
                    headers={"Authorization": f"Bearer {jwt_token}"},
                )
                if resp.status_code == 200:
                    data = resp.json().get("data", {})
                    return {
                        "display_name": data.get("name", data.get("email", "User")),
                        "email": data.get("email"),
                        "phone": data.get("phone"),
                        "avatar_url": None,
                    }
        except Exception:
            pass

        # If main backend is unreachable, create a minimal record
        return {
            "display_name": "User",
            "email": None,
            "phone": None,
            "avatar_url": None,
        }

    async def get_or_sync_user(
        self, db: AsyncSession, account_id: str, jwt_token: str
    ) -> ChatUser:
        """Get existing chat user or sync from main backend."""
        account_uuid = uuid.UUID(account_id)
        user = await self.user_repo.get_by_account_id(db, account_uuid)
        if user:
            return user
        return await self.sync_user(db, account_id, jwt_token)

    async def search_users(
        self,
        db: AsyncSession,
        query: str,
        current_user_id: uuid.UUID,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[ChatUser], int]:
        """Search for users by name, email, or phone."""
        return await self.user_repo.search(
            db, query, exclude_user_id=current_user_id, page=page, per_page=per_page
        )

    async def update_profile(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        display_name: str | None = None,
        avatar_url: str | None = None,
    ) -> ChatUser:
        """Update the current user's chat profile."""
        user = await self.user_repo.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if display_name:
            user.display_name = display_name
        if avatar_url is not None:
            user.avatar_url = avatar_url
        await db.flush()
        await db.commit()
        return user

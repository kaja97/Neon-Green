"""Repository for ChatUser CRUD and discovery search."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, or_, text
import uuid

from models.user import ChatUser


class ChatUserRepository:
    """Data-access layer for the ``chat_users`` table."""

    async def get_by_id(self, db: AsyncSession, user_id: uuid.UUID) -> ChatUser | None:
        result = await db.execute(select(ChatUser).where(ChatUser.id == user_id))
        return result.scalars().first()

    async def get_by_account_id(
        self, db: AsyncSession, account_id: uuid.UUID
    ) -> ChatUser | None:
        result = await db.execute(
            select(ChatUser).where(ChatUser.account_id == account_id)
        )
        return result.scalars().first()

    async def get_by_account_ids(
        self, db: AsyncSession, account_ids: list[uuid.UUID]
    ) -> list[ChatUser]:
        if not account_ids:
            return []
        result = await db.execute(
            select(ChatUser).where(ChatUser.account_id.in_(account_ids))
        )
        return list(result.scalars().all())

    async def upsert(
        self,
        db: AsyncSession,
        account_id: uuid.UUID,
        display_name: str,
        email: str | None = None,
        phone: str | None = None,
        avatar_url: str | None = None,
    ) -> ChatUser:
        """Create or update a chat user from main-app profile data."""
        user = await self.get_by_account_id(db, account_id)
        if user:
            user.display_name = display_name
            if email is not None:
                user.email = email
            if phone is not None:
                user.phone = phone
            if avatar_url is not None:
                user.avatar_url = avatar_url
        else:
            user = ChatUser(
                account_id=account_id,
                display_name=display_name,
                email=email,
                phone=phone,
                avatar_url=avatar_url,
            )
            db.add(user)
        await db.flush()
        return user

    async def search(
        self,
        db: AsyncSession,
        query: str,
        exclude_user_id: uuid.UUID | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> tuple[list[ChatUser], int]:
        """Search users by name (trigram), email prefix, or phone prefix.

        Detection logic:
        - Contains ``@`` → email prefix search
        - Starts with ``+`` or all digits → phone prefix search
        - Otherwise → trigram similarity on ``display_name``
        """
        offset = (page - 1) * per_page
        q = query.strip()

        # Simple ILIKE search on display_name, email, and phone
        condition = or_(
            ChatUser.display_name.ilike(f"%{q}%"),
            ChatUser.email.ilike(f"%{q}%"),
            ChatUser.phone.ilike(f"%{q}%")
        )
        order = ChatUser.display_name

        stmt = select(ChatUser).where(condition)
        if exclude_user_id:
            stmt = stmt.where(ChatUser.id != exclude_user_id)

        # Count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = (await db.execute(count_stmt)).scalar() or 0

        # Page
        stmt = stmt.order_by(order).limit(per_page).offset(offset)
        result = await db.execute(stmt)
        users = list(result.scalars().all())

        return users, total

    async def set_online(
        self, db: AsyncSession, user_id: uuid.UUID, is_online: bool
    ) -> None:
        user = await self.get_by_id(db, user_id)
        if user:
            user.is_online = is_online
            if not is_online:
                from datetime import datetime, timezone
                user.last_seen_at = datetime.now(timezone.utc)
            await db.flush()

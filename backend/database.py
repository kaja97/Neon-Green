from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from typing import AsyncGenerator
from config import settings

# Create async engine with pool_pre_ping and pool_recycle for cloud Postgres (Supabase/Render)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,      # Test connections before checkout to prevent stale socket errors
    pool_recycle=1800,       # Recycle connections every 30 minutes to prevent SSL EOF drops
)

# Create session factory
async_session = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async db session with automatic exception rollback."""
    async with async_session() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise

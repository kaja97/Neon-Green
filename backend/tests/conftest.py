"""
Shared pytest fixtures for integration tests.

Uses a separate DB session for test data setup (committed before HTTP calls)
to avoid asyncpg "another operation is in progress" conflicts.
"""
import asyncio
import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

from main import app
from config import settings
from core.security import get_password_hash, create_access_token


# ── Database ─────────────────────────────────────────────

test_engine = create_async_engine(settings.DATABASE_URL, echo=False)
TestSession = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    """Use a single event loop for the entire test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ── Test Data Tracker ────────────────────────────────────

class TestData:
    """Stores IDs created during tests for cleanup."""
    account_ids: list[uuid.UUID] = []
    profile_ids: list[uuid.UUID] = []
    location_ids: list[uuid.UUID] = []
    land_ids: list[uuid.UUID] = []
    livestock_ids: list[uuid.UUID] = []
    project_ids: list[uuid.UUID] = []

    @classmethod
    def reset(cls):
        cls.account_ids = []
        cls.profile_ids = []
        cls.location_ids = []
        cls.land_ids = []
        cls.livestock_ids = []
        cls.project_ids = []


# ── Helpers (use their own session, commit, close) ───────

async def create_test_account(
    email: str = None,
    phone: str = None,
    password: str = "Test@12345",
) -> tuple:
    """
    Create account + farmer profile directly in DB (bypass OTP).
    Uses its own session that commits and closes before returning,
    so the HTTP client can safely use a different session.

    Returns (account_id, profile_id, email, password).
    """
    from models.account import Account, FarmerProfile

    email = email or f"test_{uuid.uuid4().hex[:8]}@test.com"
    phone = phone or f"+9477{uuid.uuid4().int % 10000000:07d}"

    async with TestSession() as session:
        account = Account(
            email=email,
            phone=phone,
            password_hash=get_password_hash(password),
            role="farmer",
            is_verified=True,
            is_active=True,
        )
        session.add(account)
        await session.flush()

        profile = FarmerProfile(
            account_id=account.id,
            full_name="Test Farmer",
            farming_method="organic",
            primary_language="en",
        )
        session.add(profile)
        await session.flush()
        await session.commit()

        account_id = account.id
        profile_id = profile.id

    TestData.account_ids.append(account_id)
    TestData.profile_ids.append(profile_id)

    return account_id, profile_id, email, password


def make_auth_headers(account_id: uuid.UUID, role: str = "farmer") -> dict:
    """Generate JWT auth headers for a test user."""
    token = create_access_token({"sub": str(account_id), "role": role})
    return {"Authorization": f"Bearer {token}"}


# ── HTTP Client ──────────────────────────────────────────

@pytest_asyncio.fixture(scope="function")
async def client():
    """Async HTTP client for testing FastAPI endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


# ── Cleanup ──────────────────────────────────────────────

@pytest_asyncio.fixture(autouse=True, scope="function")
async def cleanup():
    """Clean up test data after each test."""
    TestData.reset()
    yield
    # Cleanup in reverse dependency order
    async with TestSession() as session:
        for table, ids in [
            ("projects", TestData.project_ids),
            ("farmer_land_details", TestData.land_ids),
            ("farmer_livestock", TestData.livestock_ids),
            ("farmer_locations", TestData.location_ids),
            ("farmer_profiles", TestData.profile_ids),
            ("accounts", TestData.account_ids),
        ]:
            for id_ in ids:
                try:
                    await session.execute(
                        text(f"DELETE FROM {table} WHERE id = :id"),
                        {"id": id_},
                    )
                except Exception:
                    pass
        await session.commit()

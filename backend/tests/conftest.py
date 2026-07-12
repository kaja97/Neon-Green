"""
Shared pytest fixtures for integration tests.

Uses raw asyncpg for test data setup/cleanup to avoid SQLAlchemy
session conflicts with the FastAPI app's own sessions.
"""
import asyncio
import uuid
import pytest
import pytest_asyncio
import asyncpg
from httpx import AsyncClient, ASGITransport

from main import app
from config import settings
from core.security import get_password_hash, create_access_token


# ── Parse DB URL ─────────────────────────────────────────

def _parse_db_url(url: str) -> str:
    """Convert SQLAlchemy async URL to standard postgres URL for asyncpg."""
    # asyncpg+postgresql://... → postgresql://...
    return url.replace("postgresql+asyncpg://", "postgresql://")


RAW_DB_URL = _parse_db_url(settings.DATABASE_URL)


# ── Event Loop ───────────────────────────────────────────

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# ── Test Data Tracker ────────────────────────────────────

class TestData:
    """Stores IDs created during tests for cleanup."""
    account_ids: list[str] = []
    profile_ids: list[str] = []
    location_ids: list[str] = []
    land_ids: list[str] = []
    livestock_ids: list[str] = []
    project_ids: list[str] = []

    @classmethod
    def reset(cls):
        cls.account_ids = []
        cls.profile_ids = []
        cls.location_ids = []
        cls.land_ids = []
        cls.livestock_ids = []
        cls.project_ids = []


# ── Raw asyncpg helpers ──────────────────────────────────

async def create_test_account(
    email: str = None,
    phone: str = None,
    password: str = "Test@12345",
) -> tuple:
    """
    Create account + farmer profile via raw asyncpg (bypass OTP).
    Fully commits and closes connection before returning.

    Returns (account_id: str, profile_id: str, email: str, password: str).
    """
    email = email or f"test_{uuid.uuid4().hex[:8]}@test.com"
    phone = phone or f"+9477{uuid.uuid4().int % 10000000:07d}"
    account_id = str(uuid.uuid4())
    profile_id = str(uuid.uuid4())
    pwd_hash = get_password_hash(password)

    conn = await asyncpg.connect(RAW_DB_URL)
    try:
        await conn.execute(
            """INSERT INTO accounts (id, email, phone, password_hash, role,
               is_verified, is_active, created_at, updated_at)
               VALUES ($1::uuid, $2, $3, $4, 'farmer', true, true, now(), now())""",
            uuid.UUID(account_id), email, phone, pwd_hash,
        )
        await conn.execute(
            """INSERT INTO farmer_profiles (id, account_id, full_name,
               farming_method, primary_language, created_at, updated_at)
               VALUES ($1::uuid, $2::uuid, 'Test Farmer', 'organic', 'en', now(), now())""",
            uuid.UUID(profile_id), uuid.UUID(account_id),
        )
    finally:
        await conn.close()

    TestData.account_ids.append(account_id)
    TestData.profile_ids.append(profile_id)

    return account_id, profile_id, email, password


def make_auth_headers(account_id: str, role: str = "farmer") -> dict:
    """Generate JWT auth headers for a test user."""
    token = create_access_token({"sub": account_id, "role": role})
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
    """Clean up test data after each test using raw asyncpg."""
    TestData.reset()
    yield
    conn = await asyncpg.connect(RAW_DB_URL)
    try:
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
                    await conn.execute(
                        f"DELETE FROM {table} WHERE id = $1::uuid",
                        uuid.UUID(id_),
                    )
                except Exception:
                    pass
    finally:
        await conn.close()

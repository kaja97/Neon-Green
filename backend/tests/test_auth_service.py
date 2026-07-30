"""
Integration tests for Auth service.

Tests registration, login, /me, change password, and soft-delete
against the real Docker PostgreSQL.
"""
import pytest
from httpx import AsyncClient

from tests.conftest import create_test_account, make_auth_headers, TestData


# ══════════════════════════════════════════════════════════
# 1. Registration
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_register_request_otp(client: AsyncClient):
    """POST /auth/register/request-otp — should accept request."""
    resp = await client.post("/api/v1/auth/register/request-otp", json={
        "email": "integration_test_otp@test.com",
        "phone": "+94771234567",
    })
    # Should succeed (OTP sent) or gracefully handle if Celery/Redis not ready
    assert resp.status_code in (200, 503), f"Unexpected: {resp.status_code} {resp.text}"


@pytest.mark.asyncio
async def test_register_direct_db():
    """Directly create account + profile in DB (bypass OTP) to validate model integrity."""
    account_id, profile_id, email, _ = await create_test_account(email="direct_reg@test.com")
    assert account_id is not None
    assert profile_id is not None


# ══════════════════════════════════════════════════════════
# 2. Login
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_login_with_email(client: AsyncClient):
    """POST /auth/login — login with email + password."""
    await create_test_account(email="login_test@test.com", password="Login@12345")

    resp = await client.post("/api/v1/auth/login", json={
        "email_or_phone": "login_test@test.com",
        "password": "Login@12345",
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert data["data"]["role"] == "farmer"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    """POST /auth/login — wrong password returns error."""
    await create_test_account(email="login_wrong@test.com", password="Correct@123")

    resp = await client.post("/api/v1/auth/login", json={
        "email_or_phone": "login_wrong@test.com",
        "password": "WrongPass@1",
    })
    assert resp.status_code in (400, 401), resp.text
    data = resp.json()
    assert data["success"] is False


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """POST /auth/login — non-existent user returns error."""
    resp = await client.post("/api/v1/auth/login", json={
        "email_or_phone": "no_such_user@test.com",
        "password": "Any@12345",
    })
    assert resp.status_code in (400, 401), resp.text


# ══════════════════════════════════════════════════════════
# 3. Get Current User (/me)
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    """GET /auth/me — returns current user with profile."""
    account_id, _, _, _ = await create_test_account(email="me_test@test.com")
    headers = make_auth_headers(account_id)

    resp = await client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["email"] == "me_test@test.com"
    assert data["farmer_profile"] is not None
    assert data["farmer_profile"]["full_name"] == "Test Farmer"


@pytest.mark.asyncio
async def test_get_me_no_token(client: AsyncClient):
    """GET /auth/me — no token returns 401."""
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code in (401, 403), resp.text


# ══════════════════════════════════════════════════════════
# 4. Change Password
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_change_password(client: AsyncClient):
    """PATCH /auth/change-password — change password successfully."""
    account_id, _, email, _ = await create_test_account(
        email="chgpwd@test.com", password="Old@12345"
    )
    headers = make_auth_headers(account_id)

    resp = await client.patch("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "Old@12345",
        "new_password": "New@12345",
    })
    assert resp.status_code == 200, resp.text

    # Verify new password works
    login_resp = await client.post("/api/v1/auth/login", json={
        "email_or_phone": "chgpwd@test.com",
        "password": "New@12345",
    })
    assert login_resp.status_code == 200


@pytest.mark.asyncio
async def test_change_password_wrong_current(client: AsyncClient):
    """PATCH /auth/change-password — wrong current password fails."""
    account_id, _, _, _ = await create_test_account(
        email="chgpwd_wrong@test.com", password="Real@12345"
    )
    headers = make_auth_headers(account_id)

    resp = await client.patch("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "Wrong@12345",
        "new_password": "New@12345",
    })
    assert resp.status_code in (400, 401, 409), resp.text


# ══════════════════════════════════════════════════════════
# 5. Soft-Delete Account
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_soft_delete_account(client: AsyncClient):
    """DELETE /auth/account — soft-deletes account."""
    account_id, _, email, _ = await create_test_account(email="delete_test@test.com")
    headers = make_auth_headers(account_id)

    resp = await client.delete("/api/v1/auth/account", headers=headers)
    assert resp.status_code == 204

    # Verify login fails (account deactivated)
    login_resp = await client.post("/api/v1/auth/login", json={
        "email_or_phone": "delete_test@test.com",
        "password": "Test@12345",
    })
    assert login_resp.status_code in (400, 401, 403), login_resp.text

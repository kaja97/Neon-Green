"""
Integration tests for Project service.

Tests project CRUD, status transitions, and validation
against the real Docker PostgreSQL.
"""
import pytest
import pytest_asyncio
import uuid
from datetime import date, timedelta
from httpx import AsyncClient
from sqlalchemy import text

from tests.conftest import create_test_account, make_auth_headers, TestData, TestSession


# ── Helpers ──────────────────────────────────────────────

async def _create_location_for_test(client: AsyncClient, headers: dict) -> str:
    """Create a location and return its ID."""
    resp = await client.post("/api/v1/farmer/locations", headers=headers, json={
        "name": "Project Test Farm",
        "district": "Anuradhapura",
        "latitude": 8.335,
        "longitude": 80.410,
        "is_primary": True,
    })
    assert resp.status_code == 201, resp.text
    loc_id = resp.json()["data"]["id"]
    TestData.location_ids.append(uuid.UUID(loc_id))
    return loc_id


async def _get_first_plant_id(client: AsyncClient) -> str:
    """Get the first available plant ID from master data."""
    resp = await client.get("/api/v1/plants")
    assert resp.status_code == 200, resp.text
    plants = resp.json()
    if not plants:
        pytest.skip("No seed plant data available — run seed first")
    return str(plants[0]["id"])


# ══════════════════════════════════════════════════════════
# 1. Master Data
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_list_plants(client: AsyncClient):
    """GET /plants — list available plants."""
    resp = await client.get("/api/v1/plants")
    assert resp.status_code == 200, resp.text


@pytest.mark.asyncio
async def test_list_farming_methods(client: AsyncClient):
    """GET /farming-methods — list farming methods."""
    resp = await client.get("/api/v1/farming-methods")
    assert resp.status_code == 200, resp.text
    methods = resp.json()
    assert len(methods) == 3
    ids = [m["id"] for m in methods]
    assert "organic" in ids
    assert "inorganic" in ids
    assert "integrated" in ids


# ══════════════════════════════════════════════════════════
# 2. Project CRUD
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_create_project(client: AsyncClient, db):
    """POST /projects — create a project."""
    account, _ = await create_test_account(db, email="proj_create@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Rice Season 1",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 2.0,
        "area_unit": "acres",
        "farming_method": "organic",
        "planting_date": str(date.today()),
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["name"] == "Rice Season 1"
    assert data["status"] == "active"
    TestData.project_ids.append(uuid.UUID(data["id"]))


@pytest.mark.asyncio
async def test_list_projects(client: AsyncClient, db):
    """GET /projects — list user's projects."""
    account, _ = await create_test_account(db, email="proj_list@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    # Create a project
    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "List Test Project",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 1.0,
        "farming_method": "organic",
        "planting_date": str(date.today()),
    })
    TestData.project_ids.append(uuid.UUID(create_resp.json()["id"]))

    # List
    resp = await client.get("/api/v1/projects", headers=headers)
    assert resp.status_code == 200, resp.text


@pytest.mark.asyncio
async def test_get_project(client: AsyncClient, db):
    """GET /projects/{id} — get specific project."""
    account, _ = await create_test_account(db, email="proj_get@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Get Test Project",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 1.5,
        "farming_method": "integrated",
        "planting_date": str(date.today()),
    })
    proj_id = create_resp.json()["id"]
    TestData.project_ids.append(uuid.UUID(proj_id))

    resp = await client.get(f"/api/v1/projects/{proj_id}", headers=headers)
    assert resp.status_code == 200, resp.text
    assert resp.json()["name"] == "Get Test Project"


@pytest.mark.asyncio
async def test_update_project(client: AsyncClient, db):
    """PUT /projects/{id} — update project fields."""
    account, _ = await create_test_account(db, email="proj_upd@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Old Project Name",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 1.0,
        "farming_method": "organic",
        "planting_date": str(date.today()),
    })
    proj_id = create_resp.json()["id"]
    TestData.project_ids.append(uuid.UUID(proj_id))

    resp = await client.put(f"/api/v1/projects/{proj_id}", headers=headers, json={
        "name": "New Project Name",
        "area": 3.5,
    })
    assert resp.status_code == 200, resp.text
    assert resp.json()["name"] == "New Project Name"


@pytest.mark.asyncio
async def test_delete_project(client: AsyncClient, db):
    """DELETE /projects/{id} — delete a project."""
    account, _ = await create_test_account(db, email="proj_del@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Delete Me",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 0.5,
        "farming_method": "inorganic",
        "planting_date": str(date.today()),
    })
    proj_id = create_resp.json()["id"]

    resp = await client.delete(f"/api/v1/projects/{proj_id}", headers=headers)
    assert resp.status_code == 204

    # Verify gone
    get_resp = await client.get(f"/api/v1/projects/{proj_id}", headers=headers)
    assert get_resp.status_code in (404, 400), get_resp.text


# ══════════════════════════════════════════════════════════
# 3. Status Transitions (State Machine)
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_status_transition_active_to_harvested(client: AsyncClient, db):
    """PATCH /projects/{id}/status — active → harvested."""
    account, _ = await create_test_account(db, email="status_harv@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Harvest Test",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 1.0,
        "farming_method": "organic",
        "planting_date": str(date.today() - timedelta(days=90)),
    })
    proj_id = create_resp.json()["id"]
    TestData.project_ids.append(uuid.UUID(proj_id))

    resp = await client.patch(f"/api/v1/projects/{proj_id}/status", headers=headers, json={
        "status": "harvested",
        "harvest_date": str(date.today()),
    })
    assert resp.status_code == 200, resp.text
    assert resp.json()["status"] == "harvested"


@pytest.mark.asyncio
async def test_invalid_status_transition(client: AsyncClient, db):
    """PATCH /projects/{id}/status — active → planning (invalid) should fail."""
    account, _ = await create_test_account(db, email="status_inv@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Invalid Transition",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 1.0,
        "farming_method": "organic",
        "planting_date": str(date.today()),
    })
    proj_id = create_resp.json()["id"]
    TestData.project_ids.append(uuid.UUID(proj_id))

    resp = await client.patch(f"/api/v1/projects/{proj_id}/status", headers=headers, json={
        "status": "planning",
    })
    assert resp.status_code in (400, 409, 422), resp.text


# ══════════════════════════════════════════════════════════
# 4. Validation
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_cannot_delete_location_with_project(client: AsyncClient, db):
    """Cannot delete a location that has active projects."""
    account, _ = await create_test_account(db, email="loc_proj_guard@test.com")
    headers = make_auth_headers(account.id)
    loc_id = await _create_location_for_test(client, headers)
    plant_id = await _get_first_plant_id(client)

    # Create project on this location
    create_resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Guard Test",
        "plant_id": plant_id,
        "location_id": loc_id,
        "area": 1.0,
        "farming_method": "organic",
        "planting_date": str(date.today()),
    })
    proj_id = create_resp.json()["id"]
    TestData.project_ids.append(uuid.UUID(proj_id))

    # Try to delete location — should fail
    del_resp = await client.delete(f"/api/v1/farmer/locations/{loc_id}", headers=headers)
    assert del_resp.status_code in (400, 409), del_resp.text


@pytest.mark.asyncio
async def test_create_project_invalid_location(client: AsyncClient, db):
    """Cannot create project with a non-existent location."""
    account, _ = await create_test_account(db, email="proj_bad_loc@test.com")
    headers = make_auth_headers(account.id)
    plant_id = await _get_first_plant_id(client)

    resp = await client.post("/api/v1/projects", headers=headers, json={
        "name": "Bad Location",
        "plant_id": plant_id,
        "location_id": str(uuid.uuid4()),  # Non-existent
        "area": 1.0,
        "farming_method": "organic",
        "planting_date": str(date.today()),
    })
    assert resp.status_code in (400, 404, 422), resp.text

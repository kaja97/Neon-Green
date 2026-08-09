"""
Integration tests for Farmer service.

Tests profile CRUD, location CRUD, land detail CRUD, and livestock CRUD
against the real Docker PostgreSQL.
"""
import pytest
import uuid
from httpx import AsyncClient

from tests.conftest import create_test_account, make_auth_headers, TestData


# ══════════════════════════════════════════════════════════
# 1. Profile
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_get_farmer_profile(client: AsyncClient):
    """GET /farmer/profile — returns farmer profile."""
    account_id, _, _, _ = await create_test_account(email="profile_get@test.com")
    headers = make_auth_headers(account_id)

    resp = await client.get("/api/v1/farmer/profile", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["full_name"] == "Test Farmer"
    assert data["farming_method"] == "organic"


@pytest.mark.asyncio
async def test_update_farmer_profile(client: AsyncClient):
    """PUT /farmer/profile — update profile fields."""
    account_id, _, _, _ = await create_test_account(email="profile_upd@test.com")
    headers = make_auth_headers(account_id)

    resp = await client.put("/api/v1/farmer/profile", headers=headers, json={
        "full_name": "Updated Farmer",
        "experience_years": 5,
        "bio": "I grow rice and vegetables.",
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["full_name"] == "Updated Farmer"
    assert data["experience_years"] == 5
    assert data["bio"] == "I grow rice and vegetables."


# ══════════════════════════════════════════════════════════
# 2. Locations — CRUD
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_create_location(client: AsyncClient):
    """POST /farmer/locations — create a farm location."""
    account_id, _, _, _ = await create_test_account(email="loc_create@test.com")
    headers = make_auth_headers(account_id)

    resp = await client.post("/api/v1/farmer/locations", headers=headers, json={
        "name": "Main Farm",
        "district": "Vavuniya",
        "latitude": 8.751,
        "longitude": 80.497,
        "is_primary": True,
    })
    assert resp.status_code == 201, resp.text
    data = resp.json()["data"]
    assert data["name"] == "Main Farm"
    assert data["district"] == "Vavuniya"
    assert data["is_primary"] is True
    # Verify lat/lon extracted from PostGIS centroid
    assert data["latitude"] is not None
    assert abs(data["latitude"] - 8.751) < 0.01
    assert abs(data["longitude"] - 80.497) < 0.01
    TestData.location_ids.append(uuid.UUID(data["id"]))


@pytest.mark.asyncio
async def test_list_locations(client: AsyncClient):
    """GET /farmer/locations — list all locations."""
    account_id, _, _, _ = await create_test_account(email="loc_list@test.com")
    headers = make_auth_headers(account_id)

    # Create two locations
    for name in ["Farm A", "Farm B"]:
        resp = await client.post("/api/v1/farmer/locations", headers=headers, json={
            "name": name,
            "district": "Jaffna",
            "latitude": 9.661,
            "longitude": 80.025,
        })
        assert resp.status_code == 201
        TestData.location_ids.append(uuid.UUID(resp.json()["data"]["id"]))

    # List
    resp = await client.get("/api/v1/farmer/locations", headers=headers)
    assert resp.status_code == 200
    locs = resp.json()["data"]
    assert len(locs) >= 2


@pytest.mark.asyncio
async def test_update_location(client: AsyncClient):
    """PUT /farmer/locations/{id} — update location."""
    account_id, _, _, _ = await create_test_account(email="loc_upd@test.com")
    headers = make_auth_headers(account_id)

    # Create
    create_resp = await client.post("/api/v1/farmer/locations", headers=headers, json={
        "name": "Old Name",
        "district": "Kilinochchi",
        "latitude": 9.380,
        "longitude": 80.378,
    })
    loc_id = create_resp.json()["data"]["id"]
    TestData.location_ids.append(uuid.UUID(loc_id))

    # Update
    resp = await client.put(f"/api/v1/farmer/locations/{loc_id}", headers=headers, json={
        "name": "New Name",
        "district": "Mullaitivu",
    })
    assert resp.status_code == 200, resp.text
    data = resp.json()["data"]
    assert data["name"] == "New Name"
    assert data["district"] == "Mullaitivu"


@pytest.mark.asyncio
async def test_delete_location(client: AsyncClient):
    """DELETE /farmer/locations/{id} — delete location."""
    account_id, _, _, _ = await create_test_account(email="loc_del@test.com")
    headers = make_auth_headers(account_id)

    # Create
    create_resp = await client.post("/api/v1/farmer/locations", headers=headers, json={
        "name": "Temp Farm",
        "district": "Trincomalee",
        "latitude": 8.576,
        "longitude": 81.233,
    })
    loc_id = create_resp.json()["data"]["id"]

    # Delete
    resp = await client.delete(f"/api/v1/farmer/locations/{loc_id}", headers=headers)
    assert resp.status_code == 204

    # Verify gone
    get_resp = await client.get(f"/api/v1/farmer/locations/{loc_id}", headers=headers)
    assert get_resp.status_code in (404, 400), get_resp.text


# ══════════════════════════════════════════════════════════
# 3. Land Details — CRUD
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_land_detail_crud(client: AsyncClient):
    """Full CRUD cycle for land details."""
    account_id, _, _, _ = await create_test_account(email="land_crud@test.com")
    headers = make_auth_headers(account_id)

    # Create location first
    loc_resp = await client.post("/api/v1/farmer/locations", headers=headers, json={
        "name": "Land Test Farm",
        "district": "Batticaloa",
        "latitude": 7.717,
        "longitude": 81.700,
    })
    loc_id = loc_resp.json()["data"]["id"]
    TestData.location_ids.append(uuid.UUID(loc_id))

    # CREATE land detail
    create_resp = await client.post("/api/v1/farmer/land", headers=headers, json={
        "location_id": loc_id,
        "total_area": 2.5,
        "area_unit": "acres",
        "soil_type": "Red Laterite",
        "irrigation_type": "Drip",
    })
    assert create_resp.status_code == 201, create_resp.text
    land_id = create_resp.json()["data"]["id"]
    TestData.land_ids.append(uuid.UUID(land_id))

    # READ
    get_resp = await client.get(f"/api/v1/farmer/land/{land_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["total_area"] == 2.5

    # UPDATE
    upd_resp = await client.put(f"/api/v1/farmer/land/{land_id}", headers=headers, json={
        "total_area": 3.0,
        "soil_type": "Alluvial",
    })
    assert upd_resp.status_code == 200
    assert upd_resp.json()["data"]["total_area"] == 3.0
    assert upd_resp.json()["data"]["soil_type"] == "Alluvial"

    # LIST
    list_resp = await client.get("/api/v1/farmer/land", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()["data"]) >= 1

    # DELETE
    del_resp = await client.delete(f"/api/v1/farmer/land/{land_id}", headers=headers)
    assert del_resp.status_code == 204
    TestData.land_ids.remove(uuid.UUID(land_id))


# ══════════════════════════════════════════════════════════
# 4. Livestock — CRUD
# ══════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_livestock_crud(client: AsyncClient):
    """Full CRUD cycle for livestock."""
    account_id, _, _, _ = await create_test_account(email="livestock_crud@test.com")
    headers = make_auth_headers(account_id)

    # CREATE
    create_resp = await client.post("/api/v1/farmer/livestock", headers=headers, json={
        "animal_type": "Cattle",
        "count": 10,
        "purpose": "Dairy",
    })
    assert create_resp.status_code == 201, create_resp.text
    ls_id = create_resp.json()["data"]["id"]
    TestData.livestock_ids.append(uuid.UUID(ls_id))

    # READ
    get_resp = await client.get(f"/api/v1/farmer/livestock/{ls_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["animal_type"] == "Cattle"
    assert get_resp.json()["data"]["count"] == 10

    # UPDATE
    upd_resp = await client.put(f"/api/v1/farmer/livestock/{ls_id}", headers=headers, json={
        "count": 15,
        "purpose": "Meat",
    })
    assert upd_resp.status_code == 200
    assert upd_resp.json()["data"]["count"] == 15

    # LIST
    list_resp = await client.get("/api/v1/farmer/livestock", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()["data"]) >= 1

    # DELETE
    del_resp = await client.delete(f"/api/v1/farmer/livestock/{ls_id}", headers=headers)
    assert del_resp.status_code == 204
    TestData.livestock_ids.remove(uuid.UUID(ls_id))

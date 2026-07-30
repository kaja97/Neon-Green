"""
Farmer service — profile, locations, land details, livestock CRUD.
All errors use AppException. All functions check ownership.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from geoalchemy2.elements import WKTElement
from models.account import FarmerProfile
from models.farmer import FarmerLocation, FarmerLandDetail, FarmerLivestock
from core.errors.exceptions import AppException
from core.errors.error_codes import ErrorCode
from core.base_service import BaseService
from modules.auth.repository import FarmerProfileRepository
from .repository import FarmerLocationRepository, FarmerLandDetailRepository, FarmerLivestockRepository
from .schemas import (
    FarmerProfileUpdate,
    LocationCreate, LocationUpdate,
    LandDetailCreate, LandDetailUpdate,
    LivestockCreate, LivestockUpdate,
)
import uuid


def _make_centroid(lat: float, lon: float) -> WKTElement:
    """Create a PostGIS POINT from lat/lon."""
    return WKTElement(f"POINT({lon} {lat})", srid=4326)


class FarmerService(BaseService):
    def __init__(
        self,
        profile_repo: FarmerProfileRepository,
        location_repo: FarmerLocationRepository,
        land_repo: FarmerLandDetailRepository,
        livestock_repo: FarmerLivestockRepository
    ):
        super().__init__()
        self.profile_repo = profile_repo
        self.location_repo = location_repo
        self.land_repo = land_repo
        self.livestock_repo = livestock_repo

    async def _get_profile_or_raise(self, db: AsyncSession, account_id: uuid.UUID) -> FarmerProfile:
        """Get farmer profile or auto-create for legacy accounts."""
        result = await db.execute(
            select(FarmerProfile).where(FarmerProfile.account_id == account_id)
        )
        profile = result.scalars().first()
        if not profile:
            # Auto-create FarmerProfile for legacy accounts
            from models.account import Account
            result = await db.execute(select(Account).where(Account.id == account_id))
            account = result.scalars().first()
            if not account:
                raise AppException(ErrorCode.AUTH_ACCOUNT_NOT_FOUND)
            
            profile = FarmerProfile(
                account_id=account.id,
                full_name=account.email.split("@")[0].replace(".", " ").title(),
                farming_method="integrated"
            )
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
            
        return profile

    # ── Profile ──────────────────────────────────────────────

    async def get_profile(self, db: AsyncSession, account_id: uuid.UUID) -> FarmerProfile:
        return await self._get_profile_or_raise(db, account_id)

    async def update_profile(
        self, db: AsyncSession, account_id: uuid.UUID, data: FarmerProfileUpdate
    ) -> FarmerProfile:
        profile = await self._get_profile_or_raise(db, account_id)
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
        await db.commit()
        await db.refresh(profile)
        return profile

    # ── Locations ────────────────────────────────────────────

    async def create_location(
        self, db: AsyncSession, account_id: uuid.UUID, data: LocationCreate
    ) -> FarmerLocation:
        profile = await self._get_profile_or_raise(db, account_id)

        if data.is_primary:
            result = await db.execute(
                select(FarmerLocation).where(FarmerLocation.farmer_id == profile.id)
            )
            for loc in result.scalars().all():
                loc.is_primary = False

        new_loc = FarmerLocation(
            farmer_id=profile.id,
            name=data.name,
            address=data.address,
            district=data.district,
            centroid=_make_centroid(data.latitude, data.longitude),
            is_primary=data.is_primary,
        )
        db.add(new_loc)
        await db.commit()
        await db.refresh(new_loc)
        return new_loc

    async def list_locations(
        self, db: AsyncSession, account_id: uuid.UUID
    ) -> list[FarmerLocation]:
        profile = await self._get_profile_or_raise(db, account_id)
        return await self.location_repo.get_by_farmer(db, profile.id)

    async def get_location(
        self, db: AsyncSession, account_id: uuid.UUID, location_id: uuid.UUID
    ) -> FarmerLocation:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLocation).where(
                FarmerLocation.id == location_id,
                FarmerLocation.farmer_id == profile.id,
            )
        )
        location = result.scalars().first()
        if not location:
            raise AppException(ErrorCode.FARMER_LOCATION_NOT_FOUND)
        return location

    async def update_location(
        self, db: AsyncSession, account_id: uuid.UUID, location_id: uuid.UUID,
        data: LocationUpdate
    ) -> FarmerLocation:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLocation).where(
                FarmerLocation.id == location_id,
                FarmerLocation.farmer_id == profile.id,
            )
        )
        location = result.scalars().first()
        if not location:
            raise AppException(ErrorCode.FARMER_LOCATION_NOT_FOUND)

        if data.is_primary:
            locs_result = await db.execute(
                select(FarmerLocation).where(FarmerLocation.farmer_id == profile.id)
            )
            for loc in locs_result.scalars().all():
                loc.is_primary = False

        update_dict = data.model_dump(exclude_unset=True)

        # If lat/lon provided, update centroid geometry
        lat = update_dict.pop("latitude", None)
        lon = update_dict.pop("longitude", None)
        if lat is not None and lon is not None:
            location.centroid = _make_centroid(lat, lon)

        for key, value in update_dict.items():
            setattr(location, key, value)

        await db.commit()
        await db.refresh(location)
        return location

    async def delete_location(
        self, db: AsyncSession, account_id: uuid.UUID, location_id: uuid.UUID
    ) -> None:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLocation).where(
                FarmerLocation.id == location_id,
                FarmerLocation.farmer_id == profile.id,
            )
        )
        location = result.scalars().first()
        if not location:
            raise AppException(ErrorCode.FARMER_LOCATION_NOT_FOUND)

        # Check for active projects using this location
        from models.project import Project
        proj_result = await db.execute(
            select(func.count()).select_from(Project).where(Project.location_id == location_id)
        )
        if (proj_result.scalar() or 0) > 0:
            raise AppException(ErrorCode.FARMER_LOCATION_HAS_PROJECTS)

        await db.delete(location)
        await db.commit()

    # ── Land Details ─────────────────────────────────────────

    async def create_land_detail(
        self, db: AsyncSession, account_id: uuid.UUID, data: LandDetailCreate
    ) -> FarmerLandDetail:
        profile = await self._get_profile_or_raise(db, account_id)

        # Verify location ownership
        loc_result = await db.execute(
            select(FarmerLocation).where(
                FarmerLocation.id == data.location_id,
                FarmerLocation.farmer_id == profile.id,
            )
        )
        if not loc_result.scalars().first():
            raise AppException(ErrorCode.FARMER_LAND_INVALID_LOCATION)

        new_land = FarmerLandDetail(
            farmer_id=profile.id,
            location_id=data.location_id,
            total_area=data.total_area,
            area_unit=data.area_unit,
            soil_type=data.soil_type,
            irrigation_type=data.irrigation_type,
        )
        db.add(new_land)
        await db.commit()
        await db.refresh(new_land)
        return new_land

    async def list_land_details(
        self, db: AsyncSession, account_id: uuid.UUID
    ) -> list[FarmerLandDetail]:
        profile = await self._get_profile_or_raise(db, account_id)
        return await self.land_repo.get_by_farmer(db, profile.id)

    async def get_land_detail(
        self, db: AsyncSession, account_id: uuid.UUID, land_id: uuid.UUID
    ) -> FarmerLandDetail:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLandDetail).where(
                FarmerLandDetail.id == land_id,
                FarmerLandDetail.farmer_id == profile.id,
            )
        )
        land = result.scalars().first()
        if not land:
            raise AppException(ErrorCode.FARMER_LAND_NOT_FOUND)
        return land

    async def update_land_detail(
        self, db: AsyncSession, account_id: uuid.UUID, land_id: uuid.UUID,
        data: LandDetailUpdate
    ) -> FarmerLandDetail:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLandDetail).where(
                FarmerLandDetail.id == land_id,
                FarmerLandDetail.farmer_id == profile.id,
            )
        )
        land = result.scalars().first()
        if not land:
            raise AppException(ErrorCode.FARMER_LAND_NOT_FOUND)

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(land, key, value)

        await db.commit()
        await db.refresh(land)
        return land

    async def delete_land_detail(
        self, db: AsyncSession, account_id: uuid.UUID, land_id: uuid.UUID
    ) -> None:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLandDetail).where(
                FarmerLandDetail.id == land_id,
                FarmerLandDetail.farmer_id == profile.id,
            )
        )
        land = result.scalars().first()
        if not land:
            raise AppException(ErrorCode.FARMER_LAND_NOT_FOUND)

        await db.delete(land)
        await db.commit()

    # ── Livestock ────────────────────────────────────────────

    async def create_livestock(
        self, db: AsyncSession, account_id: uuid.UUID, data: LivestockCreate
    ) -> FarmerLivestock:
        profile = await self._get_profile_or_raise(db, account_id)
        new_ls = FarmerLivestock(
            farmer_id=profile.id,
            animal_type=data.animal_type,
            count=data.count,
            purpose=data.purpose,
        )
        db.add(new_ls)
        await db.commit()
        await db.refresh(new_ls)
        return new_ls

    async def list_livestock(
        self, db: AsyncSession, account_id: uuid.UUID
    ) -> list[FarmerLivestock]:
        profile = await self._get_profile_or_raise(db, account_id)
        return await self.livestock_repo.get_by_farmer(db, profile.id)

    async def get_livestock(
        self, db: AsyncSession, account_id: uuid.UUID, livestock_id: uuid.UUID
    ) -> FarmerLivestock:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLivestock).where(
                FarmerLivestock.id == livestock_id,
                FarmerLivestock.farmer_id == profile.id,
            )
        )
        ls = result.scalars().first()
        if not ls:
            raise AppException(ErrorCode.FARMER_LIVESTOCK_NOT_FOUND)
        return ls

    async def update_livestock(
        self, db: AsyncSession, account_id: uuid.UUID, livestock_id: uuid.UUID,
        data: LivestockUpdate
    ) -> FarmerLivestock:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLivestock).where(
                FarmerLivestock.id == livestock_id,
                FarmerLivestock.farmer_id == profile.id,
            )
        )
        ls = result.scalars().first()
        if not ls:
            raise AppException(ErrorCode.FARMER_LIVESTOCK_NOT_FOUND)

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(ls, key, value)

        await db.commit()
        await db.refresh(ls)
        return ls

    async def delete_livestock(
        self, db: AsyncSession, account_id: uuid.UUID, livestock_id: uuid.UUID
    ) -> None:
        profile = await self._get_profile_or_raise(db, account_id)
        result = await db.execute(
            select(FarmerLivestock).where(
                FarmerLivestock.id == livestock_id,
                FarmerLivestock.farmer_id == profile.id,
            )
        )
        ls = result.scalars().first()
        if not ls:
            raise AppException(ErrorCode.FARMER_LIVESTOCK_NOT_FOUND)

        await db.delete(ls)
        await db.commit()

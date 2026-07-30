from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.base_repository import BaseRepository
from models.weather import WeatherCache, WeatherAlert
from datetime import date
import uuid

class WeatherCacheRepository(BaseRepository[WeatherCache, None, None]):
    def __init__(self):
        super().__init__(WeatherCache)

    async def get_by_location_and_date(self, db: AsyncSession, location_id: uuid.UUID, forecast_date: date):
        result = await db.execute(
            select(self.model)
            .where(self.model.location_id == location_id, self.model.forecast_date == forecast_date)
        )
        return result.scalars().first()

class WeatherAlertRepository(BaseRepository[WeatherAlert, None, None]):
    def __init__(self):
        super().__init__(WeatherAlert)

    async def get_unresolved_by_project(self, db: AsyncSession, project_id: uuid.UUID):
        result = await db.execute(
            select(self.model)
            .where(self.model.project_id == project_id, self.model.is_resolved == False)
            .order_by(self.model.target_date)
        )
        return result.scalars().all()

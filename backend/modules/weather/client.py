from typing import Dict, Any
from datetime import datetime, timedelta
from core.base_client import BaseAPIClient
from config import settings

class WeatherClient(BaseAPIClient):
    def __init__(self):
        super().__init__(base_url="https://api.openweathermap.org/data/2.5")
        self.api_key = settings.OPENWEATHER_API_KEY

    async def fetch_weather_data(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.api_key:
            self.logger.warning("No OPENWEATHER_API_KEY set. Using mock weather data.")
            return self._get_mock_weather(lat, lon)
            
        try:
            params = {
                "lat": lat,
                "lon": lon,
                "appid": self.api_key,
                "units": "metric"
            }
            return await self.get("/forecast", params=params)
        except Exception as e:
            self.logger.error(f"Failed to fetch from OpenWeatherMap: {e}")
            self.logger.info("Falling back to mock weather data.")
            return self._get_mock_weather(lat, lon)

    def _get_mock_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        now = datetime.utcnow()
        list_data = []
        
        for i in range(40):
            dt = now + timedelta(hours=3 * i)
            rain = 0
            if 8 <= i < 16:
                rain = 6.5
            temp = 28.0
            if 24 <= i < 32:
                temp = 35.0
                
            item = {
                "dt": int(dt.timestamp()),
                "dt_txt": dt.strftime("%Y-%m-%d %H:%M:%S"),
                "main": {
                    "temp": temp,
                    "humidity": 75,
                },
                "weather": [
                    {
                        "main": "Rain" if rain > 0 else "Clouds",
                        "description": "light rain" if rain > 0 else "scattered clouds",
                        "icon": "10d" if rain > 0 else "03d"
                    }
                ],
                "wind": {
                    "speed": 4.5
                },
            }
            
            if rain > 0:
                item["rain"] = {"3h": rain}
                
            list_data.append(item)
            
        return {
            "city": {
                "coord": {"lat": lat, "lon": lon}
            },
            "list": list_data
        }

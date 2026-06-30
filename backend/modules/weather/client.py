import httpx
from datetime import datetime, timedelta
from typing import Dict, Any
import logging
from config import settings

logger = logging.getLogger(__name__)

async def fetch_weather_data(lat: float, lon: float) -> Dict[str, Any]:
    api_key = settings.OPENWEATHER_API_KEY
    
    if not api_key:
        logger.warning("No OPENWEATHER_API_KEY set. Using mock weather data.")
        return _get_mock_weather(lat, lon)
        
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch from OpenWeatherMap: {e}")
            logger.info("Falling back to mock weather data.")
            return _get_mock_weather(lat, lon)

def _get_mock_weather(lat: float, lon: float) -> Dict[str, Any]:
    # Returns a fake OpenWeatherMap 5-day / 3-hour forecast structure
    now = datetime.utcnow()
    
    list_data = []
    
    # Generate 40 items (5 days * 8 intervals/day)
    for i in range(40):
        dt = now + timedelta(hours=3 * i)
        
        # Fake some rain on day 2
        rain = 0
        if 8 <= i < 16:
            rain = 6.5 # mm per 3h
            
        # Fake some heat on day 4
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
                "speed": 4.5 # m/s
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

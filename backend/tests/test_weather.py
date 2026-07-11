import pytest
from modules.weather.rules import WeatherRulesEngine, WeatherAlert

def test_weather_rain_skipping():
    # If rain is > 5mm, watering should be skipped
    res = WeatherRulesEngine.should_adjust_activity("watering", rain_mm=6.0, wind_kph=10.0, temp_c=25.0)
    assert res["action"] == "skip"
    assert "heavy rain" in res["reason"].lower()

def test_weather_wind_skipping():
    # If wind > 20kph, spraying should be postponed
    res = WeatherRulesEngine.should_adjust_activity("spraying", rain_mm=0.0, wind_kph=25.0, temp_c=25.0)
    assert res["action"] == "postpone"
    assert "wind" in res["reason"].lower()
    
def test_weather_alerts():
    alerts = WeatherRulesEngine.evaluate_alerts(temp_c=36.0, rain_mm=55.0, humidity_pct=85.0)
    alert_types = [a.type for a in alerts]
    
    assert "heat_stress" in alert_types
    assert "flood_risk" in alert_types
    assert "disease_risk" in alert_types

import pytest
from modules.weather.rules import (
    should_skip_watering,
    should_postpone_spraying,
    evaluate_weather_alerts,
)

def test_weather_rain_skipping():
    # If rain is > 5mm, watering should be skipped
    skip, reason = should_skip_watering(6.0)
    assert skip is True
    assert "rain" in reason.lower()

def test_weather_wind_skipping():
    # If wind > 20kph, spraying should be postponed
    postpone, reason = should_postpone_spraying(25.0)
    assert postpone is True
    assert "wind" in reason.lower()
    
def test_weather_alerts():
    alerts = evaluate_weather_alerts(55.0, 8.0, 90.0)
    alert_types = [a[0] for a in alerts]
    
    assert "heavy_rain" in alert_types
    assert "frost" in alert_types
    assert "disease_risk" in alert_types


"""
Deterministic Weather Rules Engine
"""

def should_skip_watering(rain_mm_today: float) -> tuple[bool, str]:
    """If rain exceeds 5mm, skip watering activities."""
    if rain_mm_today > 5.0:
        return True, f"Skipped due to sufficient rain forecast ({round(rain_mm_today, 1)}mm)"
    return False, ""

def should_postpone_fertilizing(rain_mm_today: float) -> tuple[bool, str]:
    """If heavy rain (>25mm) is expected, postpone fertilizing to prevent runoff."""
    if rain_mm_today > 25.0:
        return True, f"Postponed 1 day due to heavy rain risk ({round(rain_mm_today, 1)}mm)"
    return False, ""

def should_postpone_spraying(wind_kph_today: float) -> tuple[bool, str]:
    """If wind is strong (>20 kph), postpone spraying to prevent drift."""
    if wind_kph_today > 20.0:
        return True, f"Postponed 1 day due to high winds ({round(wind_kph_today, 1)} km/h)"
    return False, ""

def evaluate_weather_alerts(rain_tomorrow: float, min_temp_tomorrow: float, avg_humidity_tomorrow: float) -> list[tuple[str, str, str]]:
    """Evaluate conditions and return a list of alerts (type, severity, message)."""
    alerts = []
    
    if rain_tomorrow > 50.0:
        alerts.append(("heavy_rain", "high", f"Heavy rain expected tomorrow ({round(rain_tomorrow,1)}mm). Risk of flooding or runoff."))
        
    if min_temp_tomorrow < 10.0:
        alerts.append(("frost", "high", f"Frost warning tomorrow. Minimum temperature will drop to {round(min_temp_tomorrow, 1)}°C."))
        
    if avg_humidity_tomorrow > 85.0:
        alerts.append(("disease_risk", "medium", f"High humidity tomorrow ({round(avg_humidity_tomorrow, 1)}%). Increased risk of fungal diseases like Blight."))
        
    return alerts

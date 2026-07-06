# backend/seed/market_prices.py
# Initial market price data (30 days × 5 crops = 150 records)
from datetime import date, timedelta

def generate_market_prices():
    """Generate 30 days of price data for each crop."""
    base_date = date.today() - timedelta(days=30)
    
    # Base prices per kg in LKR (Sri Lankan Rupees) + daily variance pattern
    crop_prices = {
        "p1": {"name": "Tomato", "base": 160, "variance": [0, 2, -1, 5, 3, -2, 8, 10, 5, -3, 7, 12, 15, 10, 8, 5, -2, 3, 7, 10, 15, 12, 8, 5, 10, 15, 18, 20, 15, 12]},
        "p2": {"name": "Chili", "base": 350, "variance": [0, -5, 3, 8, -2, 5, 10, -8, 3, 7, 12, 15, 8, -3, 5, 10, 15, 20, 12, 8, -5, 3, 8, 12, 18, 22, 15, 10, 8, 5]},
        "p3": {"name": "Rice", "base": 95, "variance": [0, 0, 1, 0, 0, 1, 0, 2, 1, 0, 0, 1, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1, 0, 0, 1]},
        "p4": {"name": "Brinjal", "base": 120, "variance": [0, 3, -2, 5, 8, 3, -5, 2, 7, 10, 5, -3, 0, 5, 8, 12, 8, 3, -2, 5, 10, 15, 12, 8, 5, 3, 8, 12, 15, 10]},
        "p5": {"name": "Beans", "base": 200, "variance": [0, 5, 3, -2, 8, 5, 10, 3, -5, 2, 8, 12, 15, 10, 5, 3, 8, 15, 20, 18, 12, 8, 5, 10, 15, 20, 18, 15, 12, 10]},
    }
    
    prices = []
    for plant_key, data in crop_prices.items():
        for day_offset in range(30):
            d = base_date + timedelta(days=day_offset)
            price = data["base"] + data["variance"][day_offset]
            prices.append({
                "plant_id": plant_key,
                "region": "Jaffna",
                "date": d.isoformat(),
                "price_per_kg": price,
                "currency": "LKR",
                "source": "Jaffna Central Market",
            })
            # Also add Colombo prices (slightly different)
            prices.append({
                "plant_id": plant_key,
                "region": "Colombo",
                "date": d.isoformat(),
                "price_per_kg": price + 20,
                "currency": "LKR",
                "source": "Manning Market Colombo",
            })
    return prices

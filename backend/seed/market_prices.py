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
        "p6": {"name": "Onion", "base": 240, "variance": [0, 4, -2, 6, 8, 3, -4, 2, 8, 12, 6, -4, 2, 6, 10, 14, 10, 5, -3, 6, 12, 16, 14, 10, 6, 4, 8, 12, 16, 12]},
        "p7": {"name": "Potato", "base": 220, "variance": [0, 3, -1, 4, 6, 2, -3, 1, 6, 10, 5, -3, 1, 5, 8, 12, 8, 4, -2, 4, 9, 13, 11, 8, 5, 3, 6, 10, 13, 9]},
        "p8": {"name": "Cassava", "base": 130, "variance": [0, 1, -1, 2, 3, 1, -2, 0, 3, 5, 3, -2, 0, 2, 4, 6, 4, 2, -1, 2, 4, 6, 5, 3, 2, 1, 3, 5, 6, 4]},
        "p9": {"name": "Finger Millet", "base": 280, "variance": [0, 2, -1, 3, 4, 2, -2, 1, 3, 6, 4, -2, 1, 3, 5, 8, 6, 3, -1, 3, 6, 8, 7, 5, 3, 2, 4, 6, 8, 5]},
        "p10": {"name": "Coconut", "base": 110, "variance": [0, 1, -1, 2, 2, 1, -1, 0, 2, 3, 2, -1, 0, 1, 2, 4, 3, 2, -1, 1, 3, 4, 3, 2, 1, 1, 2, 3, 4, 3]},
        "p11": {"name": "Green Gram", "base": 500, "variance": [0, 5, -3, 8, 10, 4, -5, 2, 9, 15, 8, -5, 3, 8, 12, 18, 12, 6, -4, 7, 14, 20, 16, 11, 7, 5, 10, 14, 18, 13]},
        "p12": {"name": "Okra", "base": 140, "variance": [0, 2, -1, 3, 4, 1, -2, 1, 3, 6, 3, -2, 1, 3, 5, 8, 5, 3, -1, 2, 5, 7, 6, 4, 3, 2, 4, 6, 8, 5]},
        "p13": {"name": "Cowpea", "base": 480, "variance": [0, 4, -2, 6, 8, 3, -4, 1, 7, 12, 6, -4, 2, 6, 10, 15, 10, 5, -3, 6, 11, 16, 13, 9, 6, 4, 8, 11, 15, 11]},
        "p14": {"name": "Bitter Gourd", "base": 180, "variance": [0, 3, -2, 4, 6, 2, -3, 1, 5, 8, 4, -3, 1, 4, 7, 10, 7, 3, -2, 3, 6, 9, 8, 5, 3, 2, 5, 7, 9, 6]},
        "p15": {"name": "Sweet Potato", "base": 130, "variance": [0, 1, -1, 2, 3, 1, -2, 0, 3, 5, 3, -2, 0, 2, 4, 6, 4, 2, -1, 2, 4, 6, 5, 3, 2, 1, 3, 5, 6, 4]},
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

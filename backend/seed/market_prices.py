"""
Generate dynamic market price seeds across all crops and economic centers.
"""
from datetime import date, timedelta
import random

REGIONS = [
    "Dambulla Economic Centre",
    "Pettah Central Market",
    "Meegoda Economic Centre",
    "Narahenpita Economic Centre",
    "Keppetipola Dedicated Economic Centre",
    "Kandy Central Market",
    "Jaffna Thirunelvely Market"
]

BASE_PRICES = {
    "p1": 180,
    "p2": 180,
    "p3": 220,
    "p4": 180,
    "p5": 180,
    "p6": 180,
    "p7": 180,
    "p8": 250,
    "p9": 220,
    "p10": 250,
    "p11": 250,
    "p12": 180,
    "p13": 250,
    "p14": 180,
    "p15": 250,
    "p16": 250,
    "p17": 250,
    "p18": 250,
    "p19": 220,
    "p20": 220,
    "p21": 220,
    "p22": 220,
    "p23": 180,
    "p24": 180,
    "p25": 180,
    "p26": 180,
    "p27": 250,
    "p28": 180,
    "p29": 180,
    "p30": 180,
    "p31": 180,
    "p32": 350,
    "p33": 350,
    "p34": 350,
    "p35": 1200,
    "p36": 1200,
    "p37": 1200,
    "p38": 1200,
    "p39": 350,
    "p40": 180,
    "p41": 180,
    "p42": 180,
    "p43": 350,
    "p44": 250,
    "p45": 250,
    "p46": 250,
    "p47": 1200,
    "p48": 1200,
    "p49": 250,
    "p50": 250,
    "p51": 350,
    "p52": 350,
    "p53": 350,
    "p54": 350,
    "p55": 350,
    "p56": 350,
    "p57": 350,
    "p58": 180,
    "p59": 180,
    "p60": 180,
    "p61": 180,
    "p62": 250,
    "p63": 250,
    "p64": 250,
    "p65": 220,
    "p66": 1200,
    "p67": 250,
    "p68": 220,
    "p69": 250,
    "p70": 180,

}

def generate_market_prices(days_back=30):
    prices = []
    today = date.today()
    random.seed(42)

    for plant_id, base_price in BASE_PRICES.items():
        for region in REGIONS[:3]:
            for d in range(days_back):
                record_date = today - timedelta(days=d)
                fluctuation = random.uniform(-0.15, 0.15)
                price = round(base_price * (1 + fluctuation), 2)

                prices.append({
                    "plant_id": plant_id,
                    "region": region,
                    "date": record_date.isoformat(),
                    "price_per_kg": price,
                    "currency": "LKR",
                    "source": "Department of Agriculture / Central Bank"
                })

    return prices

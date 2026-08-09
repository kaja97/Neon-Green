# AgriFarm AI — Data Seed Guide

## Overview
The master data is the foundation of the platform. Without properly seeded data, no project can generate activities, no disease matching works, and no soil analysis is accurate.

This document defines what data must be seeded, the exact format, and example records.

---

## Seed Priority Order

```
1. farming_methods        (3 records — must exist first)
2. plants                 (5 crops for v1.0)
3. plant_stages           (6 stages per plant = 30 records)
4. plant_nutrient_requirements  (per plant per stage = 30 records)
5. plant_water_requirements     (per plant per stage = 30 records)
6. plant_fertilizer_recommendations (per stage × method = 60 records)
7. plant_diseases          (8-10 per crop)
8. disease_solutions       (per disease × method)
9. plant_pests             (5-8 per crop)
10. pest_solutions          (per pest × method)
```

---

## 1. Farming Methods (3 records)

```python
FARMING_METHODS = [
    {"code": "organic", "name": "Organic Farming",
     "description": "Uses natural inputs only. No synthetic chemicals, pesticides, or GMO seeds."},
    {"code": "inorganic", "name": "Conventional Farming",
     "description": "Uses synthetic fertilizers and chemical pesticides for maximum yield."},
    {"code": "integrated", "name": "Integrated Farming",
     "description": "Combines organic and conventional methods. Uses chemicals only when natural methods fail."}
]
```

---

## 2. Plants (5 Priority Crops for v1.0)

```python
PLANTS = [
    {
        "common_name": "Tomato",
        "local_name": "තක්කාලි / தக்காளி",
        "scientific_name": "Solanum lycopersicum",
        "category": "vegetable",
        "growth_duration_days": 90,
        "planting_season": ["Yala", "Maha"],
        "optimal_temp_min": 20.0,
        "optimal_temp_max": 30.0,
        "optimal_rainfall_mm": 500.0,
        "optimal_ph_min": 6.0,
        "optimal_ph_max": 6.8,
        "compatible_soil_types": ["loam", "sandy_loam", "clay_loam"],
        "companion_plants": ["basil", "carrot", "marigold"],
        "incompatible_plants": ["cabbage", "fennel"],
        "description": "Most popular vegetable crop in Sri Lanka. High market demand year-round.",
        "is_active": True
    },
    {
        "common_name": "Chili",
        "local_name": "මිරිස් / மிளகாய்",
        "scientific_name": "Capsicum annuum",
        "category": "vegetable",
        "growth_duration_days": 115,
        "planting_season": ["Yala", "Maha"],
        "optimal_temp_min": 20.0,
        "optimal_temp_max": 35.0,
        "optimal_rainfall_mm": 600.0,
        "optimal_ph_min": 6.0,
        "optimal_ph_max": 7.0,
        "compatible_soil_types": ["loam", "sandy_loam"],
        "description": "Essential spice crop. Multiple harvests possible per season.",
        "is_active": True
    },
    {
        "common_name": "Rice (Paddy)",
        "local_name": "වී / நெல்",
        "scientific_name": "Oryza sativa",
        "category": "grain",
        "growth_duration_days": 120,
        "planting_season": ["Maha"],
        "optimal_temp_min": 22.0,
        "optimal_temp_max": 32.0,
        "optimal_rainfall_mm": 1200.0,
        "optimal_ph_min": 5.5,
        "optimal_ph_max": 6.5,
        "compatible_soil_types": ["clay", "clay_loam"],
        "description": "Staple food crop of Sri Lanka. Grown primarily in irrigated lowlands.",
        "is_active": True
    },
    {
        "common_name": "Brinjal (Eggplant)",
        "local_name": "වම්බටු / கத்திரிக்காய்",
        "scientific_name": "Solanum melongena",
        "category": "vegetable",
        "growth_duration_days": 100,
        "planting_season": ["Yala", "Maha"],
        "optimal_temp_min": 22.0,
        "optimal_temp_max": 35.0,
        "optimal_rainfall_mm": 500.0,
        "optimal_ph_min": 5.5,
        "optimal_ph_max": 6.5,
        "compatible_soil_types": ["loam", "sandy_loam", "clay_loam"],
        "description": "Hardy vegetable with consistent demand. Multiple harvests per season.",
        "is_active": True
    },
    {
        "common_name": "Green Beans",
        "local_name": "බෝංචි / பீன்ஸ்",
        "scientific_name": "Phaseolus vulgaris",
        "category": "vegetable",
        "growth_duration_days": 65,
        "planting_season": ["Yala", "Maha"],
        "optimal_temp_min": 18.0,
        "optimal_temp_max": 28.0,
        "optimal_rainfall_mm": 400.0,
        "optimal_ph_min": 6.0,
        "optimal_ph_max": 7.0,
        "compatible_soil_types": ["loam", "sandy_loam"],
        "description": "Fast-growing legume. Fixes nitrogen naturally, improving soil.",
        "is_active": True
    }
]
```

---

## 3. Plant Stages (Example: Tomato — 6 stages)

```python
TOMATO_STAGES = [
    {
        "stage_name": "Germination",
        "stage_order": 1,
        "start_day": 0,
        "end_day": 7,
        "description": "Seed absorbs water and swells. Root radical emerges. First shoots push through soil surface.",
        "key_indicators": "White root tip visible within 3-4 days. First cotyledon leaves emerge by day 5-7.",
        "critical_actions": "Maintain consistent soil moisture (not waterlogged). Temperature 25-30°C ideal. Use seed trays or nursery beds.",
        "watch_for": "Damping off disease (fungal). Over-watering causes root rot. Birds eating seeds."
    },
    {
        "stage_name": "Seedling",
        "stage_order": 2,
        "start_day": 8,
        "end_day": 21,
        "description": "True leaves develop. Stem thickens and strengthens. Root system establishes.",
        "key_indicators": "2-4 true leaves visible. Stem diameter 3-4mm. Plant height 10-15cm by day 21.",
        "critical_actions": "Transplant to main field at day 14-21. Apply starter fertilizer (light). Begin hardening off seedlings.",
        "watch_for": "Aphids on tender leaves. Cutworms at stem base. Nutrient burn from excess fertilizer."
    },
    {
        "stage_name": "Vegetative",
        "stage_order": 3,
        "start_day": 22,
        "end_day": 42,
        "description": "Rapid leaf and stem growth. Plant builds the framework for fruiting.",
        "key_indicators": "Plant reaches 40-60cm. Dense foliage. Strong main stem with lateral branches.",
        "critical_actions": "Apply nitrogen-heavy fertilizer. Install stakes or cages for support. Remove suckers (side shoots). Begin pest monitoring.",
        "watch_for": "Leaf curl virus (transmitted by whitefly). Bacterial wilt. Nitrogen deficiency (yellowing lower leaves)."
    },
    {
        "stage_name": "Flowering",
        "stage_order": 4,
        "start_day": 43,
        "end_day": 60,
        "description": "Yellow flower clusters form. Pollination occurs. Critical period for fruit set.",
        "key_indicators": "Flower clusters at leaf nodes. Petals yellow, star-shaped. Small green fruit forms after pollination.",
        "critical_actions": "Switch to potassium-rich fertilizer (reduce nitrogen). Maintain consistent irrigation (irregular watering causes blossom drop). Gentle tapping to aid pollination.",
        "watch_for": "Blossom end rot (calcium deficiency). Late Blight (high humidity). Flower drop (temperature stress >35°C)."
    },
    {
        "stage_name": "Fruiting",
        "stage_order": 5,
        "start_day": 61,
        "end_day": 80,
        "description": "Fruits enlarge and begin to ripen. Color change from green to red.",
        "key_indicators": "Fruits 5-8cm diameter. Colour change begins at fruit bottom. Clusters bearing 3-6 fruits each.",
        "critical_actions": "Continue potassium fertilizer. Consistent watering to prevent fruit cracking. Support heavy fruit clusters. Monitor for fruit rot.",
        "watch_for": "Fruit cracking (irregular watering). Sun scald. Fruit worm. Anthracnose (dark sunken spots)."
    },
    {
        "stage_name": "Harvest",
        "stage_order": 6,
        "start_day": 81,
        "end_day": 90,
        "description": "Fruits fully ripe. Pick regularly to encourage continued production.",
        "key_indicators": "Fruits uniformly red, firm but slightly soft. Easy to detach from vine.",
        "critical_actions": "Harvest every 2-3 days. Pick in early morning for best shelf life. Grade by size. Check market prices before selling.",
        "watch_for": "Over-ripening on vine. Bird damage. Post-harvest bruising."
    }
]
```

---

## 4. Nutrient Requirements (Example: Tomato — per stage)

```python
TOMATO_NUTRIENTS = [
    # Germination — minimal nutrients needed
    {"stage_order": 1, "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    # Seedling — light starter feed
    {"stage_order": 2, "nitrogen_kg": 5, "phosphorus_kg": 3, "potassium_kg": 2},
    # Vegetative — heavy nitrogen for leaf growth
    {"stage_order": 3, "nitrogen_kg": 30, "phosphorus_kg": 10, "potassium_kg": 15},
    # Flowering — shift to potassium
    {"stage_order": 4, "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 30},
    # Fruiting — maintain potassium
    {"stage_order": 5, "nitrogen_kg": 8, "phosphorus_kg": 10, "potassium_kg": 35},
    # Harvest — minimal
    {"stage_order": 6, "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5}
]
# All values are kg per acre
```

---

## 5. Water Requirements (Example: Tomato — per stage)

```python
TOMATO_WATER = [
    {"stage_order": 1, "water_mm_per_day": 3.0, "frequency_days": 1, "drought_tolerance": "low"},
    {"stage_order": 2, "water_mm_per_day": 4.0, "frequency_days": 2, "drought_tolerance": "low"},
    {"stage_order": 3, "water_mm_per_day": 5.5, "frequency_days": 2, "drought_tolerance": "medium"},
    {"stage_order": 4, "water_mm_per_day": 6.0, "frequency_days": 2, "drought_tolerance": "low"},
    {"stage_order": 5, "water_mm_per_day": 6.5, "frequency_days": 2, "drought_tolerance": "low"},
    {"stage_order": 6, "water_mm_per_day": 4.0, "frequency_days": 3, "drought_tolerance": "medium"}
]
# water_mm_per_day = millimeters of water per day per acre
# frequency_days = irrigate every N days
```

---

## 6. Fertilizer Recommendations (Example: Tomato — seed/fertilizers.py)

```python
# Fertilizer recommendations format in backend/seed/fertilizers.py
fertilizers = [
    # ── Tomato ──────────────────────────────
    {"stage_id": "s2", "farming_method": "conventional", "fertilizer_name": "Starter NPK 10-26-26", "rate": 50, "instructions": "Apply at transplanting as basal dose. Mix well into soil."},
    {"stage_id": "s2", "farming_method": "organic", "fertilizer_name": "Vermicompost", "rate": 200, "instructions": "Mix into planting holes before transplanting seedlings."},
    {"stage_id": "s3", "farming_method": "conventional", "fertilizer_name": "Urea (46-0-0)", "rate": 30, "instructions": "Side-dress 10 cm from stem. Water immediately after."},
    {"stage_id": "s3", "farming_method": "organic", "fertilizer_name": "Blood Meal", "rate": 25, "instructions": "Side-dress around plants. High nitrogen for vegetative growth."},
]
```

---

## 7. Diseases (Example: Tomato — 8 Common Diseases)

```python
TOMATO_DISEASES = [
    {
        "disease_name": "Early Blight",
        "local_name": "මුල් ලප රෝගය",
        "pathogen_type": "fungal",
        "symptoms": "dark brown concentric ring spots on lower leaves yellowing leaf margins",
        "visual_symptoms": "Brown spots with bullseye rings on older leaves. Leaves turn yellow and drop off starting from the bottom.",
        "affected_parts": ["leaves", "stem", "fruit"],
        "spread_conditions": "Warm temperatures (24-29°C) with high humidity. Splashing rain or overhead irrigation.",
        "severity": "medium"
    },
    {
        "disease_name": "Late Blight",
        "local_name": "පසු ලප රෝගය",
        "pathogen_type": "fungal",
        "symptoms": "large water-soaked lesions dark brown spots white fuzzy growth on leaf undersides",
        "visual_symptoms": "Large, dark, water-soaked patches on leaves. White cottony growth on undersides in humid mornings. Entire plant can collapse in 3-5 days.",
        "affected_parts": ["leaves", "stem", "fruit"],
        "spread_conditions": "Cool nights (10-20°C) + warm humid days. Spreads rapidly via wind-borne spores.",
        "severity": "critical"
    },
    {
        "disease_name": "Bacterial Wilt",
        "local_name": "බැක්ටීරියා වාත රෝගය",
        "pathogen_type": "bacterial",
        "symptoms": "sudden wilting of entire plant no leaf yellowing stem cross-section shows brown vascular tissue",
        "visual_symptoms": "Plant suddenly wilts without yellowing. When you cut the stem, the center is brown. If you put a cut stem in water, milky ooze drips out.",
        "affected_parts": ["stem", "roots"],
        "spread_conditions": "Waterlogged soil, warm temperatures >28°C, poor drainage. Spreads through contaminated soil and tools.",
        "severity": "critical"
    },
    {
        "disease_name": "Leaf Curl Virus",
        "local_name": "පත්‍ර කුරුලෑ විෂබීජ",
        "pathogen_type": "viral",
        "symptoms": "leaves curling upward thickened crumpled leaves stunted growth",
        "visual_symptoms": "Leaves curl upward and become thick and leathery. New growth is stunted and bushy. Plant stops producing fruit.",
        "affected_parts": ["leaves"],
        "spread_conditions": "Transmitted by whitefly. Warm dry conditions favour whitefly populations.",
        "severity": "high"
    },
    {
        "disease_name": "Blossom End Rot",
        "local_name": "මල් කෙළවර කුණුවීම",
        "pathogen_type": "physiological",
        "symptoms": "dark brown leathery patch on bottom of fruit sunken area calcium deficiency",
        "visual_symptoms": "Dark brown, sunken, leathery patch on the bottom of the fruit. Starts small and grows. Not caused by a pathogen.",
        "affected_parts": ["fruit"],
        "spread_conditions": "Irregular watering, calcium deficiency in soil, over-fertilization with nitrogen.",
        "severity": "medium"
    },
    {
        "disease_name": "Powdery Mildew",
        "pathogen_type": "fungal",
        "symptoms": "white powdery coating on leaf surface leaves yellowing curling",
        "visual_symptoms": "White powdery spots on leaf surfaces. Leaves eventually yellow and die. Common in dry weather with cool nights.",
        "affected_parts": ["leaves"],
        "severity": "medium"
    },
    {
        "disease_name": "Anthracnose",
        "pathogen_type": "fungal",
        "symptoms": "dark sunken circular spots on ripe fruit concentric rings fruit rot",
        "visual_symptoms": "Dark, sunken, circular spots on ripening fruit. Spots have concentric ring pattern. Fruit rots quickly.",
        "affected_parts": ["fruit"],
        "severity": "medium"
    },
    {
        "disease_name": "Fusarium Wilt",
        "pathogen_type": "fungal",
        "symptoms": "one-sided wilting yellowing on one side of plant brown vascular tissue",
        "visual_symptoms": "Leaves on one side of the plant wilt and turn yellow. Cut stem shows brown streaks in the vascular tissue.",
        "affected_parts": ["stem", "roots", "leaves"],
        "severity": "high"
    }
]
```

---

## 8. Disease Solutions (Example: Early Blight)

```python
EARLY_BLIGHT_SOLUTIONS = [
    # Organic
    {
        "method": "organic",
        "solution_name": "Bordeaux Mixture",
        "product_name": "Copper sulfate + Slaked lime",
        "active_ingredient": "Copper",
        "dosage": "10g copper sulfate + 10g lime per 1 liter water",
        "application_method": "Full coverage foliar spray on both leaf sides",
        "frequency": "Every 7-10 days",
        "timing": "Early morning, when dew has dried",
        "waiting_period_days": 7,
        "precautions": "Do not mix with other chemicals. Wear gloves.",
        "estimated_cost": 250.0,
        "effectiveness": 7
    },
    {
        "method": "organic",
        "solution_name": "Neem Oil Spray",
        "product_name": "Cold-pressed neem oil",
        "active_ingredient": "Azadirachtin",
        "dosage": "5ml neem oil + 2ml liquid soap per 1 liter water",
        "application_method": "Foliar spray, cover all leaf surfaces",
        "frequency": "Every 5-7 days",
        "timing": "Evening, avoid direct sunlight",
        "waiting_period_days": 3,
        "precautions": "Emulsify well before spraying. Test on one leaf first.",
        "estimated_cost": 180.0,
        "effectiveness": 6
    },
    # Conventional
    {
        "method": "conventional",
        "solution_name": "Mancozeb Spray",
        "product_name": "Dithane M-45",
        "active_ingredient": "Mancozeb 75% WP",
        "dosage": "2g per liter of water",
        "application_method": "Full coverage foliar spray",
        "frequency": "Every 7-10 days",
        "timing": "Morning, dry conditions",
        "waiting_period_days": 14,
        "precautions": "Wear mask and gloves. Do not apply within 14 days of harvest.",
        "estimated_cost": 350.0,
        "effectiveness": 9
    },
    {
        "method": "conventional",
        "solution_name": "Chlorothalonil",
        "product_name": "Daconil 2787",
        "active_ingredient": "Chlorothalonil 75% WP",
        "dosage": "2g per liter of water",
        "application_method": "Protective foliar spray",
        "frequency": "Every 7 days (preventive) or 5 days (active infection)",
        "timing": "Morning, dry weather expected for 24 hours",
        "waiting_period_days": 7,
        "precautions": "Toxic to fish. Do not apply near water sources.",
        "estimated_cost": 400.0,
        "effectiveness": 9
    }
]
```

---

## 9. Seed Script Structure

```python
# backend/seed/run_seed.py
import asyncio
from database import async_session
from seed.farming_methods import seed_farming_methods
from seed.plants import seed_plants
from seed.stages import seed_stages
from seed.nutrients import seed_nutrients
from seed.water import seed_water
from seed.fertilizers import seed_fertilizers
from seed.diseases import seed_diseases
from seed.solutions import seed_solutions
from seed.pests import seed_pests

async def run_all_seeds():
    async with async_session() as db:
        print("🌱 Seeding farming methods...")
        await seed_farming_methods(db)

        print("🌱 Seeding plants (5 crops)...")
        await seed_plants(db)

        print("🌱 Seeding plant stages...")
        await seed_stages(db)

        print("🌱 Seeding nutrient requirements...")
        await seed_nutrients(db)

        print("🌱 Seeding water requirements...")
        await seed_water(db)

        print("🌱 Seeding fertilizer recommendations...")
        await seed_fertilizers(db)

        print("🌱 Seeding diseases & solutions...")
        await seed_diseases(db)
        await seed_solutions(db)

        print("🌱 Seeding pests & solutions...")
        await seed_pests(db)

        print("✅ All seed data loaded!")

if __name__ == "__main__":
    asyncio.run(run_all_seeds())
```

### Run Command
```bash
# After running migrations:
python -m backend.seed.run_seed
```

---

## Seed Data Validation Checklist

| Check | Expected |
|-------|----------|
| `SELECT COUNT(*) FROM farming_methods` | 3 |
| `SELECT COUNT(*) FROM plants` | 5 |
| `SELECT COUNT(*) FROM plant_stages` | 30 (6 per crop) |
| `SELECT COUNT(*) FROM plant_nutrient_requirements` | 30 (1 per stage) |
| `SELECT COUNT(*) FROM plant_water_requirements` | 30 (1 per stage) |
| `SELECT COUNT(*) FROM plant_fertilizer_recommendations` | ~60 (organic + conventional per stage) |
| `SELECT COUNT(*) FROM plant_diseases WHERE plant_id = (tomato)` | 8 |
| `SELECT COUNT(*) FROM disease_solutions` | ~32 (2 per disease per method) |
| Create a tomato project → check activities generated | ~77 activities |

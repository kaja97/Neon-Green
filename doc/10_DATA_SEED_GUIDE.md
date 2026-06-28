# AgriFarm AI — Data Seed Guide

## Overview
The master data is the foundation of the platform. Without properly seeded data, no project can generate activities, no disease watch works, and no soil analysis is accurate.

This document defines what seed data is needed, the format, and the seeding order.

---

## Seeding Order (Respect Foreign Keys)

```
1. farming_methods
2. plants
3. plant_stages           (requires plants)
4. plant_nutrient_requirements   (requires plants + plant_stages)
5. plant_water_requirements      (requires plants + plant_stages)
6. plant_fertilizer_recommendations (requires plants + plant_stages)
7. plant_diseases         (requires plants)
8. plant_pests            (requires plants)
9. disease_solutions      (requires plant_diseases + farming_methods)
10. pest_solutions        (requires plant_pests + farming_methods)
```

---

## 1. Farming Methods

```python
FARMING_METHODS = [
    {
        "code": "organic",
        "name": "Organic Farming",
        "description": "Uses only natural inputs — compost, bio-pesticides, neem-based products. No synthetic chemicals."
    },
    {
        "code": "conventional",
        "name": "Conventional Farming",
        "description": "Uses synthetic fertilizers and chemical pesticides for maximum yield."
    },
    {
        "code": "integrated",
        "name": "Integrated Farming",
        "description": "Combines organic and conventional methods. Minimizes chemicals while ensuring good yields."
    }
]
```

---

## 2. Plants (Priority Crops)

### Minimum Required for Launch (8 crops)
```python
PRIORITY_PLANTS = [
    {
        "common_name": "Tomato",
        "local_name": "Thakkali",
        "scientific_name": "Solanum lycopersicum",
        "category": "vegetable",
        "sub_category": "fruit vegetable",
        "growth_duration_days": 90,
        "planting_season": ["Yala", "Maha"],
        "optimal_temp_min": 18, "optimal_temp_max": 29,
        "optimal_rainfall_mm": 600,
        "optimal_ph_min": 6.0, "optimal_ph_max": 6.8,
        "compatible_soil_types": ["loam", "sandy loam", "clay loam"],
        "companion_plants": ["basil", "carrot", "marigold"],
        "incompatible_plants": ["fennel", "brassica"]
    },
    {
        "common_name": "Beans (Green)",
        "local_name": "Bonchi",
        "scientific_name": "Phaseolus vulgaris",
        "category": "vegetable",
        "growth_duration_days": 60,
        "optimal_temp_min": 16, "optimal_temp_max": 24,
        "optimal_ph_min": 6.0, "optimal_ph_max": 7.0,
        "compatible_soil_types": ["loam", "sandy loam"]
    },
    {
        "common_name": "Cabbage",
        "local_name": "Gova",
        "scientific_name": "Brassica oleracea var. capitata",
        "category": "vegetable",
        "growth_duration_days": 80,
        "optimal_temp_min": 7, "optimal_temp_max": 24,
        "optimal_ph_min": 6.0, "optimal_ph_max": 7.5
    },
    {
        "common_name": "Chilli (Red)",
        "local_name": "Miris",
        "scientific_name": "Capsicum annuum",
        "category": "vegetable",
        "growth_duration_days": 120,
        "optimal_temp_min": 20, "optimal_temp_max": 32,
        "optimal_ph_min": 6.0, "optimal_ph_max": 6.8
    },
    {
        "common_name": "Brinjal (Eggplant)",
        "local_name": "Wambatu",
        "scientific_name": "Solanum melongena",
        "category": "vegetable",
        "growth_duration_days": 90,
        "optimal_temp_min": 22, "optimal_temp_max": 32,
        "optimal_ph_min": 5.5, "optimal_ph_max": 6.8
    },
    {
        "common_name": "Paddy (Rice)",
        "local_name": "Ala",
        "scientific_name": "Oryza sativa",
        "category": "grain",
        "growth_duration_days": 120,
        "planting_season": ["Yala", "Maha"],
        "optimal_temp_min": 20, "optimal_temp_max": 35,
        "optimal_ph_min": 5.5, "optimal_ph_max": 6.5
    },
    {
        "common_name": "Carrot",
        "local_name": "Carrot",
        "scientific_name": "Daucus carota",
        "category": "vegetable",
        "growth_duration_days": 75,
        "optimal_temp_min": 10, "optimal_temp_max": 24,
        "optimal_ph_min": 6.0, "optimal_ph_max": 6.8
    },
    {
        "common_name": "Okra (Ladies Finger)",
        "local_name": "Bandakka",
        "scientific_name": "Abelmoschus esculentus",
        "category": "vegetable",
        "growth_duration_days": 60,
        "optimal_temp_min": 24, "optimal_temp_max": 35,
        "optimal_ph_min": 6.0, "optimal_ph_max": 7.5
    }
]

# Phase 2 crops (add after launch)
PHASE_2_PLANTS = [
    "Cucumber", "Pumpkin", "Bitter Gourd", "Snake Gourd", "Spinach",
    "Maize (Corn)", "Potato", "Sweet Potato", "Banana", "Papaya",
    "Mango", "Coconut", "Rubber", "Tea", "Ginger", "Turmeric"
]
```

---

## 3. Plant Stages (Example: Tomato)

```python
TOMATO_STAGES = [
    {
        "stage_name": "Germination",
        "stage_order": 1,
        "start_day": 0,
        "end_day": 7,
        "description": "Seeds germinate and develop root system. Keep moist and warm.",
        "key_indicators": "Seedlings emerge from soil, first two seed leaves (cotyledons) appear.",
        "critical_actions": "Keep growing medium moist but not waterlogged. Maintain 24–28°C. Provide indirect light.",
        "watch_for": "Damping off (fungal disease at soil level). Over-watering. Poor germination."
    },
    {
        "stage_name": "Seedling / Transplant",
        "stage_order": 2,
        "start_day": 7,
        "end_day": 21,
        "description": "Seedlings develop true leaves. Transplant to field at 2–4 true leaves.",
        "key_indicators": "2–4 true leaves visible. Stem is firm. Seedling is 10–15 cm tall.",
        "critical_actions": "Transplant carefully — avoid root disturbance. Water thoroughly after transplanting. Apply starter fertilizer. Provide shade for first 3 days.",
        "watch_for": "Transplant shock (wilting). Cutworm attack. Damping off."
    },
    {
        "stage_name": "Vegetative Growth",
        "stage_order": 3,
        "start_day": 21,
        "end_day": 42,
        "description": "Rapid stem and leaf growth. Plant establishes root system.",
        "key_indicators": "Plant is 30–60 cm tall. Multiple lateral branches visible. Dark green healthy leaves.",
        "critical_actions": "Apply nitrogen-rich fertilizer. Begin staking. Remove suckers (side shoots from leaf axils). Regular watering every 2 days. Weed control.",
        "watch_for": "Aphids on new growth. Leaf miners. Nitrogen deficiency (yellowing lower leaves)."
    },
    {
        "stage_name": "Flowering",
        "stage_order": 4,
        "start_day": 42,
        "end_day": 60,
        "description": "Yellow flowers appear. Critical stage — blossom set determines yield.",
        "key_indicators": "Yellow flower clusters visible. Flowers open in the morning. First flowers on bottom trusses.",
        "critical_actions": "Switch to potassium + phosphorus fertilizer. REDUCE nitrogen. Keep soil consistently moist. Avoid spraying during peak flowering (9am–3pm). Ensure good pollination.",
        "watch_for": "Blossom drop (heat, cold, drought, water stress). Late Blight (high humidity). Fruit borers starting. Blossom End Rot (calcium deficiency)."
    },
    {
        "stage_name": "Fruit Development",
        "stage_order": 5,
        "start_day": 60,
        "end_day": 78,
        "description": "Green fruits enlarge and develop. Most critical stage for water management.",
        "key_indicators": "Green fruits visible on all trusses. Fruits are firm and enlarging.",
        "critical_actions": "Consistent irrigation — irregular watering causes Blossom End Rot and fruit cracking. Continue K + Ca fertilizer. Monitor for fruit borers and disease.",
        "watch_for": "Fruit borers (holes in fruit). Blossom End Rot (brown patch on blossom end). Fruit cracking from irregular watering. Late Blight spread."
    },
    {
        "stage_name": "Ripening & Harvest",
        "stage_order": 6,
        "start_day": 78,
        "end_day": 90,
        "description": "Fruits change color from green to red/pink. Harvest when 70–80% red.",
        "key_indicators": "Fruits turning pink/red from bottom. Skin color change uniform.",
        "critical_actions": "Reduce irrigation (slight drydown improves flavor and shelf life). Harvest every 2–3 days. Handle gently to avoid bruising. Do NOT wait for 100% red (too ripe for market).",
        "watch_for": "Overripe fruit drop. Bird damage. Post-harvest rot. Fruit flies."
    }
]
```

---

## 4. Nutrient Requirements (Example: Tomato)

```python
# Total season N-P-K requirements for tomato per acre
# These are SPLIT across stages proportionally

TOMATO_NUTRIENT_REQUIREMENTS = [
    {
        "stage": "Germination",
        "nitrogen_kg_per_acre": 0,       # No fertilizer during germination
        "phosphorus_kg_per_acre": 0,
        "potassium_kg_per_acre": 0,
    },
    {
        "stage": "Seedling / Transplant",
        "nitrogen_kg_per_acre": 15,      # Starter dose at transplant
        "phosphorus_kg_per_acre": 30,    # High P for root development
        "potassium_kg_per_acre": 15,
        "calcium_kg_per_acre": 10,
    },
    {
        "stage": "Vegetative Growth",
        "nitrogen_kg_per_acre": 40,      # High N for leafy growth
        "phosphorus_kg_per_acre": 20,
        "potassium_kg_per_acre": 25,
    },
    {
        "stage": "Flowering",
        "nitrogen_kg_per_acre": 15,      # REDUCE N, boost K and P
        "phosphorus_kg_per_acre": 25,    # P for flower development
        "potassium_kg_per_acre": 45,     # K for fruit set
        "calcium_kg_per_acre": 15,
        "boron_ppm": 2.0                 # B for pollen tube growth
    },
    {
        "stage": "Fruit Development",
        "nitrogen_kg_per_acre": 10,
        "phosphorus_kg_per_acre": 15,
        "potassium_kg_per_acre": 50,     # Highest K for fruit sizing
        "calcium_kg_per_acre": 20,       # Ca prevents Blossom End Rot
    },
    {
        "stage": "Ripening & Harvest",
        "nitrogen_kg_per_acre": 0,       # No more fertilizer during ripening
        "potassium_kg_per_acre": 15,
    }
]
```

---

## 5. Fertilizer Recommendations (Example: Tomato)

```python
TOMATO_FERTILIZER_RECS = [
    # At transplanting (Seedling stage)
    {
        "stage": "Seedling / Transplant",
        "fertilizer_type": "Triple Super Phosphate (TSP)",
        "is_organic": False,
        "quantity_per_acre": 50,  # kg
        "unit": "kg",
        "application_method": "band",
        "timing_note": "Apply in planting hole/trench at transplant time"
    },
    {
        "stage": "Seedling / Transplant",
        "fertilizer_type": "Compost",
        "is_organic": True,
        "quantity_per_acre": 2000,  # kg (2 tonnes)
        "unit": "kg",
        "application_method": "broadcast",
        "timing_note": "Apply 1 week before transplanting, incorporate into soil"
    },

    # Vegetative growth
    {
        "stage": "Vegetative Growth",
        "fertilizer_type": "Urea (46-0-0)",
        "is_organic": False,
        "quantity_per_acre": 40,
        "unit": "kg",
        "application_method": "broadcast",
        "timing_note": "Split into 2 doses: Day 21 and Day 35"
    },
    {
        "stage": "Vegetative Growth",
        "fertilizer_type": "Blood Meal",
        "is_organic": True,
        "quantity_per_acre": 25,
        "unit": "kg",
        "application_method": "broadcast",
        "timing_note": "Apply at Day 21, water in thoroughly"
    },

    # Flowering
    {
        "stage": "Flowering",
        "fertilizer_type": "Muriate of Potash (MOP 0-0-60)",
        "is_organic": False,
        "quantity_per_acre": 45,
        "unit": "kg",
        "application_method": "broadcast",
        "timing_note": "Apply at start of flowering stage (Day 42)"
    },
    {
        "stage": "Flowering",
        "fertilizer_type": "Wood Ash",
        "is_organic": True,
        "quantity_per_acre": 100,
        "unit": "kg",
        "application_method": "broadcast",
        "timing_note": "Apply at start of flowering, water in after"
    },

    # Fruit Development
    {
        "stage": "Fruit Development",
        "fertilizer_type": "Calcium Nitrate",
        "is_organic": False,
        "quantity_per_acre": 25,
        "unit": "kg",
        "application_method": "foliar",
        "timing_note": "Spray 0.5% solution every 10 days — prevents Blossom End Rot"
    },
    {
        "stage": "Fruit Development",
        "fertilizer_type": "Eggshell Powder",
        "is_organic": True,
        "quantity_per_acre": 15,
        "unit": "kg",
        "application_method": "broadcast",
        "timing_note": "Apply at start of fruit development stage"
    }
]
```

---

## 6. Disease Seed Data (Example: Key Tomato Diseases)

```python
TOMATO_DISEASES = [
    {
        "disease_name": "Early Blight",
        "local_name": "Muhu Blight",
        "pathogen_type": "fungal",
        "symptoms": "Brown spots with concentric rings (target pattern) on older lower leaves. Yellowing around spots. Dark lesions on stem.",
        "visual_symptoms": "Round brown spots with yellow halo on lower leaves. Spots have bullseye pattern. Leaves turn yellow and fall.",
        "affected_parts": ["leaves", "stem", "fruit"],
        "spread_conditions": "High humidity (>70%), warm temperatures (24–29°C), wet weather",
        "spread_method": "wind, rain splash, infected plant debris",
        "severity": "medium",
        "incubation_period": "3–5 days after infection",
        "solutions": {
            "conventional": [
                {
                    "solution_name": "Mancozeb Spray",
                    "product_name": "Mancozeb 75 WP",
                    "description": "Protective fungicide. Apply before symptoms appear or at first sign.",
                    "dosage": "2g per litre of water",
                    "application_method": "Spray all leaf surfaces, especially undersides",
                    "frequency": "Every 7 days",
                    "timing": "Early morning or late afternoon",
                    "waiting_period_days": 3,
                    "effectiveness": 8
                }
            ],
            "organic": [
                {
                    "solution_name": "Neem Oil Spray",
                    "product_name": "Cold-pressed Neem Oil",
                    "description": "Natural fungicide and pest repellent.",
                    "dosage": "5ml neem oil + 2ml liquid soap per litre water",
                    "application_method": "Spray all leaf surfaces including undersides",
                    "frequency": "Every 5 days",
                    "timing": "Early morning or evening (avoid hot midday)",
                    "waiting_period_days": 0,
                    "effectiveness": 6
                },
                {
                    "solution_name": "Baking Soda Spray",
                    "product_name": "Sodium Bicarbonate",
                    "description": "Raises leaf surface pH, inhibits fungal growth.",
                    "dosage": "1 teaspoon per litre water + few drops of liquid soap",
                    "application_method": "Spray foliage weekly",
                    "frequency": "Every 7 days",
                    "effectiveness": 5
                }
            ]
        }
    },
    {
        "disease_name": "Late Blight",
        "pathogen_type": "fungal",
        "symptoms": "Large dark brown to black water-soaked lesions on leaves and stems. White mold on underside in humid conditions. Fruits show dark brown firm lesions.",
        "visual_symptoms": "Dark brown patches on leaves that spread rapidly. White fuzzy growth under leaves when humid. Stems turn dark brown and rot.",
        "affected_parts": ["leaves", "stem", "fruit"],
        "spread_conditions": "Cool temperatures (15–22°C), high humidity (>80%), rain and fog",
        "severity": "critical",
        "solutions": {
            "conventional": [
                {
                    "solution_name": "Metalaxyl + Mancozeb",
                    "product_name": "Ridomil Gold MZ",
                    "dosage": "2.5g per litre",
                    "frequency": "Every 5–7 days during high risk",
                    "waiting_period_days": 7,
                    "effectiveness": 9
                }
            ],
            "organic": [
                {
                    "solution_name": "Copper Hydroxide Spray",
                    "product_name": "Kocide (organic-approved)",
                    "dosage": "2g per litre",
                    "frequency": "Every 5–7 days",
                    "waiting_period_days": 1,
                    "effectiveness": 7
                }
            ]
        }
    },
    {
        "disease_name": "Blossom End Rot",
        "pathogen_type": "physiological",
        "symptoms": "Brown to black leathery patch on the blossom end (bottom) of fruit. Internal tissue turns dark and papery.",
        "visual_symptoms": "Black or brown sunken patch on the bottom of green or ripening tomatoes. Fruit stays attached to plant.",
        "affected_parts": ["fruit"],
        "spread_conditions": "Calcium deficiency, irregular watering (dry/wet cycles), high temperatures",
        "severity": "medium",
        "solutions": {
            "conventional": [
                {
                    "solution_name": "Calcium Nitrate Foliar Spray",
                    "dosage": "5g per litre",
                    "frequency": "Every 10 days from fruit set",
                    "effectiveness": 9
                }
            ],
            "organic": [
                {
                    "solution_name": "Crushed Eggshells",
                    "description": "Add crushed eggshells to soil around plants. Consistent watering is critical.",
                    "effectiveness": 6
                }
            ]
        }
    }
]
```

---

## 7. Pest Seed Data (Example: Key Tomato Pests)

```python
TOMATO_PESTS = [
    {
        "pest_name": "Aphids",
        "local_name": "Plant Lice",
        "pest_type": "insect",
        "pest_category": "sucking",
        "symptoms": "Sticky honeydew on leaves. Curled or distorted new growth. Sooty mold. Clusters of tiny green/black insects under leaves.",
        "visual_symptoms": "Small (1–2mm) green or black bugs clustered on stem tips and undersides of young leaves. Leaves curl inward.",
        "affected_parts": ["leaves", "stem"],
        "infestation_conditions": "Warm dry weather, heavy nitrogen fertilization (lush growth)",
        "severity": "low",
        "solutions": {
            "conventional": [
                {
                    "solution_name": "Imidacloprid spray",
                    "dosage": "0.3ml per litre",
                    "frequency": "Once. Repeat after 14 days if needed.",
                    "waiting_period_days": 7,
                    "effectiveness": 9
                }
            ],
            "organic": [
                {
                    "solution_name": "Neem Oil Spray",
                    "dosage": "5ml per litre + soap",
                    "frequency": "Every 3 days for 2 weeks",
                    "effectiveness": 7
                },
                {
                    "solution_name": "Strong Water Spray",
                    "description": "Knock aphids off with a strong stream of water. Best for small infestations.",
                    "effectiveness": 5
                }
            ]
        }
    },
    {
        "pest_name": "Fruit Borer",
        "local_name": "Polos Patthu",
        "pest_type": "insect",
        "pest_category": "boring",
        "symptoms": "Round holes in fruits. Frass (insect droppings) near entry hole. Caterpillar visible inside fruit. Rotten fruit.",
        "visual_symptoms": "1–2mm circular entry holes in green or ripening tomatoes. Dark frass around hole. Fruit rots from inside.",
        "affected_parts": ["fruit", "stem"],
        "severity": "high",
        "solutions": {
            "conventional": [
                {
                    "solution_name": "Chlorpyrifos spray",
                    "dosage": "2ml per litre",
                    "frequency": "At first sign. Every 7 days.",
                    "waiting_period_days": 14,
                    "effectiveness": 8
                }
            ],
            "organic": [
                {
                    "solution_name": "Bt (Bacillus thuringiensis) spray",
                    "product_name": "DiPel / Thuricide",
                    "description": "Natural bacterial insecticide that kills caterpillars. Safe for humans and beneficial insects.",
                    "dosage": "2g per litre",
                    "frequency": "Every 5–7 days",
                    "waiting_period_days": 0,
                    "effectiveness": 8
                }
            ]
        }
    },
    {
        "pest_name": "Whitefly",
        "pest_type": "insect",
        "pest_category": "sucking",
        "symptoms": "Tiny white insects flying from plant when disturbed. Yellow leaves. Sticky honeydew. Sooty mold. Tomato Yellow Leaf Curl Virus spread.",
        "visual_symptoms": "Tiny white flies (1.5mm) on leaf undersides. Clouds of white flies when plant is touched. Leaves turn yellow and curl upward.",
        "affected_parts": ["leaves"],
        "severity": "high",
        "solutions": {
            "conventional": [
                {
                    "solution_name": "Acetamiprid spray",
                    "dosage": "0.2g per litre",
                    "frequency": "Every 7 days",
                    "waiting_period_days": 7,
                    "effectiveness": 9
                }
            ],
            "organic": [
                {
                    "solution_name": "Yellow sticky traps",
                    "description": "Hang yellow sticky traps at plant height. Whiteflies are attracted to yellow.",
                    "effectiveness": 6
                },
                {
                    "solution_name": "Neem Oil Spray",
                    "dosage": "5ml per litre + soap",
                    "frequency": "Every 4 days",
                    "effectiveness": 6
                }
            ]
        }
    }
]
```

---

## 8. Python Seed Script Structure

```python
# scripts/seed_database.py

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine
from app.models import *
from seed_data import FARMING_METHODS, PRIORITY_PLANTS, ...

async def seed_all():
    async with AsyncSession(engine) as session:
        # 1. Farming methods
        for method_data in FARMING_METHODS:
            method = FarmingMethod(**method_data)
            session.add(method)
        await session.flush()

        # 2. Plants
        for plant_data in PRIORITY_PLANTS:
            plant = Plant(**{k: v for k, v in plant_data.items() if k not in ['stages', 'diseases']})
            session.add(plant)
        await session.flush()

        # 3. Stages
        for plant_name, stages_data in PLANT_STAGES.items():
            plant = await get_plant_by_name(session, plant_name)
            for stage_data in stages_data:
                stage = PlantStage(plant_id=plant.id, **stage_data)
                session.add(stage)
        await session.flush()

        # 4. Nutrient/Water/Fertilizer requirements
        # ... (same pattern for each)

        # 5. Diseases + solutions
        for disease_data in ALL_DISEASES:
            disease = PlantDisease(**{k: v for k, v in disease_data.items() if k != 'solutions'})
            session.add(disease)
            await session.flush()
            for method_code, solutions in disease_data['solutions'].items():
                method = await get_method_by_code(session, method_code)
                for sol_data in solutions:
                    sol = DiseaseSolution(disease_id=disease.id, method_id=method.id, **sol_data)
                    session.add(sol)

        await session.commit()
        print("✅ Database seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_all())
```

---

## 9. Data Validation Rules

| Table | Validation |
|-------|-----------|
| `plant_stages` | `start_day` < `end_day`; stages don't overlap; sequential `stage_order` |
| `plant_nutrient_requirements` | All ppm values > 0; unique per (plant_id, stage_id) |
| `plant_water_requirements` | `water_mm_per_day` > 0; `irrigation_frequency_days` ≥ 1 |
| `plant_diseases` | `symptoms` length > 50 chars (must be keyword-rich for matching) |
| `disease_solutions` | `dosage` and `application_method` must not be null |
| `farming_methods` | Exactly 3 records: organic, conventional, integrated |

---

## 10. Seed Data Verification Checklist

After seeding, verify:
- [ ] `SELECT COUNT(*) FROM plants;` → ≥ 8
- [ ] `SELECT COUNT(*) FROM plant_stages;` → ≥ 48 (8 plants × 6 stages)
- [ ] `SELECT COUNT(*) FROM plant_nutrient_requirements;` → ≥ 48
- [ ] `SELECT COUNT(*) FROM plant_water_requirements;` → ≥ 48
- [ ] `SELECT COUNT(*) FROM plant_fertilizer_recommendations;` → ≥ 60
- [ ] `SELECT COUNT(*) FROM plant_diseases;` → ≥ 50
- [ ] `SELECT COUNT(*) FROM plant_pests;` → ≥ 30
- [ ] `SELECT COUNT(*) FROM disease_solutions;` → ≥ 100 (organic + conventional)
- [ ] `SELECT COUNT(*) FROM farming_methods;` → exactly 3
- [ ] Test: create a project → verify activities are generated
- [ ] Test: submit soil test → verify recommendations appear

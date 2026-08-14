# AgriFarm AI — Comprehensive Data Seed & Agronomic Reference Guide

## Overview
The master data is the core foundation of the AgriFarm AI platform. It powers automated seasonal activity planning, stage-by-stage water and fertilizer prescriptions, pruning and canopy management, disease diagnostics, and market pricing intelligence.

---

## Current Master Seed Database Summary (70 Crops Library)

The platform is seeded with a comprehensive reference dataset covering **70 major agricultural, horticultural, plantation, spice, fruit, cereal, and cash crops**:

| Entity Table | Count in Database | Description & Responsibilities |
| :--- | :---: | :--- |
| **`plants`** | **70** | Master crop catalogue across 9 categories (Vegetables, Fruits, Grains, Spices, Legumes, Plantations, Herbs, Tubers, Cash Crops) with English, Sinhala, and Tamil names. |
| **`plant_varieties`** | **221** | Named cultivars with biological parameters (duration, Yala/Maha seasons, pH, temp, rainfall, expected yield, soil compatibility, companion/incompatible plants). |
| **`plant_stages`** | **420** | 6 continuous developmental growth stages per crop (`s1` to `s420`) with contiguous start and end days. |
| **`plant_water_requirements`** | **420** | Daily water requirement (mm/day), irrigation interval (days), and drought tolerance classification per stage. |
| **`plant_nutrient_requirements`** | **420** | Stage-by-stage N, P, K, Ca, and Mg macronutrient specifications (kg/acre). |
| **`plant_fertilizer_recommendations`** | **1,272** | Stage-specific fertilizer products across **Organic**, **Conventional**, and **Integrated** farming methods. |
| **`plant_pruning_guides`** | **164** | Pruning operations (pinching, topping, desuckering, thinning, leaf removal, training) with tools, pre/post care, and instructions. |
| **`plant_diseases`** | **430** | Crop diseases with detailed symptomology, favorable conditions, and severity ratings. |
| **`disease_solutions`** | **1,140** | Curative and preventive treatments with precise dosages and instructions across farming methods. |
| **`farming_activities`** | **653+** | Auto-generated activities across all active projects. |
| **`activity_details`** | **653+** | Linked execution details with step-by-step paragraphs, tools, levels, water liters, fertilizer kg, and safety intervals. |

---

## Seeding & Migration Execution

To run or re-sync the seed dataset to the active database:

```bash
# Set DATABASE_URL and run the master seeder
DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>:5432/<db>" python backend/seed/run_seed.py
```

### Data Validation
Run the validator script to ensure 100% stage continuity and verify that organic recommendations contain no synthetic products:

```bash
DATABASE_URL="postgresql+asyncpg://<user>:<password>@<host>:5432/<db>" python backend/seed/validator.py
```

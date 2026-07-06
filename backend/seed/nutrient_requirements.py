# backend/seed/nutrient_requirements.py
# Nutrient requirements per stage (NPK in kg/acre)

nutrient_requirements = [
    # Tomato (p1)
    {"stage_id": "s1", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s2", "nitrogen_kg": 5, "phosphorus_kg": 3, "potassium_kg": 2},
    {"stage_id": "s3", "nitrogen_kg": 25, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s4", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s5", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 30},
    {"stage_id": "s6", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 10},

    # Chili (p2)
    {"stage_id": "s7", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s8", "nitrogen_kg": 5, "phosphorus_kg": 3, "potassium_kg": 2},
    {"stage_id": "s9", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 12},
    {"stage_id": "s10", "nitrogen_kg": 12, "phosphorus_kg": 18, "potassium_kg": 22},
    {"stage_id": "s11", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 25},
    {"stage_id": "s12", "nitrogen_kg": 4, "phosphorus_kg": 4, "potassium_kg": 8},

    # Rice (p3)
    {"stage_id": "s13", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s14", "nitrogen_kg": 15, "phosphorus_kg": 8, "potassium_kg": 8},
    {"stage_id": "s15", "nitrogen_kg": 30, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s16", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s17", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 25},
    {"stage_id": "s18", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Brinjal (p4)
    {"stage_id": "s19", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s20", "nitrogen_kg": 6, "phosphorus_kg": 4, "potassium_kg": 3},
    {"stage_id": "s21", "nitrogen_kg": 22, "phosphorus_kg": 10, "potassium_kg": 14},
    {"stage_id": "s22", "nitrogen_kg": 14, "phosphorus_kg": 16, "potassium_kg": 22},
    {"stage_id": "s23", "nitrogen_kg": 10, "phosphorus_kg": 14, "potassium_kg": 28},
    {"stage_id": "s24", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 10},

    # Beans (p5)
    {"stage_id": "s25", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s26", "nitrogen_kg": 3, "phosphorus_kg": 5, "potassium_kg": 3},
    {"stage_id": "s27", "nitrogen_kg": 8, "phosphorus_kg": 10, "potassium_kg": 12},
    {"stage_id": "s28", "nitrogen_kg": 5, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s29", "nitrogen_kg": 3, "phosphorus_kg": 8, "potassium_kg": 10},
    {"stage_id": "s30", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},
]

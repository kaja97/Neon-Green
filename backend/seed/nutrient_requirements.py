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

    # Onion (p6)
    {"stage_id": "s31", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s32", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s33", "nitrogen_kg": 30, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s34", "nitrogen_kg": 20, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s35", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 30},
    {"stage_id": "s36", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Potato (p7)
    {"stage_id": "s37", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s38", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s39", "nitrogen_kg": 30, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s40", "nitrogen_kg": 20, "phosphorus_kg": 25, "potassium_kg": 30},
    {"stage_id": "s41", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 40},
    {"stage_id": "s42", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Cassava (p8)
    {"stage_id": "s43", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s44", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 20},
    {"stage_id": "s45", "nitrogen_kg": 30, "phosphorus_kg": 10, "potassium_kg": 35},
    {"stage_id": "s46", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 45},
    {"stage_id": "s47", "nitrogen_kg": 10, "phosphorus_kg": 5, "potassium_kg": 50},
    {"stage_id": "s48", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Finger Millet (p9)
    {"stage_id": "s49", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s50", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s51", "nitrogen_kg": 20, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s52", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s53", "nitrogen_kg": 10, "phosphorus_kg": 5, "potassium_kg": 20},
    {"stage_id": "s54", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Coconut (p10)
    {"stage_id": "s55", "nitrogen_kg": 10, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s56", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s57", "nitrogen_kg": 20, "phosphorus_kg": 20, "potassium_kg": 35},
    {"stage_id": "s58", "nitrogen_kg": 25, "phosphorus_kg": 20, "potassium_kg": 45},
    {"stage_id": "s59", "nitrogen_kg": 30, "phosphorus_kg": 25, "potassium_kg": 55},
    {"stage_id": "s60", "nitrogen_kg": 35, "phosphorus_kg": 30, "potassium_kg": 70},

    # Green Gram (p11)
    {"stage_id": "s61", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s62", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 3},
    {"stage_id": "s63", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 10},
    {"stage_id": "s64", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s65", "nitrogen_kg": 5, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s66", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Okra (p12)
    {"stage_id": "s67", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 2},
    {"stage_id": "s68", "nitrogen_kg": 8, "phosphorus_kg": 6, "potassium_kg": 5},
    {"stage_id": "s69", "nitrogen_kg": 25, "phosphorus_kg": 15, "potassium_kg": 15},
    {"stage_id": "s70", "nitrogen_kg": 15, "phosphorus_kg": 20, "potassium_kg": 20},
    {"stage_id": "s71", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s72", "nitrogen_kg": 2, "phosphorus_kg": 2, "potassium_kg": 5},

    # Cowpea (p13)
    {"stage_id": "s73", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 0},
    {"stage_id": "s74", "nitrogen_kg": 4, "phosphorus_kg": 5, "potassium_kg": 3},
    {"stage_id": "s75", "nitrogen_kg": 8, "phosphorus_kg": 15, "potassium_kg": 10},
    {"stage_id": "s76", "nitrogen_kg": 6, "phosphorus_kg": 12, "potassium_kg": 12},
    {"stage_id": "s77", "nitrogen_kg": 4, "phosphorus_kg": 10, "potassium_kg": 15},
    {"stage_id": "s78", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 5},

    # Bitter Gourd (p14)
    {"stage_id": "s79", "nitrogen_kg": 3, "phosphorus_kg": 3, "potassium_kg": 3},
    {"stage_id": "s80", "nitrogen_kg": 20, "phosphorus_kg": 12, "potassium_kg": 15},
    {"stage_id": "s81", "nitrogen_kg": 15, "phosphorus_kg": 18, "potassium_kg": 20},
    {"stage_id": "s82", "nitrogen_kg": 10, "phosphorus_kg": 15, "potassium_kg": 25},
    {"stage_id": "s83", "nitrogen_kg": 8, "phosphorus_kg": 12, "potassium_kg": 30},
    {"stage_id": "s84", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},

    # Sweet Potato (p15)
    {"stage_id": "s85", "nitrogen_kg": 5, "phosphorus_kg": 5, "potassium_kg": 5},
    {"stage_id": "s86", "nitrogen_kg": 15, "phosphorus_kg": 10, "potassium_kg": 10},
    {"stage_id": "s87", "nitrogen_kg": 20, "phosphorus_kg": 20, "potassium_kg": 25},
    {"stage_id": "s88", "nitrogen_kg": 15, "phosphorus_kg": 15, "potassium_kg": 35},
    {"stage_id": "s89", "nitrogen_kg": 8, "phosphorus_kg": 8, "potassium_kg": 45},
    {"stage_id": "s90", "nitrogen_kg": 0, "phosphorus_kg": 0, "potassium_kg": 10},
]

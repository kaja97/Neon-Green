# backend/seed/stages.py

stages = [
    # Tomato Stages (6 stages)
    {"id": "s1", "plant_id": "p1", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s2", "plant_id": "p1", "stage_name": "Seedling", "stage_order": 2, "start_day": 11, "end_day": 25},
    {"id": "s3", "plant_id": "p1", "stage_name": "Vegetative", "stage_order": 3, "start_day": 26, "end_day": 50},
    {"id": "s4", "plant_id": "p1", "stage_name": "Flowering", "stage_order": 4, "start_day": 51, "end_day": 65},
    {"id": "s5", "plant_id": "p1", "stage_name": "Fruiting", "stage_order": 5, "start_day": 66, "end_day": 85},
    {"id": "s6", "plant_id": "p1", "stage_name": "Harvesting", "stage_order": 6, "start_day": 86, "end_day": 90},

    # Chili Stages (6 stages)
    {"id": "s7", "plant_id": "p2", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 14},
    {"id": "s8", "plant_id": "p2", "stage_name": "Seedling", "stage_order": 2, "start_day": 15, "end_day": 35},
    {"id": "s9", "plant_id": "p2", "stage_name": "Vegetative", "stage_order": 3, "start_day": 36, "end_day": 65},
    {"id": "s10", "plant_id": "p2", "stage_name": "Flowering", "stage_order": 4, "start_day": 66, "end_day": 85},
    {"id": "s11", "plant_id": "p2", "stage_name": "Fruiting", "stage_order": 5, "start_day": 86, "end_day": 110},
    {"id": "s12", "plant_id": "p2", "stage_name": "Harvesting", "stage_order": 6, "start_day": 111, "end_day": 120},

    # Rice Stages (6 stages)
    {"id": "s13", "plant_id": "p3", "stage_name": "Nursery", "stage_order": 1, "start_day": 0, "end_day": 21},
    {"id": "s14", "plant_id": "p3", "stage_name": "Transplanting", "stage_order": 2, "start_day": 22, "end_day": 35},
    {"id": "s15", "plant_id": "p3", "stage_name": "Tillering", "stage_order": 3, "start_day": 36, "end_day": 70},
    {"id": "s16", "plant_id": "p3", "stage_name": "Booting", "stage_order": 4, "start_day": 71, "end_day": 100},
    {"id": "s17", "plant_id": "p3", "stage_name": "Grain Filling", "stage_order": 5, "start_day": 101, "end_day": 135},
    {"id": "s18", "plant_id": "p3", "stage_name": "Harvesting", "stage_order": 6, "start_day": 136, "end_day": 150},

    # Brinjal Stages (6 stages)
    {"id": "s19", "plant_id": "p4", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 12},
    {"id": "s20", "plant_id": "p4", "stage_name": "Seedling", "stage_order": 2, "start_day": 13, "end_day": 30},
    {"id": "s21", "plant_id": "p4", "stage_name": "Vegetative", "stage_order": 3, "start_day": 31, "end_day": 55},
    {"id": "s22", "plant_id": "p4", "stage_name": "Flowering", "stage_order": 4, "start_day": 56, "end_day": 75},
    {"id": "s23", "plant_id": "p4", "stage_name": "Fruiting", "stage_order": 5, "start_day": 76, "end_day": 100},
    {"id": "s24", "plant_id": "p4", "stage_name": "Harvesting", "stage_order": 6, "start_day": 101, "end_day": 110},

    # Beans Stages (6 stages)
    {"id": "s25", "plant_id": "p5", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s26", "plant_id": "p5", "stage_name": "Seedling", "stage_order": 2, "start_day": 8, "end_day": 20},
    {"id": "s27", "plant_id": "p5", "stage_name": "Vegetative", "stage_order": 3, "start_day": 21, "end_day": 40},
    {"id": "s28", "plant_id": "p5", "stage_name": "Flowering", "stage_order": 4, "start_day": 41, "end_day": 50},
    {"id": "s29", "plant_id": "p5", "stage_name": "Pod Formation", "stage_order": 5, "start_day": 51, "end_day": 63},
    {"id": "s30", "plant_id": "p5", "stage_name": "Harvesting", "stage_order": 6, "start_day": 64, "end_day": 70},

    # Onion Stages (6 stages)
    {"id": "s31", "plant_id": "p6", "stage_name": "Nursery", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s32", "plant_id": "p6", "stage_name": "Establishment", "stage_order": 2, "start_day": 31, "end_day": 45},
    {"id": "s33", "plant_id": "p6", "stage_name": "Vegetative", "stage_order": 3, "start_day": 46, "end_day": 75},
    {"id": "s34", "plant_id": "p6", "stage_name": "Bulb Initiation", "stage_order": 4, "start_day": 76, "end_day": 90},
    {"id": "s35", "plant_id": "p6", "stage_name": "Bulb Development", "stage_order": 5, "start_day": 91, "end_day": 110},
    {"id": "s36", "plant_id": "p6", "stage_name": "Harvesting", "stage_order": 6, "start_day": 111, "end_day": 120},

    # Potato Stages (6 stages)
    {"id": "s37", "plant_id": "p7", "stage_name": "Sprouting", "stage_order": 1, "start_day": 0, "end_day": 15},
    {"id": "s38", "plant_id": "p7", "stage_name": "Vegetative", "stage_order": 2, "start_day": 16, "end_day": 35},
    {"id": "s39", "plant_id": "p7", "stage_name": "Stolon Initiation", "stage_order": 3, "start_day": 36, "end_day": 50},
    {"id": "s40", "plant_id": "p7", "stage_name": "Tuber Initiation", "stage_order": 4, "start_day": 51, "end_day": 65},
    {"id": "s41", "plant_id": "p7", "stage_name": "Tuber Bulking", "stage_order": 5, "start_day": 66, "end_day": 85},
    {"id": "s42", "plant_id": "p7", "stage_name": "Harvesting", "stage_order": 6, "start_day": 86, "end_day": 100},

    # Cassava Stages (6 stages)
    {"id": "s43", "plant_id": "p8", "stage_name": "Establishment", "stage_order": 1, "start_day": 0, "end_day": 30},
    {"id": "s44", "plant_id": "p8", "stage_name": "Early Canopy Development", "stage_order": 2, "start_day": 31, "end_day": 75},
    {"id": "s45", "plant_id": "p8", "stage_name": "Root Initiation", "stage_order": 3, "start_day": 76, "end_day": 120},
    {"id": "s46", "plant_id": "p8", "stage_name": "Tuber Bulking Phase 1", "stage_order": 4, "start_day": 121, "end_day": 180},
    {"id": "s47", "plant_id": "p8", "stage_name": "Tuber Bulking Phase 2", "stage_order": 5, "start_day": 181, "end_day": 220},
    {"id": "s48", "plant_id": "p8", "stage_name": "Harvesting", "stage_order": 6, "start_day": 221, "end_day": 240},

    # Finger Millet Stages (6 stages)
    {"id": "s49", "plant_id": "p9", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s50", "plant_id": "p9", "stage_name": "Establishment", "stage_order": 2, "start_day": 11, "end_day": 25},
    {"id": "s51", "plant_id": "p9", "stage_name": "Vegetative/Tillering", "stage_order": 3, "start_day": 26, "end_day": 50},
    {"id": "s52", "plant_id": "p9", "stage_name": "Flowering/Booting", "stage_order": 4, "start_day": 51, "end_day": 70},
    {"id": "s53", "plant_id": "p9", "stage_name": "Grain Bulking", "stage_order": 5, "start_day": 71, "end_day": 90},
    {"id": "s54", "plant_id": "p9", "stage_name": "Harvesting", "stage_order": 6, "start_day": 91, "end_day": 105},

    # Coconut Stages (6 stages)
    {"id": "s55", "plant_id": "p10", "stage_name": "Seedling Establishment", "stage_order": 1, "start_day": 0, "end_day": 60},
    {"id": "s56", "plant_id": "p10", "stage_name": "Canopy & Root Expansion", "stage_order": 2, "start_day": 61, "end_day": 120},
    {"id": "s57", "plant_id": "p10", "stage_name": "Early Vegetative", "stage_order": 3, "start_day": 121, "end_day": 180},
    {"id": "s58", "plant_id": "p10", "stage_name": "Mid Vegetative", "stage_order": 4, "start_day": 181, "end_day": 240},
    {"id": "s59", "plant_id": "p10", "stage_name": "Late Vegetative", "stage_order": 5, "start_day": 241, "end_day": 300},
    {"id": "s60", "plant_id": "p10", "stage_name": "Pre-bearing Phase", "stage_order": 6, "start_day": 301, "end_day": 365},

    # Green Gram Stages (6 stages)
    {"id": "s61", "plant_id": "p11", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 5},
    {"id": "s62", "plant_id": "p11", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 6, "end_day": 15},
    {"id": "s63", "plant_id": "p11", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 16, "end_day": 35},
    {"id": "s64", "plant_id": "p11", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 36, "end_day": 48},
    {"id": "s65", "plant_id": "p11", "stage_name": "Pod Development", "stage_order": 5, "start_day": 49, "end_day": 62},
    {"id": "s66", "plant_id": "p11", "stage_name": "Harvesting", "stage_order": 6, "start_day": 63, "end_day": 70},

    # Okra Stages (6 stages)
    {"id": "s67", "plant_id": "p12", "stage_name": "Germination & Emergence", "stage_order": 1, "start_day": 0, "end_day": 7},
    {"id": "s68", "plant_id": "p12", "stage_name": "Seedling/Establishment", "stage_order": 2, "start_day": 8, "end_day": 20},
    {"id": "s69", "plant_id": "p12", "stage_name": "Active Vegetative", "stage_order": 3, "start_day": 21, "end_day": 45},
    {"id": "s70", "plant_id": "p12", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s71", "plant_id": "p12", "stage_name": "Pod Formation", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s72", "plant_id": "p12", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Cowpea Stages (6 stages)
    {"id": "s73", "plant_id": "p13", "stage_name": "Germination", "stage_order": 1, "start_day": 0, "end_day": 6},
    {"id": "s74", "plant_id": "p13", "stage_name": "Establishment/Seedling", "stage_order": 2, "start_day": 7, "end_day": 20},
    {"id": "s75", "plant_id": "p13", "stage_name": "Vegetative Growth", "stage_order": 3, "start_day": 21, "end_day": 45},
    {"id": "s76", "plant_id": "p13", "stage_name": "Flowering Stage", "stage_order": 4, "start_day": 46, "end_day": 60},
    {"id": "s77", "plant_id": "p13", "stage_name": "Pod Development", "stage_order": 5, "start_day": 61, "end_day": 80},
    {"id": "s78", "plant_id": "p13", "stage_name": "Harvesting", "stage_order": 6, "start_day": 81, "end_day": 90},

    # Bitter Gourd Stages (6 stages)
    {"id": "s79", "plant_id": "p14", "stage_name": "Establishment", "stage_order": 1, "start_day": 0, "end_day": 15},
    {"id": "s80", "plant_id": "p14", "stage_name": "Vegetative Vine growth", "stage_order": 2, "start_day": 16, "end_day": 45},
    {"id": "s81", "plant_id": "p14", "stage_name": "Flowering & Trellising", "stage_order": 3, "start_day": 46, "end_day": 65},
    {"id": "s82", "plant_id": "p14", "stage_name": "Fruit Setting", "stage_order": 4, "start_day": 66, "end_day": 85},
    {"id": "s83", "plant_id": "p14", "stage_name": "Fruit Development", "stage_order": 5, "start_day": 86, "end_day": 105},
    {"id": "s84", "plant_id": "p14", "stage_name": "Harvesting", "stage_order": 6, "start_day": 106, "end_day": 120},

    # Sweet Potato Stages (6 stages)
    {"id": "s85", "plant_id": "p15", "stage_name": "Planting & Sprouting", "stage_order": 1, "start_day": 0, "end_day": 10},
    {"id": "s86", "plant_id": "p15", "stage_name": "Establishment", "stage_order": 2, "start_day": 11, "end_day": 30},
    {"id": "s87", "plant_id": "p15", "stage_name": "Tuber Initiation", "stage_order": 3, "start_day": 31, "end_day": 50},
    {"id": "s88", "plant_id": "p15", "stage_name": "Tuber Development", "stage_order": 4, "start_day": 51, "end_day": 80},
    {"id": "s89", "plant_id": "p15", "stage_name": "Tuber Bulking", "stage_order": 5, "start_day": 81, "end_day": 110},
    {"id": "s90", "plant_id": "p15", "stage_name": "Harvesting", "stage_order": 6, "start_day": 111, "end_day": 120},
]

# backend/seed/fertilizers.py
# 60 fertilizer recommendation records: ~2 per stage per method (organic/conventional)
# Format: stage_id, farming_method, fertilizer_name, application_rate_per_acre_kg, instructions

fertilizers = [
    # ── Tomato ──────────────────────────────
    {"stage_id": "s2", "farming_method": "conventional", "fertilizer_name": "Starter NPK 10-26-26", "rate": 50, "instructions": "Apply at transplanting as basal dose. Mix well into soil."},
    {"stage_id": "s2", "farming_method": "organic", "fertilizer_name": "Vermicompost", "rate": 200, "instructions": "Mix into planting holes before transplanting seedlings."},
    {"stage_id": "s3", "farming_method": "conventional", "fertilizer_name": "Urea (46-0-0)", "rate": 30, "instructions": "Side-dress 10 cm from stem. Water immediately after."},
    {"stage_id": "s3", "farming_method": "organic", "fertilizer_name": "Blood Meal", "rate": 25, "instructions": "Side-dress around plants. High nitrogen for vegetative growth."},
    {"stage_id": "s3", "farming_method": "conventional", "fertilizer_name": "DAP 18-46-0", "rate": 25, "instructions": "Apply 2nd split dose as top-dressing during active growth."},
    {"stage_id": "s3", "farming_method": "organic", "fertilizer_name": "Fish Emulsion", "rate": 15, "instructions": "Dilute 1:10 with water and drench around root zone weekly."},
    {"stage_id": "s4", "farming_method": "conventional", "fertilizer_name": "MOP (Muriate of Potash)", "rate": 45, "instructions": "Apply at flowering to promote fruit set. Band apply."},
    {"stage_id": "s4", "farming_method": "organic", "fertilizer_name": "Kelp Meal", "rate": 20, "instructions": "Broadcast around plants. Rich in potassium for flowering."},
    {"stage_id": "s4", "farming_method": "conventional", "fertilizer_name": "Calcium Ammonium Nitrate", "rate": 25, "instructions": "Top-dress to prevent blossom end rot during flowering."},
    {"stage_id": "s4", "farming_method": "organic", "fertilizer_name": "Bone Meal", "rate": 30, "instructions": "Work into soil surface. Provides calcium and phosphorus."},
    {"stage_id": "s5", "farming_method": "conventional", "fertilizer_name": "Potassium Sulphate", "rate": 30, "instructions": "Foliar spray or fertigation during fruit development."},
    {"stage_id": "s5", "farming_method": "organic", "fertilizer_name": "Wood Ash", "rate": 40, "instructions": "Broadcast lightly. Do not over-apply; raises pH."},

    # ── Chili ───────────────────────────────
    {"stage_id": "s8", "farming_method": "conventional", "fertilizer_name": "NPK 15-15-15", "rate": 50, "instructions": "Apply as basal dose during transplanting."},
    {"stage_id": "s8", "farming_method": "organic", "fertilizer_name": "Farmyard Manure", "rate": 300, "instructions": "Incorporate well-decomposed FYM into beds before planting."},
    {"stage_id": "s9", "farming_method": "conventional", "fertilizer_name": "Urea (46-0-0)", "rate": 25, "instructions": "Split application at 30 and 50 DAT for vegetative growth."},
    {"stage_id": "s9", "farming_method": "organic", "fertilizer_name": "Neem Cake", "rate": 40, "instructions": "Apply around root zone. Acts as fertilizer and pest deterrent."},
    {"stage_id": "s10", "farming_method": "conventional", "fertilizer_name": "Calcium Nitrate", "rate": 20, "instructions": "Apply during flowering to improve fruit quality."},
    {"stage_id": "s10", "farming_method": "organic", "fertilizer_name": "Seaweed Extract", "rate": 10, "instructions": "Foliar spray at 5ml/L during flower initiation."},
    {"stage_id": "s11", "farming_method": "conventional", "fertilizer_name": "MOP (Muriate of Potash)", "rate": 35, "instructions": "Apply during fruit development for better colour and size."},
    {"stage_id": "s11", "farming_method": "organic", "fertilizer_name": "Compost Tea", "rate": 50, "instructions": "Drench soil weekly with aerated compost tea."},
    {"stage_id": "s9", "farming_method": "conventional", "fertilizer_name": "DAP 18-46-0", "rate": 20, "instructions": "2nd split as top-dress at 45 DAT."},
    {"stage_id": "s10", "farming_method": "organic", "fertilizer_name": "Bone Meal", "rate": 25, "instructions": "Apply for phosphorus supply during flowering."},

    # ── Rice ────────────────────────────────
    {"stage_id": "s14", "farming_method": "conventional", "fertilizer_name": "TSP (Triple Super Phosphate)", "rate": 50, "instructions": "Apply entire P dose as basal at transplanting."},
    {"stage_id": "s14", "farming_method": "organic", "fertilizer_name": "Rock Phosphate", "rate": 60, "instructions": "Apply at transplanting. Slow-release phosphorus source."},
    {"stage_id": "s15", "farming_method": "conventional", "fertilizer_name": "Urea (46-0-0)", "rate": 50, "instructions": "1st split at active tillering. Drain water before applying."},
    {"stage_id": "s15", "farming_method": "organic", "fertilizer_name": "Azolla Incorporation", "rate": 100, "instructions": "Incorporate dried azolla into paddy field as green manure."},
    {"stage_id": "s15", "farming_method": "conventional", "fertilizer_name": "MOP (Muriate of Potash)", "rate": 30, "instructions": "Apply 50% of K as basal at tillering."},
    {"stage_id": "s15", "farming_method": "organic", "fertilizer_name": "Farmyard Manure", "rate": 500, "instructions": "Apply well-decomposed FYM at 5 tonnes/acre."},
    {"stage_id": "s16", "farming_method": "conventional", "fertilizer_name": "Urea (46-0-0)", "rate": 40, "instructions": "2nd split at panicle initiation. Critical N application."},
    {"stage_id": "s16", "farming_method": "organic", "fertilizer_name": "Vermicompost", "rate": 150, "instructions": "Top-dress at booting stage for grain quality."},
    {"stage_id": "s17", "farming_method": "conventional", "fertilizer_name": "Potassium Sulphate", "rate": 25, "instructions": "Final K dose during grain filling."},
    {"stage_id": "s17", "farming_method": "organic", "fertilizer_name": "Wood Ash", "rate": 50, "instructions": "Broadcast in field for potassium during grain filling."},

    # ── Brinjal ─────────────────────────────
    {"stage_id": "s20", "farming_method": "conventional", "fertilizer_name": "NPK 10-26-26", "rate": 50, "instructions": "Basal dose at transplanting."},
    {"stage_id": "s20", "farming_method": "organic", "fertilizer_name": "Vermicompost", "rate": 250, "instructions": "Mix into planting pits before transplanting."},
    {"stage_id": "s21", "farming_method": "conventional", "fertilizer_name": "Urea (46-0-0)", "rate": 35, "instructions": "1st top-dressing at 30 DAT. Band apply."},
    {"stage_id": "s21", "farming_method": "organic", "fertilizer_name": "Blood Meal", "rate": 20, "instructions": "Side-dress for nitrogen boost during vegetative phase."},
    {"stage_id": "s22", "farming_method": "conventional", "fertilizer_name": "Calcium Ammonium Nitrate", "rate": 25, "instructions": "Top-dress during flowering for fruit set."},
    {"stage_id": "s22", "farming_method": "organic", "fertilizer_name": "Bone Meal", "rate": 30, "instructions": "Apply for phosphorus and calcium during flowering."},
    {"stage_id": "s23", "farming_method": "conventional", "fertilizer_name": "MOP (Muriate of Potash)", "rate": 40, "instructions": "Apply during fruiting for better fruit quality."},
    {"stage_id": "s23", "farming_method": "organic", "fertilizer_name": "Compost Tea", "rate": 40, "instructions": "Weekly drench during fruiting phase."},
    {"stage_id": "s21", "farming_method": "conventional", "fertilizer_name": "DAP 18-46-0", "rate": 20, "instructions": "2nd phosphorus dose during active vegetative growth."},
    {"stage_id": "s22", "farming_method": "organic", "fertilizer_name": "Neem Cake", "rate": 35, "instructions": "Apply around base. Dual role: fertilizer + pest control."},

    # ── Beans ───────────────────────────────
    {"stage_id": "s26", "farming_method": "conventional", "fertilizer_name": "NPK 15-15-15", "rate": 30, "instructions": "Light basal dose. Beans fix their own nitrogen."},
    {"stage_id": "s26", "farming_method": "organic", "fertilizer_name": "Compost", "rate": 150, "instructions": "Apply well-decomposed compost at planting."},
    {"stage_id": "s27", "farming_method": "conventional", "fertilizer_name": "TSP (Triple Super Phosphate)", "rate": 25, "instructions": "Phosphorus boost for root development."},
    {"stage_id": "s27", "farming_method": "organic", "fertilizer_name": "Rock Phosphate", "rate": 30, "instructions": "Apply for slow-release phosphorus."},
    {"stage_id": "s28", "farming_method": "conventional", "fertilizer_name": "MOP (Muriate of Potash)", "rate": 20, "instructions": "Apply at flowering for pod formation."},
    {"stage_id": "s28", "farming_method": "organic", "fertilizer_name": "Kelp Meal", "rate": 15, "instructions": "Broadcast for potassium during flowering."},
    {"stage_id": "s29", "farming_method": "conventional", "fertilizer_name": "Potassium Sulphate", "rate": 15, "instructions": "Foliar spray during pod filling."},
    {"stage_id": "s29", "farming_method": "organic", "fertilizer_name": "Wood Ash", "rate": 25, "instructions": "Light broadcast for potassium during pod filling."},
    {"stage_id": "s27", "farming_method": "conventional", "fertilizer_name": "Borax", "rate": 2, "instructions": "Foliar spray (0.2%) for boron deficiency prevention."},
    {"stage_id": "s28", "farming_method": "organic", "fertilizer_name": "Seaweed Extract", "rate": 8, "instructions": "Foliar spray at 3ml/L during flowering."},
]

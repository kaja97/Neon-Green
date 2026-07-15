# backend/seed/disease_solutions.py
# 80 disease solution records (2 per disease: 1 organic + 1 conventional)

disease_solutions = [
    # ── Tomato ──────────────────────────────
    # Early Blight (d1)
    {"disease_id": "d1", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre of water", "instructions": "Spray at 10-day intervals starting at first symptom. Ensure complete leaf coverage. Repeat 3-4 times."},
    {"disease_id": "d1", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma viride", "dosage": "4g per litre of water", "instructions": "Preventive foliar spray every 15 days. Apply in the evening. Can also treat seed before planting."},
    # Late Blight (d2)
    {"disease_id": "d2", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Metalaxyl + Mancozeb (Ridomil Gold)", "dosage": "2g per litre", "instructions": "Spray immediately at first sign. Repeat every 7 days during wet weather. Remove infected parts."},
    {"disease_id": "d2", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Copper Hydroxide (Bordeaux Mixture)", "dosage": "1% solution (1kg CuSO4 + 1kg lime in 100L)", "instructions": "Preventive spray before rainy season. Curative spray at first symptoms. Approved for organic farming."},
    # Bacterial Wilt (d3)
    {"disease_id": "d3", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Streptomycin Sulphate", "dosage": "500ppm soil drench", "instructions": "Soil drench around healthy plants. Remove and destroy infected plants. Avoid waterlogging."},
    {"disease_id": "d3", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens", "dosage": "10g per litre soil drench", "instructions": "Apply bio-control agent as soil drench. Crop rotation mandatory. Add lime to raise pH above 6.5."},
    # Fusarium Wilt (d4)
    {"disease_id": "d4", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim 50% WP", "dosage": "2g per litre soil drench", "instructions": "Soil drench at transplanting. Use resistant varieties. Ensure proper drainage."},
    {"disease_id": "d4", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per litre or 2kg per acre in soil", "instructions": "Apply to soil before planting. Mix with FYM for better establishment. Rotate with non-Solanaceae crops."},
    # Leaf Curl Virus (d5)
    {"disease_id": "d5", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid 17.8 SL", "dosage": "0.3ml per litre", "instructions": "Spray against whitefly vector. Uproot and destroy infected plants. Use yellow sticky traps."},
    {"disease_id": "d5", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil (Azadirachtin)", "dosage": "5ml per litre", "instructions": "Spray neem oil to repel whiteflies. Install yellow sticky traps. Use barrier crops."},
    # Blossom End Rot (d6)
    {"disease_id": "d6", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Calcium Chloride foliar spray", "dosage": "4g per litre", "instructions": "Foliar spray during fruiting. Maintain consistent irrigation. Reduce excess nitrogen."},
    {"disease_id": "d6", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Crushed Eggshell + Mulching", "dosage": "200g eggshell per plant, 5cm mulch layer", "instructions": "Add crushed eggshells to soil for calcium. Mulch to maintain moisture. Water consistently."},
    # Powdery Mildew (d7)
    {"disease_id": "d7", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Sulphur 80% WP", "dosage": "3g per litre", "instructions": "Spray at first appearance. Avoid in temperatures above 35C. Repeat every 10 days."},
    {"disease_id": "d7", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Potassium Bicarbonate", "dosage": "5g per litre + few drops soap", "instructions": "Spray on affected leaves. Effective and food-safe. Improve air circulation."},
    # Septoria Leaf Spot (d8)
    {"disease_id": "d8", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Chlorothalonil 75% WP", "dosage": "2g per litre", "instructions": "Spray at 10-day intervals. Remove lower infected leaves. Avoid overhead watering."},
    {"disease_id": "d8", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Preventive spray before rains. Remove infected leaves promptly. Maintain good mulch."},

    # ── Chili ───────────────────────────────
    # Anthracnose (d9)
    {"disease_id": "d9", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre", "instructions": "Spray at fruit formation and repeat at 15-day intervals. Harvest ripe fruits promptly."},
    {"disease_id": "d9", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma viride + Neem Oil", "dosage": "4g Trichoderma + 3ml neem per litre", "instructions": "Preventive spray from flowering. Remove infected fruits. Use disease-free seeds."},
    # Chili Leaf Curl (d10)
    {"disease_id": "d10", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Thiamethoxam 25% WG", "dosage": "0.5g per litre", "instructions": "Control whitefly vector. Spray at 15-day intervals. Uproot severely infected plants."},
    {"disease_id": "d10", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Seed Kernel Extract", "dosage": "50g crushed kernels per litre", "instructions": "Soak kernels overnight, strain, spray. Install yellow sticky traps. Grow marigold as trap crop."},
    # Damping Off (d11)
    {"disease_id": "d11", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Captan 50% WP", "dosage": "3g per litre soil drench", "instructions": "Treat nursery soil before sowing. Avoid overwatering. Ensure good drainage in nursery beds."},
    {"disease_id": "d11", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per kg seed + soil application", "instructions": "Seed treatment and soil application. Use raised nursery beds. Avoid dense sowing."},
    # Cercospora Leaf Spot (d12)
    {"disease_id": "d12", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Repeat every 10-14 days. Remove severely infected leaves."},
    {"disease_id": "d12", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Apply at early symptoms. Improve spacing for air circulation. Remove fallen debris."},
    # Bacterial Leaf Spot (d13)
    {"disease_id": "d13", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Copper Hydroxide + Streptomycin", "dosage": "2g Cu(OH)2 + 500ppm streptomycin per litre", "instructions": "Spray at 7-day intervals during wet weather. Avoid overhead irrigation."},
    {"disease_id": "d13", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux Mixture", "dosage": "1% solution", "instructions": "Preventive spray before monsoon. Use drip irrigation. Rotate with non-Solanaceae crops."},
    # Powdery Mildew (d14)
    {"disease_id": "d14", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Dinocap 48% EC", "dosage": "1ml per litre", "instructions": "Spray at first symptoms. Repeat at 10-day intervals. Improve ventilation."},
    {"disease_id": "d14", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Milk Spray", "dosage": "1 part milk : 9 parts water", "instructions": "Spray weekly. The proteins in milk fight powdery mildew naturally. Best in morning."},
    # Fusarium Wilt (d15)
    {"disease_id": "d15", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim soil drench", "dosage": "2g per litre", "instructions": "Drench soil at planting. Use resistant varieties. 3-year crop rotation."},
    {"disease_id": "d15", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma + Bio-compost", "dosage": "2kg Trichoderma per acre in compost", "instructions": "Enrich compost with Trichoderma before application. Lime acidic soils. Deep ploughing."},
    # Fruit Rot (d16)
    {"disease_id": "d16", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Metalaxyl + Mancozeb", "dosage": "2g per litre", "instructions": "Spray during fruiting in wet weather. Ensure good drainage. Stake plants upright."},
    {"disease_id": "d16", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Preventive spray before rains. Improve drainage. Mulch to prevent soil splash."},

    # ── Rice ────────────────────────────────
    # Blast (d17)
    {"disease_id": "d17", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Tricyclazole 75% WP", "dosage": "0.6g per litre", "instructions": "Spray at first symptom or preventively at tillering and booting. Reduce excess nitrogen."},
    {"disease_id": "d17", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens", "dosage": "10g per litre foliar spray", "instructions": "Preventive spray at tillering. Balanced organic nutrition. Use resistant varieties."},
    # Bacterial Leaf Blight (d18)
    {"disease_id": "d18", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Streptomycin + Copper Oxychloride", "dosage": "500ppm + 3g per litre", "instructions": "Spray at first symptoms. Drain excess water. Reduce nitrogen fertilizer."},
    {"disease_id": "d18", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Pseudomonas", "dosage": "5ml neem + 10g Pseudomonas per litre", "instructions": "Foliar spray every 15 days from tillering. Good water management essential."},
    # Sheath Blight (d19)
    {"disease_id": "d19", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Hexaconazole 5% EC", "dosage": "2ml per litre", "instructions": "Spray at sheath level when symptoms appear. Reduce plant density. Lower nitrogen."},
    {"disease_id": "d19", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma viride", "dosage": "4g per litre", "instructions": "Apply at transplanting and tillering. Maintain wider spacing. Remove weed hosts."},
    # Brown Spot (d20)
    {"disease_id": "d20", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Apply balanced NPK fertilizer. Address soil deficiencies."},
    {"disease_id": "d20", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Potassium-rich compost", "dosage": "Apply balanced organic manure", "instructions": "Address nutrient deficiency with balanced compost. Improve soil health. Use resistant varieties."},
    # Tungro (d21)
    {"disease_id": "d21", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbofuran 3G", "dosage": "7.5kg per acre in nursery", "instructions": "Control leafhopper vector in nursery. Synchronize planting in community. Remove infected plants."},
    {"disease_id": "d21", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Cake in nursery", "dosage": "100kg per acre", "instructions": "Apply neem cake to repel leafhoppers. Use light traps. Grow resistant varieties."},
    # False Smut (d22)
    {"disease_id": "d22", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Propiconazole 25% EC", "dosage": "1ml per litre", "instructions": "Spray at booting and heading stages. Remove smut balls manually. Reduce nitrogen."},
    {"disease_id": "d22", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Balanced nutrition + Trichoderma", "dosage": "4g Trichoderma per litre at booting", "instructions": "Apply bio-control at booting. Avoid excess nitrogen. Use clean certified seed."},
    # Stem Rot (d23)
    {"disease_id": "d23", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre at stem base", "instructions": "Spray at water line area. Decompose stubble with urea treatment. Reduce waterlogging."},
    {"disease_id": "d23", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma + proper stubble management", "dosage": "2kg Trichoderma per acre", "instructions": "Apply to field during stubble decomposition. Alternate wet-dry irrigation. Good drainage."},
    # Grain Discoloration (d24)
    {"disease_id": "d24", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Mancozeb spray at heading", "dosage": "2.5g per litre", "instructions": "Spray at heading and grain filling. Harvest at correct moisture. Avoid delayed harvest."},
    {"disease_id": "d24", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Timely harvest + proper drying", "dosage": "N/A", "instructions": "Harvest at 20-22% grain moisture. Dry to 14% before storage. Control grain sucking insects."},

    # ── Brinjal ─────────────────────────────
    # Bacterial Wilt (d25)
    {"disease_id": "d25", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Streptomycin soil drench", "dosage": "500ppm", "instructions": "Drench around healthy plants. Remove infected plants with root ball. Solarize soil."},
    {"disease_id": "d25", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens + Lime", "dosage": "10g Pseudomonas per litre + lime to pH 6.5", "instructions": "Bio-control soil drench. Raise pH with lime. Graft onto resistant rootstock if available."},
    # Phomopsis Blight (d26)
    {"disease_id": "d26", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre", "instructions": "Spray at first symptoms. Remove infected fruits. Treat seeds with Thiram before sowing."},
    {"disease_id": "d26", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma seed treatment + Neem spray", "dosage": "5g/kg seed + 5ml neem/litre", "instructions": "Treat seeds. Spray neem preventively. Remove infected plant parts promptly."},
    # Little Leaf (d27)
    {"disease_id": "d27", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Dimethoate 30% EC", "dosage": "2ml per litre", "instructions": "Control leafhopper vector. Uproot and destroy infected plants. Use clean planting material."},
    {"disease_id": "d27", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Yellow Sticky Traps", "dosage": "5ml neem per litre", "instructions": "Spray neem to control leafhoppers. Install traps. Remove infected plants and weed hosts."},
    # Cercospora Leaf Spot (d28)
    {"disease_id": "d28", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at 10-day intervals. Remove severely infected leaves. Ensure proper spacing."},
    {"disease_id": "d28", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Apply at early symptom stage. Improve air circulation. Remove crop debris."},
    # Verticillium Wilt (d29)
    {"disease_id": "d29", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Soil fumigation + Carbendazim", "dosage": "2g Carbendazim per litre drench", "instructions": "Drench soil at transplanting. Use resistant varieties. Rotate with cereals for 3 years."},
    {"disease_id": "d29", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Soil solarization + Trichoderma", "dosage": "Solarize 4-6 weeks + 2kg Trichoderma/acre", "instructions": "Solarize with clear plastic in summer. Apply Trichoderma to enriched compost."},
    # Damping Off (d30)
    {"disease_id": "d30", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Captan 50% WP seed treatment", "dosage": "3g per kg seed", "instructions": "Treat seeds before sowing. Use sterilized nursery media. Avoid waterlogging."},
    {"disease_id": "d30", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per kg seed", "instructions": "Seed treatment. Use raised beds. Maintain proper drainage. Avoid dense nursery sowing."},
    # Powdery Mildew (d31)
    {"disease_id": "d31", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Sulphur 80% WP", "dosage": "3g per litre", "instructions": "Spray at first symptoms. Avoid in hot weather above 35C. Improve spacing."},
    {"disease_id": "d31", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Potassium Bicarbonate spray", "dosage": "5g per litre + wetting agent", "instructions": "Spray weekly on affected areas. Improves air circulation. Prune for better light."},
    # Mosaic Virus (d32)
    {"disease_id": "d32", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid 17.8 SL", "dosage": "0.3ml per litre", "instructions": "Control aphid vectors. Remove infected plants. Disinfect tools between plants."},
    {"disease_id": "d32", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Reflective Mulch", "dosage": "5ml neem per litre", "instructions": "Spray neem for aphid control. Use reflective mulch to repel aphids. Remove infected plants."},

    # ── Beans ───────────────────────────────
    # Anthracnose (d33)
    {"disease_id": "d33", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim + Mancozeb", "dosage": "2g combined per litre", "instructions": "Spray at flowering and pod formation. Use certified disease-free seeds."},
    {"disease_id": "d33", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma seed treatment + Copper", "dosage": "5g/kg seed + 3g Cu/litre spray", "instructions": "Treat seeds. Spray copper preventively at flowering. Use 3-year rotation."},
    # Rust (d34)
    {"disease_id": "d34", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Oxycarboxin 75% WP", "dosage": "1g per litre", "instructions": "Spray at first pustule appearance. Repeat every 10 days. Use resistant varieties."},
    {"disease_id": "d34", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Sulphur dust or spray", "dosage": "3g wettable sulphur per litre", "instructions": "Apply at early symptoms. Remove severely infected leaves. Plant resistant varieties."},
    # Angular Leaf Spot (d35)
    {"disease_id": "d35", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Use disease-free seed. Rotate with cereals."},
    {"disease_id": "d35", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide spray", "dosage": "2g per litre", "instructions": "Preventive spray at flowering. Use certified seed. Improve drainage."},
    # Common Bacterial Blight (d36)
    {"disease_id": "d36", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Streptomycin + Copper", "dosage": "500ppm streptomycin + 2g Cu per litre", "instructions": "Spray every 7 days during wet weather. Use pathogen-free seed. Avoid field when wet."},
    {"disease_id": "d36", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux Mixture", "dosage": "0.5% solution", "instructions": "Preventive spray. Use certified disease-free seed. Practice 2-year rotation."},
    # Root Rot (d37)
    {"disease_id": "d37", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Metalaxyl seed treatment", "dosage": "2g per kg seed", "instructions": "Seed treatment before planting. Improve soil drainage. Avoid compaction."},
    {"disease_id": "d37", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "5g per kg seed + soil application", "instructions": "Seed and soil treatment. Raised beds for better drainage. Add compost for soil health."},
    # Bean Mosaic Virus (d38)
    {"disease_id": "d38", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid seed treatment", "dosage": "5ml per kg seed", "instructions": "Seed treatment to protect seedlings. Control aphids. Use virus-free certified seed."},
    {"disease_id": "d38", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Virus-free seed", "dosage": "5ml neem per litre for aphids", "instructions": "Control aphids with neem. Source certified virus-free seeds. Remove infected plants early."},
    # Powdery Mildew (d39)
    {"disease_id": "d39", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Sulphur 80% WP", "dosage": "3g per litre", "instructions": "Spray at first symptoms. Avoid in extreme heat. Improve air circulation."},
    {"disease_id": "d39", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Baking Soda spray", "dosage": "5g baking soda + 5ml oil per litre", "instructions": "Spray weekly on affected plants. The alkaline pH inhibits fungal growth. Best in morning."},
    # Halo Blight (d40)
    {"disease_id": "d40", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Spray at first symptoms. Do not work in field when plants are wet. Use disease-free seed."},
    {"disease_id": "d40", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux Mixture + crop rotation", "dosage": "0.5% Bordeaux solution", "instructions": "Preventive spray before wet season. Use certified seed. 3-year rotation with non-legumes."},

    # ── Onion Solutions (p6) ──────────────────
    # Purple Blotch (d41)
    {"disease_id": "d41", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2g per litre", "instructions": "Spray immediately at first symptom. Repeat at 10-day intervals if humid."},
    {"disease_id": "d41", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens", "dosage": "10g per litre", "instructions": "Apply foliar spray early in the morning. Practice crop rotation with non-allium crops."},
    # Downy Mildew (d42)
    {"disease_id": "d42", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Metalaxyl + Mancozeb", "dosage": "2.5g per litre", "instructions": "Spray on foliage. Ensure leaf undersides are covered. Avoid overhead irrigation."},
    {"disease_id": "d42", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Apply before rains or in high moisture conditions. Use raised beds for drainage."},
    # Onion Smudge (d43)
    {"disease_id": "d43", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Thiram seed treatment", "dosage": "3g per kg", "instructions": "Treat seeds before sowing. Rotate crops and avoid planting in infected soil."},
    {"disease_id": "d43", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Compost mulching + wide spacing", "dosage": "Apply compost mulch", "instructions": "Ensure wide spacing. Harvest during dry weather. Dry bulbs thoroughly before storage."},
    # Black Mold (d44)
    {"disease_id": "d44", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim spray", "dosage": "1.5g per litre", "instructions": "Apply to plants during bulb curing and harvest. Avoid bruising bulbs during harvest."},
    {"disease_id": "d44", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Proper curing & shaded drying", "dosage": "N/A", "instructions": "Cure bulbs in shade with good ventilation for 10-14 days. Store in cool, dry conditions."},
    # Fusarium Bulb Rot (d45)
    {"disease_id": "d45", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim soil drench", "dosage": "2g per litre", "instructions": "Drench soil around affected areas. Avoid damage to roots during weeding."},
    {"disease_id": "d45", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma in compost", "dosage": "2kg per acre in compost", "instructions": "Mix Trichoderma with compost during bed preparation. Ensure 3-year crop rotation."},

    # ── Potato Solutions (p7) ─────────────────
    # Late Blight (d46)
    {"disease_id": "d46", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Cymoxanil + Mancozeb", "dosage": "2g per litre", "instructions": "Apply curative spray. Repeat after 7-10 days if wet weather continues."},
    {"disease_id": "d46", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Foliar spray weekly during cool wet spells. Uproot and destroy infected foliage."},
    # Black Scurf (d47)
    {"disease_id": "d47", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim tuber treatment", "dosage": "2.5g per kg tubers", "instructions": "Treat seed tubers before planting. Plant in warm soil."},
    {"disease_id": "d47", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma tuber coating", "dosage": "10g per kg tubers", "instructions": "Coat seed tubers with bio-fungicide paste. Avoid planting in cold wet soils."},
    # Common Scab (d48)
    {"disease_id": "d48", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Sulphur soil amendment", "dosage": "100kg per acre", "instructions": "Incorporate sulphur into alkaline soil to lower pH below 5.5."},
    {"disease_id": "d48", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Moisture control at initiation", "dosage": "N/A", "instructions": "Maintain high soil moisture during tuber initiation (weeks 5-9) to suppress bacterial growth."},
    # Soft Rot (d49)
    {"disease_id": "d49", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Chlorine dioxide wash", "dosage": "50ppm", "instructions": "Wash harvested tubers in chlorinated water before packing. Ensure tubers dry quickly."},
    {"disease_id": "d49", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Ventilated curing + gentle handling", "dosage": "N/A", "instructions": "Store in cool, well-ventilated dry conditions. Handle tubers gently to prevent wounding."},
    # Leaf Roll (d50)
    {"disease_id": "d50", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid spray", "dosage": "0.5ml per litre", "instructions": "Spray to control aphid vector populations. Remove infected plants."},
    {"disease_id": "d50", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem oil + sticky traps", "dosage": "5ml neem per litre", "instructions": "Spray neem oil to repel aphids. Install yellow sticky traps around the field."},

    # ── Cassava Solutions (p8) ────────────────
    # Cassava Mosaic (d51)
    {"disease_id": "d51", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid vector spray", "dosage": "0.4ml per litre", "instructions": "Spray young plants to control whitefly vector. Destroy diseased plants."},
    {"disease_id": "d51", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Clean cuttings + Neem oil", "dosage": "5ml neem per litre", "instructions": "Select certified disease-free stem cuttings. Spray neem to repel vectors."},
    # Brown Streak (d52)
    {"disease_id": "d52", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Control whitefly vectors", "dosage": "0.5ml Imidacloprid per litre", "instructions": "Foliar spray vector in endemic areas. Uproot infected plants."},
    {"disease_id": "d52", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Resistant cultivars + rogueing", "dosage": "N/A", "instructions": "Plant resistant cultivars. Uproot and burn infected plants immediately."},
    # Bacterial Blight (d53)
    {"disease_id": "d53", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Copper Oxychloride spray", "dosage": "3g per litre", "instructions": "Spray at first signs to control secondary spread. Destruct infected residues."},
    {"disease_id": "d53", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Tool sterilization + crop rotation", "dosage": "N/A", "instructions": "Sterilize tools with 70% alcohol. Practice 2-year crop rotation with legumes."},
    # Anthracnose (d54)
    {"disease_id": "d54", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim + Mancozeb", "dosage": "2g per litre", "instructions": "Apply curative foliar spray when symptoms appear. Use disease-free cuttings."},
    {"disease_id": "d54", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Spray copper preventively before rain. Keep fields free of weeds to reduce humidity."},
    # Root Rot (d55)
    {"disease_id": "d55", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Metalaxyl soil drench", "dosage": "2g per litre", "instructions": "Drench soil at planting in wet soils. Improve drainage."},
    {"disease_id": "d55", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Raised ridges + Trichoderma", "dosage": "2kg Trichoderma per acre", "instructions": "Plant cassava on high ridges. Incorporate Trichoderma into soil during bed preparation."},

    # ── Finger Millet Solutions (p9) ──────────
    # Blast (d56)
    {"disease_id": "d56", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Tricyclazole 75% WP", "dosage": "0.6g per litre", "instructions": "Apply foliar spray at tillering and booting stages. Reduce excess nitrogen."},
    {"disease_id": "d56", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas fluorescens", "dosage": "10g per litre", "instructions": "Foliar spray bio-control agent at boot leaf stage. Use resistant varieties."},
    # Brown Spot (d57)
    {"disease_id": "d57", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray at first symptoms. Correct potassium deficiencies in soil."},
    {"disease_id": "d57", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma seed treatment", "dosage": "10g per kg seed", "instructions": "Treat seeds before sowing. Use balanced compost to avoid nutrient deficiencies."},
    # Smut (d58)
    {"disease_id": "d58", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Propiconazole 25% EC", "dosage": "1ml per litre", "instructions": "Spray at booting and early head emergence to prevent spore development."},
    {"disease_id": "d58", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Manual rogueing + rotation", "dosage": "N/A", "instructions": "Collect and burn infected earheads in bags before galls rupture. Rotate crops."},
    # Seedling Blight (d59)
    {"disease_id": "d59", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Thiram seed treatment", "dosage": "3g per kg seed", "instructions": "Treat seeds before sowing to protect germinating seedlings."},
    {"disease_id": "d59", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma soil application", "dosage": "2kg per acre", "instructions": "Mix Trichoderma in compost and apply to nursery bed prior to sowing."},
    # Banded Blight (d60)
    {"disease_id": "d60", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Hexaconazole 5% EC", "dosage": "2ml per litre", "instructions": "Spray at base of stems where banding lesions are visible. Reduce weed density."},
    {"disease_id": "d60", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Weeding + wider crop spacing", "dosage": "N/A", "instructions": "Maintain wider spacing. Remove weeds to reduce relative humidity near soil surface."},

    # ── Coconut Solutions (p10) ───────────────
    # Bud Rot (d61)
    {"disease_id": "d61", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Copper Oxychloride paste", "dosage": "Apply directly", "instructions": "Remove rotten crown tissue. Apply copper oxychloride paste to cut surface."},
    {"disease_id": "d61", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Bordeaux paste application", "dosage": "Apply directly", "instructions": "Clean rot from crown and apply Bordeaux paste. Protect bud from rain with polythene."},
    # Stem Bleeding (d62)
    {"disease_id": "d62", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim lesion application", "dosage": "2ml undiluted", "instructions": "Inject or paint Carbendazim onto bleeding lesions after scraping off diseased bark."},
    {"disease_id": "d62", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Chiselling + Bordeaux paste", "dosage": "Apply directly", "instructions": "Chisel out infected bark. Apply Bordeaux paste and paint over with coal tar."},
    # Red Ring (d63)
    {"disease_id": "d63", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbofuran vector control", "dosage": "Carbofuran 3G in axils", "instructions": "Control coconut weevil vector using Carbofuran in leaf axils. Remove dead palms."},
    {"disease_id": "d63", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Uprooting & burning", "dosage": "N/A", "instructions": "Immediately cut down, chop, and burn the entire palm to destroy nematodes and weevils."},
    # Leaf Rot (d64)
    {"disease_id": "d64", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray crown and leaves of young palms, especially leaf tips. Avoid waterlogging."},
    {"disease_id": "d64", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem oil + Pseudomonas", "dosage": "5ml neem + 10g Pseudomonas per litre", "instructions": "Foliar spray onto newly emerging leaves during monsoon. Keep basin clean."},
    # Root Wilt (d65)
    {"disease_id": "d65", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Balanced fertilization + Dimethoate", "dosage": "Recommended NPK + 2ml vector spray", "instructions": "Apply recommended chemical fertilizers. Spray dimethoate to control lace bug vector."},
    {"disease_id": "d65", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem cake in basin", "dosage": "5kg neem cake per palm", "instructions": "Apply neem cake in palm basin. Grow green manure in basin and incorporate into soil."},

    # ── Green Gram Solutions (p11) ────────────
    # Yellow Mosaic (d66)
    {"disease_id": "d66", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Dimethoate 30 EC", "dosage": "2ml per litre", "instructions": "Foliar spray to control whitefly vector. Remove infected plants immediately."},
    {"disease_id": "d66", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Oil + Sticky Traps", "dosage": "5ml neem per litre", "instructions": "Spray neem oil to repel whitefly. Install yellow sticky traps. Destroy infected plants."},
    # Powdery Mildew (d67)
    {"disease_id": "d67", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim 50% WP", "dosage": "1g per litre", "instructions": "Foliar spray at first symptom. Repeat in 10-14 days if needed."},
    {"disease_id": "d67", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Wettable Sulphur", "dosage": "3g per litre", "instructions": "Apply early morning. Avoid spraying in high temperature above 35C."},
    # Cercospora Leaf Spot (d68)
    {"disease_id": "d68", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2g per litre", "instructions": "Foliar spray at first symptom. Ensure complete crop coverage."},
    {"disease_id": "d68", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Oxychloride", "dosage": "2.5g per litre", "instructions": "Preventive spray at flower initiation. Ensure good field drainage."},
    # Root Rot (d69)
    {"disease_id": "d69", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim soil drench", "dosage": "2g per litre", "instructions": "Drench soil around stem base of surrounding healthy plants. Avoid waterlogging."},
    {"disease_id": "d69", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma in compost", "dosage": "2kg per acre in compost", "instructions": "Incorporate Trichoderma-enriched compost into field before sowing."},
    # Anthracnose (d70)
    {"disease_id": "d70", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim + Mancozeb", "dosage": "2g per litre", "instructions": "Foliar spray during pod development. Use certified disease-free seeds."},
    {"disease_id": "d70", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas seed treatment", "dosage": "10g per kg seed", "instructions": "Dress seeds before sowing. Practice 2-year crop rotation with non-legumes."},

    # ── Okra Solutions (p12) ──────────────────
    # Yellow Vein Mosaic (d71)
    {"disease_id": "d71", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid spray", "dosage": "0.3ml per litre", "instructions": "Spray to control whitefly vectors. Rogue out infected plants immediately."},
    {"disease_id": "d71", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem oil + Rogueing", "dosage": "5ml neem per litre", "instructions": "Repel vectors with neem oil. Rogue out and burn diseased plants. Clean weeds."},
    # Powdery Mildew (d72)
    {"disease_id": "d72", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Dinocap 48% EC", "dosage": "1ml per litre", "instructions": "Foliar spray at first appearance of powdery patches on foliage."},
    {"disease_id": "d72", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Potassium Bicarbonate spray", "dosage": "5g per litre", "instructions": "Spray weekly. Prune lower shaded leaves to improve canopy airflow."},
    # Cercospora Leaf Spot (d73)
    {"disease_id": "d73", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Zineb 75% WP", "dosage": "2g per litre", "instructions": "Apply foliar spray. Remove severely spotted lower leaves."},
    {"disease_id": "d73", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Foliar spray preventively during monsoon. Maintain clean weed-free cultivation."},
    # Fusarium Wilt (d74)
    {"disease_id": "d74", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim root drench", "dosage": "2g per litre", "instructions": "Drench soil around infected roots. Rotate crops with cereals for 2 years."},
    {"disease_id": "d74", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma + Soil liming", "dosage": "2kg Trichoderma per acre + lime", "instructions": "Drench soil with bio-control. Apply lime to raise soil pH above 6.5."},
    # Damping Off (d75)
    {"disease_id": "d75", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Captan seed treatment", "dosage": "3g per kg seed", "instructions": "Dress seeds before sowing in nursery bed. Avoid overwatering."},
    {"disease_id": "d75", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma harzianum", "dosage": "10g per kg seed", "instructions": "Treat seeds and drench beds. Use raised nursery beds for drainage."},

    # ── Cowpea Solutions (p13) ────────────────
    # Ashy Stem Blight (d76)
    {"disease_id": "d76", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim drench", "dosage": "2g per litre", "instructions": "Drench stem base. Avoid water stress with timely irrigation."},
    {"disease_id": "d76", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Trichoderma + Mulching", "dosage": "2kg Trichoderma per acre", "instructions": "Mix Trichoderma in compost. Mulch soil to conserve moisture during dry spells."},
    # Rust (d77)
    {"disease_id": "d77", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Hexaconazole 5% EC", "dosage": "2ml per litre", "instructions": "Foliar spray when rust spots are seen. Use resistant varieties."},
    {"disease_id": "d77", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Sulphur dusting", "dosage": "10kg per acre", "instructions": "Dust plants in early morning when leaves are damp. Prune dense foliage."},
    # Mosaic Virus (d78)
    {"disease_id": "d78", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Imidacloprid spray", "dosage": "0.5ml per litre", "instructions": "Control aphid vector to prevent virus spread. Remove infected plants."},
    {"disease_id": "d78", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem Seed Kernel Extract", "dosage": "5% solution", "instructions": "Spray to repel aphids. Source certified virus-free seed stocks."},
    # Cercospora Leaf Spot (d79)
    {"disease_id": "d79", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb 75% WP", "dosage": "2.5g per litre", "instructions": "Spray foliage at early symptoms. Rotate with corn or millet crops."},
    {"disease_id": "d79", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Apply foliar spray at early flowering. Maintain wider row spacing."},
    # Root Rot (d80)
    {"disease_id": "d80", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim seed treatment", "dosage": "2g per kg seed", "instructions": "Treat seeds to prevent seedling rot. Avoid planting in compacted soils."},
    {"disease_id": "d80", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Pseudomonas seed treatment", "dosage": "10g per kg seed", "instructions": "Dress seeds and enrich soil with organic compost for root aeration."},

    # ── Bitter Gourd Solutions (p14) ──────────
    # Downy Mildew (d81)
    {"disease_id": "d81", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Metalaxyl + Mancozeb", "dosage": "2.5g per litre", "instructions": "Spray on leaves. Focus on underside. Prune dense lower leaves."},
    {"disease_id": "d81", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Foliar spray before rainy spells. Trellis vines to keep foliage off ground."},
    # Powdery Mildew (d82)
    {"disease_id": "d82", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Dinocap spray", "dosage": "1ml per litre", "instructions": "Spray immediately on leaf spots. Ensure good vine spacing."},
    {"disease_id": "d82", "farming_method": "organic", "solution_type": "curative", "treatment_name": "Baking Soda + Horticultural oil", "dosage": "5g baking soda per litre", "instructions": "Spray weekly. Promotes alkaline leaf pH to inhibit fungal spores."},
    # Bitter Gourd Mosaic (d83)
    {"disease_id": "d83", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Dimethoate spray", "dosage": "2ml per litre", "instructions": "Foliar spray to control aphid vector. Clear weed hosts."},
    {"disease_id": "d83", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Neem oil + vector traps", "dosage": "5ml neem per litre", "instructions": "Spray neem oil. Install traps. Uproot infected vines to protect healthy crop."},
    # Alternaria Leaf Spot (d84)
    {"disease_id": "d84", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Mancozeb spray", "dosage": "2g per litre", "instructions": "Foliar spray at 10-day intervals during wet weather. Remove old leaves."},
    {"disease_id": "d84", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Oxychloride", "dosage": "3g per litre", "instructions": "Apply foliar spray. Remove old bottom leaves to improve aeration."},
    # Anthracnose (d85)
    {"disease_id": "d85", "farming_method": "conventional", "solution_type": "curative", "treatment_name": "Carbendazim spray", "dosage": "1.5g per litre", "instructions": "Spray curative dose. Treat seeds with Thiram before planting."},
    {"disease_id": "d85", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Copper Hydroxide", "dosage": "2g per litre", "instructions": "Preventive spray. Practice crop rotation. Clean and burn infected debris."},

    # ── Sweet Potato Solutions (p15) ──────────
    # Feathery Mottle (d86)
    {"disease_id": "d86", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Vector control spray", "dosage": "0.5ml Imidacloprid per litre", "instructions": "Control aphid vectors. Uproot infected vines to prevent spread."},
    {"disease_id": "d86", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Healthy vine selection + Neem", "dosage": "5ml neem per litre", "instructions": "Select clean healthy vines for planting. Spray neem to repel aphid vectors."},
    # Scurf (d87)
    {"disease_id": "d87", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim vine dip", "dosage": "2g per litre", "instructions": "Dip the base of vine cuttings for 10 minutes before planting."},
    {"disease_id": "d87", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Crop rotation + clean compost", "dosage": "N/A", "instructions": "Use 3-year crop rotation. Avoid fresh manure. Ensure soil drainage."},
    # Black Rot (d88)
    {"disease_id": "d88", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim cutting wash", "dosage": "2g per litre", "instructions": "Treat vine cuttings before planting. Disinfect harvested storage tubers."},
    {"disease_id": "d88", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Crop rotation + hot air curing", "dosage": "N/A", "instructions": "Rotate crops. Cure roots in hot humid room (30C, 90% RH) for 7 days before storing."},
    # Stem Canker (d89)
    {"disease_id": "d89", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Carbendazim soil drench", "dosage": "2g per litre", "instructions": "Drench soil around base of infected vines. Avoid root injury during cultivation."},
    {"disease_id": "d89", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Soil solarization + Trichoderma", "dosage": "2kg Trichoderma per acre", "instructions": "Solarize beds. Add Trichoderma bio-fungicide to organic compost during planting."},
    # Soil Rot (d90)
    {"disease_id": "d90", "farming_method": "conventional", "solution_type": "preventive", "treatment_name": "Soil sulfur application", "dosage": "120kg per acre", "instructions": "Incorporate sulfur into soil to lower pH below 5.2 to suppress bacteria."},
    {"disease_id": "d90", "farming_method": "organic", "solution_type": "preventive", "treatment_name": "Moisture maintenance + rotation", "dosage": "N/A", "instructions": "Keep soil moist during early tuber initiation. Rotate with green manure crops."},
]

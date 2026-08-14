"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sprout, Scissors, Clock, ArrowUpRight, Check, Droplets, Sparkles, Filter } from "lucide-react";
import Link from "next/link";

interface CropItem {
  id: string;
  name: string;
  localName: string;
  category: "vegetable" | "fruit" | "grain" | "spice" | "legume" | "plantation" | "tuber" | "cash_crop" | "herb";
  duration: number;
  varieties: string[];
  pruningNeeded: boolean;
  yieldKg: number;
}

const CROPS_DATA: CropItem[] = [
  // Vegetables (24)
  { id: "tomato", name: "Tomato", localName: "තක්කාලි / தக்காளி", category: "vegetable", duration: 90, varieties: ["Thilina", "Roma", "Cherry", "Target"], pruningNeeded: true, yieldKg: 12000 },
  { id: "chili", name: "Chili", localName: "මිරිස් / மிளகாய்", category: "vegetable", duration: 120, varieties: ["Bird's Eye (MICH 1)", "MI-2", "KA-2", "Demon"], pruningNeeded: true, yieldKg: 6000 },
  { id: "brinjal", name: "Brinjal (Eggplant)", localName: "වම්බටු / கத்தரிக்காய்", category: "vegetable", duration: 130, varieties: ["Padagoda", "Thinnaveli Purple", "SM-164"], pruningNeeded: true, yieldKg: 14000 },
  { id: "bell_pepper", name: "Bell Pepper (Capsicum)", localName: "මාළු මිරිස් / குடைமிளகாய்", category: "vegetable", duration: 95, varieties: ["California Wonder", "Green Wonder"], pruningNeeded: true, yieldKg: 8500 },
  { id: "cabbage", name: "Cabbage", localName: "ගෝවා / முட்டைக்கோஸ்", category: "vegetable", duration: 85, varieties: ["Golden Acre", "Green Express"], pruningNeeded: false, yieldKg: 18000 },
  { id: "cauliflower", name: "Cauliflower", localName: "මල් ගෝවා / காலிஃபிளவர்", category: "vegetable", duration: 85, varieties: ["Snowball", "White Contessa"], pruningNeeded: false, yieldKg: 14000 },
  { id: "broccoli", name: "Broccoli", localName: "බ්‍රොකොලි / ப்ரோக்கோலி", category: "vegetable", duration: 70, varieties: ["Green Magic", "Calabrese"], pruningNeeded: false, yieldKg: 9000 },
  { id: "carrot", name: "Carrot", localName: "කැරට් / கேரட்", category: "vegetable", duration: 90, varieties: ["Nantes", "Kuroda", "New Kuroda"], pruningNeeded: false, yieldKg: 11000 },
  { id: "beetroot", name: "Beetroot", localName: "බීට්රූට් / பீட்ரூட்", category: "vegetable", duration: 75, varieties: ["Detroit Dark Red", "Crimson Globe"], pruningNeeded: false, yieldKg: 9500 },
  { id: "radish", name: "Radish", localName: "රාබු / முள்ளங்கி", category: "vegetable", duration: 50, varieties: ["Beeralu", "White Icicle"], pruningNeeded: false, yieldKg: 10000 },
  { id: "okra", name: "Okra (Ladies Finger)", localName: "බණ්ඩක්කා / வெண்டைக்காய்", category: "vegetable", duration: 85, varieties: ["Haritha", "MI-5", "Clemson Spineless"], pruningNeeded: true, yieldKg: 7500 },
  { id: "beans", name: "Bush / Pole Beans", localName: "බෝංචි / பீன்ஸ்", category: "vegetable", duration: 70, varieties: ["Keppetipola Nil", "Top Crop"], pruningNeeded: true, yieldKg: 6500 },
  { id: "cucumber", name: "Cucumber", localName: "පිපිඤ්ඤා / வெள்ளரிக்காய்", category: "vegetable", duration: 60, varieties: ["Poinsett", "Green Slice"], pruningNeeded: true, yieldKg: 12000 },
  { id: "pumpkin", name: "Pumpkin", localName: "වට්ටක්කා / பூசணிக்காய்", category: "vegetable", duration: 110, varieties: ["Ruhunu", "Arjuna Hybrid"], pruningNeeded: true, yieldKg: 15000 },
  { id: "bitter_gourd", name: "Bitter Gourd", localName: "කරවිල / பாகற்காய்", category: "vegetable", duration: 95, varieties: ["Thinnaveli White", "Matale Green"], pruningNeeded: true, yieldKg: 7000 },
  { id: "snake_gourd", name: "Snake Gourd", localName: "පතෝල / புடலங்காய்", category: "vegetable", duration: 85, varieties: ["TA-2", "MI Short"], pruningNeeded: true, yieldKg: 10000 },
  { id: "ridge_gourd", name: "Ridge Gourd", localName: "වැටකොළු / பீர்க்கங்காய்", category: "vegetable", duration: 75, varieties: ["LA-33", "Deepthi"], pruningNeeded: true, yieldKg: 8500 },
  { id: "bottle_gourd", name: "Bottle Gourd", localName: "දියලබු / சுரைக்காய்", category: "vegetable", duration: 85, varieties: ["Pusa Summer", "Local Long"], pruningNeeded: true, yieldKg: 16000 },
  { id: "spinach", name: "Spinach", localName: "නිවන්ති / பசலைக்கீரை", category: "vegetable", duration: 55, varieties: ["All Green", "Red Malabar"], pruningNeeded: false, yieldKg: 6000 },
  { id: "lettuce", name: "Lettuce", localName: "සලාද / கீரை வகை", category: "vegetable", duration: 50, varieties: ["Grand Rapids", "Butterhead"], pruningNeeded: false, yieldKg: 5000 },
  { id: "gotukola", name: "Gotukola (Centella)", localName: "ගොටුකොළ / வல்லாரை", category: "vegetable", duration: 60, varieties: ["Giant Local", "Wel Gotukola"], pruningNeeded: false, yieldKg: 4000 },
  { id: "onion", name: "Red / Big Onion", localName: "ළූණු / வெங்காயம்", category: "vegetable", duration: 95, varieties: ["Vedalan", "Dambulla Red"], pruningNeeded: false, yieldKg: 9000 },
  { id: "potato", name: "Potato", localName: "අර්තාපල් / உருளைக்கிழங்கு", category: "vegetable", duration: 100, varieties: ["Granola", "Desiree", "Kennebec"], pruningNeeded: false, yieldKg: 15000 },
  { id: "moringa", name: "Drumstick (Moringa)", localName: "මුරුංගා / முருங்கை", category: "vegetable", duration: 365, varieties: ["Jaffna Local", "PKM-1 Hybrid"], pruningNeeded: true, yieldKg: 18000 },

  // Fruits (12)
  { id: "banana", name: "Banana", localName: "කෙසෙල් / வாழை", category: "fruit", duration: 330, varieties: ["Cavendish", "Embul", "Kolikuttu", "Seeni"], pruningNeeded: true, yieldKg: 18000 },
  { id: "mango", name: "Mango", localName: "අඹ / மாம்பழம்", category: "fruit", duration: 365, varieties: ["Tom EJC", "Karthacolomban", "Vellacolomban"], pruningNeeded: true, yieldKg: 8000 },
  { id: "papaya", name: "Papaya", localName: "පැපොල් / பப்பாளி", category: "fruit", duration: 270, varieties: ["Red Lady 786", "Rathna"], pruningNeeded: true, yieldKg: 25000 },
  { id: "pineapple", name: "Pineapple", localName: "අන්නාසි / அன்னாசி", category: "fruit", duration: 360, varieties: ["Mauritius", "Kew Hybrid"], pruningNeeded: true, yieldKg: 22000 },
  { id: "watermelon", name: "Watermelon", localName: "කොමඩු / தர்பூசணி", category: "fruit", duration: 80, varieties: ["Sugar Baby", "Thilina Yellow"], pruningNeeded: true, yieldKg: 16000 },
  { id: "passion_fruit", name: "Passion Fruit", localName: "වැල් දොඩම් / கொடித்தோடை", category: "fruit", duration: 365, varieties: ["Rahangala Purple", "Yellow Hybrid"], pruningNeeded: true, yieldKg: 12000 },
  { id: "guava", name: "Guava", localName: "පේර / கொய்யா", category: "fruit", duration: 365, varieties: ["Bangkok Giant", "Pubudu White"], pruningNeeded: true, yieldKg: 14000 },
  { id: "dragon_fruit", name: "Dragon Fruit", localName: "ඩ්‍රැගන් ෆෲට් / டிராகன் பழம்", category: "fruit", duration: 365, varieties: ["Red Pitaya", "White Pearl"], pruningNeeded: true, yieldKg: 10000 },
  { id: "pomegranate", name: "Pomegranate", localName: "දෙළුම් / மாதுளை", category: "fruit", duration: 365, varieties: ["Bhagwa", "Ruby Red"], pruningNeeded: true, yieldKg: 9000 },
  { id: "lime", name: "Lime", localName: "දෙහි / எலுமிச்சை", category: "fruit", duration: 365, varieties: ["Monaragala Seedless", "Kagzi Lime"], pruningNeeded: true, yieldKg: 8500 },
  { id: "sweet_orange", name: "Sweet Orange", localName: "පැණි දොඩම් / நாரத்தை", category: "fruit", duration: 365, varieties: ["Bibile Sweet", "Valencia"], pruningNeeded: true, yieldKg: 11000 },
  { id: "strawberry", name: "Strawberry", localName: "ස්ට්‍රෝබෙරි / ஸ்ட்ராபெரி", category: "fruit", duration: 120, varieties: ["Chandler", "Festival"], pruningNeeded: true, yieldKg: 6500 },

  // Grains & Cereals (8)
  { id: "rice", name: "Rice (Paddy)", localName: "වී (ගොයම්) / நெல்", category: "grain", duration: 105, varieties: ["Bg 300", "Bg 352", "At 362", "Suwandel"], pruningNeeded: false, yieldKg: 3200 },
  { id: "maize", name: "Maize (Corn)", localName: "බඩඉරිඟු / மக்காச்சோளம்", category: "grain", duration: 110, varieties: ["Pacific 999", "Bhadra Hybrid"], pruningNeeded: false, yieldKg: 3800 },
  { id: "wheat", name: "Wheat", localName: "තිරිඟු / கோதுமை", category: "grain", duration: 110, varieties: ["Sonalika", "Kalyansona"], pruningNeeded: false, yieldKg: 2800 },
  { id: "finger_millet", name: "Finger Millet (Kurakkan)", localName: "කුරක්කන් / கேழ்வரகு", category: "grain", duration: 105, varieties: ["Oshadha", "Ravi", "Local Ragi"], pruningNeeded: false, yieldKg: 1800 },
  { id: "sorghum", name: "Sorghum", localName: "ඉදල් ඉරිඟු / சோளம்", category: "grain", duration: 100, varieties: ["CSH-9", "Local White"], pruningNeeded: false, yieldKg: 2400 },
  { id: "pearl_millet", name: "Pearl Millet (Bajra)", localName: "බජ්රා / கம்பு", category: "grain", duration: 85, varieties: ["ICTP 8203", "HHB 67"], pruningNeeded: false, yieldKg: 1900 },
  { id: "foxtail_millet", name: "Foxtail Millet (Tenai)", localName: "තණහාල් / தினை", category: "grain", duration: 80, varieties: ["Local Gold", "CO-7"], pruningNeeded: false, yieldKg: 1500 },
  { id: "sesame", name: "Sesame (Gingelly)", localName: "තල / எள்", category: "grain", duration: 85, varieties: ["Uma", "MI-3 White"], pruningNeeded: false, yieldKg: 1100 },

  // Spices & Herbs (10)
  { id: "cinnamon", name: "Ceylon Cinnamon", localName: "කුරුඳු / இலவங்கப்பட்டை", category: "spice", duration: 365, varieties: ["Sri Gemunu", "Sri Wijaya"], pruningNeeded: true, yieldKg: 950 },
  { id: "black_pepper", name: "Black Pepper", localName: "ගම්මිරිස් / மிளகு", category: "spice", duration: 365, varieties: ["Panniyur-1", "Dingirala"], pruningNeeded: true, yieldKg: 2200 },
  { id: "cardamom", name: "Cardamom", localName: "එනසාල් / ஏலக்காய்", category: "spice", duration: 365, varieties: ["Malabar Type", "Mysore Type"], pruningNeeded: true, yieldKg: 650 },
  { id: "ginger", name: "Ginger", localName: "ඉඟුරු / இஞ்சி", category: "spice", duration: 240, varieties: ["Chinese Ginger", "Rangoon"], pruningNeeded: false, yieldKg: 9000 },
  { id: "turmeric", name: "Turmeric", localName: "කහ / மஞ்சள்", category: "spice", duration: 270, varieties: ["Galgamuwa Local", "Prathibha"], pruningNeeded: false, yieldKg: 11000 },
  { id: "garlic", name: "Garlic", localName: "සුදුලූණු / பூண்டு", category: "spice", duration: 120, varieties: ["Yamuna Safed", "Local White"], pruningNeeded: false, yieldKg: 4500 },
  { id: "mustard", name: "Mustard", localName: "අබ / கடுகு", category: "spice", duration: 70, varieties: ["Varuna", "Local Brown"], pruningNeeded: false, yieldKg: 1200 },
  { id: "curry_leaves", name: "Curry Leaves (Karapincha)", localName: "කරපිංචා / கறிவேப்பிலை", category: "herb", duration: 365, varieties: ["Gam Medde", "Suwanda"], pruningNeeded: true, yieldKg: 5000 },
  { id: "coriander", name: "Coriander", localName: "කොත්තමල්ලි / கொத்தமல்லி", category: "herb", duration: 45, varieties: ["Pant Haritima", "Local Green"], pruningNeeded: false, yieldKg: 2500 },
  { id: "mint", name: "Mint (Peppermint)", localName: "මිංචි / புதினா", category: "herb", duration: 60, varieties: ["Spearmint", "Japanese Mint"], pruningNeeded: true, yieldKg: 4000 },

  // Legumes & Pulses (6)
  { id: "green_gram", name: "Green Gram (Mung)", localName: "මුං ඇට / பாசிப்பயறு", category: "legume", duration: 65, varieties: ["MI-5", "Ari", "Harsha"], pruningNeeded: false, yieldKg: 1600 },
  { id: "black_gram", name: "Black Gram (Urad)", localName: "උඳු / உளுந்து", category: "legume", duration: 75, varieties: ["MI-1", "Anuradha"], pruningNeeded: false, yieldKg: 1400 },
  { id: "cowpea", name: "Cowpea (Lobia)", localName: "කවුපි / தட்டப்பயறு", category: "legume", duration: 75, varieties: ["Waruni", "Bombay Cowpea"], pruningNeeded: false, yieldKg: 1800 },
  { id: "soybean", name: "Soybean", localName: "සෝයා බෝංචි / சோயாபீன்", category: "legume", duration: 90, varieties: ["Pb-1", "PM-13"], pruningNeeded: false, yieldKg: 2200 },
  { id: "peanut", name: "Peanut (Groundnut)", localName: "රටකජු / வேர்க்கடலை", category: "legume", duration: 105, varieties: ["Indu", "Tikiri", "Lanka Jumbo"], pruningNeeded: false, yieldKg: 2600 },
  { id: "chickpea", name: "Chickpea (Garbanzo)", localName: "කඩල / கொண்டைக்கடலை", category: "legume", duration: 95, varieties: ["JG-11", "Kabuli Dollar"], pruningNeeded: false, yieldKg: 1700 },

  // Plantation & Cash Crops (7)
  { id: "tea", name: "Ceylon Tea (Camellia)", localName: "තේ / தேயிலை", category: "plantation", duration: 365, varieties: ["TRI 2025", "TRI 2023", "TRI 4042"], pruningNeeded: true, yieldKg: 2800 },
  { id: "coffee", name: "Arabica / Robusta Coffee", localName: "කෝපි / காப்பி", category: "plantation", duration: 365, varieties: ["Catimor Hybrid", "S-274 Robusta"], pruningNeeded: true, yieldKg: 2200 },
  { id: "coconut", name: "Coconut", localName: "පොල් / தென்னை", category: "plantation", duration: 365, varieties: ["Tall x Tall (CRIC60)", "Dwarf Green"], pruningNeeded: true, yieldKg: 6500 },
  { id: "cashew", name: "Cashew Nut", localName: "කජු / முந்திரி", category: "plantation", duration: 365, varieties: ["Vengurla-4", "Sri Lanka Gold"], pruningNeeded: true, yieldKg: 1600 },
  { id: "cocoa", name: "Cocoa (Cacao)", localName: "කොකෝවා / கொக்கோ", category: "plantation", duration: 365, varieties: ["Forastero Hybrid", "Criollo Blend"], pruningNeeded: true, yieldKg: 1800 },
  { id: "sugarcane", name: "Sugarcane", localName: "උක් / கரும்பு", category: "cash_crop", duration: 360, varieties: ["SL 96 128", "Co 775"], pruningNeeded: false, yieldKg: 45000 },
  { id: "cotton", name: "Cotton", localName: "කපු / பருத்தி", category: "cash_crop", duration: 150, varieties: ["MCU-5", "Suraj Hybrid"], pruningNeeded: true, yieldKg: 1900 },

  // Tubers & Roots (3)
  { id: "cassava", name: "Cassava (Manioc)", localName: "මඤ්ඤොක්කා / மரவள்ளி", category: "tuber", duration: 240, varieties: ["MU 51", "Kirikawala", "CARP-22"], pruningNeeded: false, yieldKg: 22000 },
  { id: "sweet_potato", name: "Sweet Potato", localName: "බතල / சர்க்கரைவள்ளிக்கிழங்கு", category: "tuber", duration: 110, varieties: ["Gannoruwa White", "CARI-9"], pruningNeeded: false, yieldKg: 14000 },
  { id: "yam", name: "Dioscorea Yam (Innala)", localName: "ඉන්නල / சேனைக்கிழங்கு", category: "tuber", duration: 180, varieties: ["Raja Ala", "Jaffna Purple Yam"], pruningNeeded: false, yieldKg: 16000 },
];

const CATEGORIES = [
  { id: "all", label: "All Crops", count: 70 },
  { id: "vegetable", label: "🥦 Vegetables", count: 24 },
  { id: "fruit", label: "🥭 Fruits", count: 12 },
  { id: "grain", label: "🌾 Grains", count: 8 },
  { id: "spice", label: "🌶️ Spices", count: 7 },
  { id: "plantation", label: "🌴 Plantation", count: 5 },
  { id: "legume", label: "🫘 Legumes", count: 6 },
  { id: "herb", label: "🌿 Herbs", count: 3 },
  { id: "tuber", label: "🍠 Tubers", count: 3 },
  { id: "cash_crop", label: "💰 Cash Crops", count: 2 },
];

export default function CropsLibraryShowcase() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCrops = useMemo(() => {
    return CROPS_DATA.filter((crop) => {
      const matchCat = selectedCat === "all" || crop.category === selectedCat;
      const matchSearch =
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.localName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.varieties.some((v) => v.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchTerm]);

  return (
    <section id="crops" className="relative py-16 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,135,0.15)]">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            70 Master Crops Knowledge Base
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-3">
            Botanical & Agronomic Precision
          </h2>
          <p className="text-base text-text-secondary mt-2 max-w-xl leading-relaxed">
            221 cultivars, 420 continuous growth stages, stage-by-stage water volume, organic/conventional fertilizers, and pruning guides.
          </p>
        </div>

        {/* Search Filter Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crops, Sinhala, Tamil..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-secondary/90 border border-border/90 rounded-2xl text-xs sm:text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-emerald-400/50 backdrop-blur-md shadow-inner"
          />
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 hide-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(0,255,135,0.4)] scale-105"
                  : "bg-surface-secondary/70 text-text-secondary border border-border hover:text-white hover:bg-surface-tertiary"
              }`}
            >
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? "bg-slate-950/20 text-slate-950" : "bg-surface-tertiary text-text-muted"}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Crops Grid ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCrops.map((crop, i) => (
            <motion.div
              key={crop.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              className="glass-card-hover p-5 rounded-2xl flex flex-col justify-between group border-border/80 hover:border-emerald-500/50"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                      {crop.category}
                    </span>
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {crop.name}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                    {crop.duration}d
                  </span>
                </div>

                <p className="text-xs text-text-muted font-mono leading-relaxed">
                  {crop.localName}
                </p>

                {/* Cultivars list preview */}
                <div className="pt-1">
                  <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block mb-1">
                    Cultivars ({crop.varieties.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {crop.varieties.slice(0, 3).map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 rounded-lg bg-surface-tertiary text-[10px] text-slate-300 font-medium border border-border/60"
                      >
                        {v}
                      </span>
                    ))}
                    {crop.varieties.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-surface-tertiary text-[10px] text-text-muted">
                        +{crop.varieties.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Attributes */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {crop.pruningNeeded ? (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold" title="Pruning & Canopy Management Active">
                      <Scissors className="w-3.5 h-3.5" /> Pruning Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-text-muted">
                      <Clock className="w-3.5 h-3.5" /> 6 Stages
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-emerald-400 font-bold">
                  ~{crop.yieldKg.toLocaleString()} kg/ac
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCrops.length === 0 && (
        <div className="text-center py-12 glass-card p-8 rounded-2xl max-w-md mx-auto">
          <p className="text-sm text-text-muted">No crops match your search term &quot;{searchTerm}&quot;.</p>
          <button
            onClick={() => { setSearchTerm(""); setSelectedCat("all"); }}
            className="mt-3 px-4 py-2 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-500/30 transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}
    </section>
  );
}

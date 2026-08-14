"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Droplets, Leaf, Scissors, Bug, ShieldCheck, Sun,
  Activity, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw
} from "lucide-react";

interface CropDemo {
  id: string;
  name: string;
  localName: string;
  variety: string;
  category: string;
  currentStage: string;
  stageNumber: number;
  totalStages: number;
  dayOffset: number;
  duration: number;
  waterNeed: string;
  waterLiters: string;
  fertilizer: string;
  pruningAction: string;
  pruningLevel: string;
  pruningTools: string;
  diseaseTarget: string;
  treatment: string;
  dosage: string;
  safetyInterval: number;
  healthScore: number;
}

const DEMO_CROPS: CropDemo[] = [
  {
    id: "chili",
    name: "Chili",
    localName: "මිරිස් / மிளகாய்",
    variety: "Bird's Eye (MICH 1)",
    category: "Vegetable / Spice",
    currentStage: "Flowering & Early Fruit Set",
    stageNumber: 3,
    totalStages: 6,
    dayOffset: 45,
    duration: 120,
    waterNeed: "12.5 mm / 2 days",
    waterLiters: "50,585 L / acre",
    fertilizer: "Apply 25.0 kg Urea + 15 kg MOP (Conventional)",
    pruningAction: "Desuckering: Remove side suckers below the first 'Y' fork to channel energy to flower buds.",
    pruningLevel: "Critical",
    pruningTools: "Sterilized bypass secateurs, 70% alcohol",
    diseaseTarget: "Chili Leaf Curl Virus / Thrips",
    treatment: "Neem Seed Kernel Extract 5% + Bio-stimulant",
    dosage: "5 ml per liter of water",
    safetyInterval: 3,
    healthScore: 96,
  },
  {
    id: "tomato",
    name: "Tomato",
    localName: "තක්කාලි / தக்காளி",
    variety: "Thilina Hybrid",
    category: "Vegetable",
    currentStage: "Vegetative Canopy Growth",
    stageNumber: 2,
    totalStages: 6,
    dayOffset: 28,
    duration: 90,
    waterNeed: "10.0 mm / day",
    waterLiters: "40,468 L / acre",
    fertilizer: "Apply 40.0 kg Vermicompost + Bio-N",
    pruningAction: "Pinching: Pinch out competing lateral shoots; stake main vine 15cm from ground.",
    pruningLevel: "Recommended",
    pruningTools: "Clean thumb pinching or fine pruning shears",
    diseaseTarget: "Early Blight (Alternaria solani)",
    treatment: "Copper Oxychloride 50% WP",
    dosage: "2.5 g / liter foliar spray",
    safetyInterval: 7,
    healthScore: 94,
  },
  {
    id: "banana",
    name: "Banana",
    localName: "කෙසෙල් / வாழை",
    variety: "Cavendish (Ambul)",
    category: "Fruit",
    currentStage: "Flowering & Bunch Shooting",
    stageNumber: 4,
    totalStages: 6,
    dayOffset: 195,
    duration: 330,
    waterNeed: "22.0 mm / 3 days",
    waterLiters: "89,030 L / acre",
    fertilizer: "Apply 150 kg Well-rotted Cattle Manure + 50g MOP per mat",
    pruningAction: "Desuckering & Leaf Sanitization: Keep 1 main mother stem and 1 vigorous follower follower ratoon.",
    pruningLevel: "Critical",
    pruningTools: "Curved desuckering machete, copper paste",
    diseaseTarget: "Sigatoka Leaf Spot",
    treatment: "Systemic Bio-fungicide + Mineral Oil",
    dosage: "3 ml per liter fine mist",
    safetyInterval: 5,
    healthScore: 98,
  },
  {
    id: "cinnamon",
    name: "Ceylon Cinnamon",
    localName: "කුරුඳු / இலவங்கப்பட்டை",
    variety: "Sri Gemunu",
    category: "Spice / Export",
    currentStage: "Canopy Maintenance & Stem Maturation",
    stageNumber: 5,
    totalStages: 6,
    dayOffset: 280,
    duration: 365,
    waterNeed: "Rainfed / 8.0 mm supplement",
    waterLiters: "32,374 L / acre",
    fertilizer: "Apply Organic Bone Meal + Wood Ash (Potash rich)",
    pruningAction: "Stooling & Coppicing: Cut crooked shoots at ground level to promote straight harvestable quills.",
    pruningLevel: "Formative",
    pruningTools: "Pruning saw, sterilizing flame",
    diseaseTarget: "Rough Bark Disease",
    treatment: "Bordeaux Mixture 1%",
    dosage: "10g copper sulfate + 10g lime / L",
    safetyInterval: 14,
    healthScore: 97,
  },
];

export default function InteractiveFarmSimulator() {
  const [activeCrop, setActiveCrop] = useState<CropDemo>(DEMO_CROPS[0]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleSimulateScan = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult(
        `AI Diagnostic: 98.4% match with ${activeCrop.diseaseTarget}. Recommended immediate preventive application of ${activeCrop.treatment} (${activeCrop.dosage}).`
      );
    }, 1800);
  };

  const progressPercent = Math.round((activeCrop.dayOffset / activeCrop.duration) * 100);

  return (
    <section id="simulator" className="relative py-16 scroll-mt-24">
      <div className="text-center space-y-4 mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,135,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Interactive Simulator Engine
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Experience Autonomous Farm Intelligence
        </h2>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Switch between live crop models to see how AgriFarm AI generates stage-by-stage water volume, precision pruning schedules, and disease prescriptions.
        </p>
      </div>

      {/* ── Crop Model Tabs ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {DEMO_CROPS.map((crop) => {
          const isSelected = activeCrop.id === crop.id;
          return (
            <button
              key={crop.id}
              onClick={() => {
                setActiveCrop(crop);
                setScanResult(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                isSelected
                  ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_20px_rgba(0,255,135,0.35)] scale-105"
                  : "bg-surface-secondary/80 text-text-secondary border border-border/80 hover:text-white hover:bg-surface-tertiary"
              }`}
            >
              <Sprout className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-text-muted"}`} />
              <span>{crop.name}</span>
              <span className="text-[10px] font-mono opacity-70 hidden sm:inline">({crop.variety})</span>
            </button>
          );
        })}
      </div>

      {/* ── Holographic Live Farm Telemetry Card ── */}
      <div className="glass-card p-6 sm:p-8 lg:p-10 border-emerald-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Holographic glowing scan line effect */}
        <div className="pointer-events-none absolute -inset-full bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse" />

        <div className="relative grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Crop Identity & Stage Progress */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  {activeCrop.category} · {activeCrop.localName}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {activeCrop.name}
                </h3>
                <p className="text-sm text-text-secondary mt-0.5 font-mono">
                  Cultivar: <span className="text-white font-semibold">{activeCrop.variety}</span>
                </p>
              </div>

              {/* Health index badge */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Health Index</span>
                <span className="text-2xl font-black text-emerald-400 text-glow-green">
                  {activeCrop.healthScore}%
                </span>
              </div>
            </div>

            {/* Growth Progress Bar */}
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border/80 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">
                  Stage {activeCrop.stageNumber} of {activeCrop.totalStages}:{" "}
                  <strong className="text-emerald-300 font-sans">{activeCrop.currentStage}</strong>
                </span>
                <span className="text-emerald-400 font-bold">Day {activeCrop.dayOffset} / {activeCrop.duration}</span>
              </div>

              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-emerald-950">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-green-400 to-teal-300 rounded-full shadow-[0_0_12px_#00FF87]"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>Planted (Day 0)</span>
                <span>{progressPercent}% Complete</span>
                <span>Harvest (Day {activeCrop.duration})</span>
              </div>
            </div>

            {/* AI Diagnostics Scanner Simulator Trigger */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Doctor Vision Scanner</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Ready
                </span>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Scan your crop foliage with zero-cost computer vision to detect pathogen spores, insect egg clusters, or nutrient chlorosis instantly.
              </p>

              <button
                onClick={handleSimulateScan}
                disabled={scanning}
                className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Neural Model Analyzing Foliage...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Trigger AI Leaf Scan Simulation</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {scanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-3 bg-emerald-950/60 border border-emerald-400/40 rounded-xl text-xs text-emerald-200 leading-relaxed space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Diagnosis Confirmed</span>
                    </div>
                    <p className="text-slate-300">{scanResult}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Prescription Telemetry Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {/* 1. Irrigation Prescription */}
            <div className="p-5 rounded-2xl bg-surface-secondary/80 border border-border/80 hover:border-emerald-500/40 transition-all space-y-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Water Prescription</span>
              </div>
              <div className="text-xl font-black text-white">{activeCrop.waterNeed}</div>
              <p className="text-xs text-text-secondary font-mono">
                Volume: <span className="text-emerald-300">{activeCrop.waterLiters}</span>
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Calculated dynamically from stage canopy coefficient and evapo-transpiration metrics.
              </p>
            </div>

            {/* 2. Fertilizer Prescription */}
            <div className="p-5 rounded-2xl bg-surface-secondary/80 border border-border/80 hover:border-emerald-500/40 transition-all space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Leaf className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Nutrient Dosage</span>
              </div>
              <div className="text-sm font-bold text-white line-clamp-2">{activeCrop.fertilizer}</div>
              <p className="text-[11px] text-text-muted leading-relaxed mt-2">
                Ring application 15cm from base to prevent root scorch.
              </p>
            </div>

            {/* 3. Pruning & Canopy Action */}
            <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-400 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400">
                  <Scissors className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pruning Protocol</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                  {activeCrop.pruningLevel}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeCrop.pruningAction}
              </p>
              <p className="text-[11px] text-text-muted font-mono">
                Tools: {activeCrop.pruningTools}
              </p>
            </div>

            {/* 4. Disease Protection Protocol */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-400 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Disease Shield</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                  {activeCrop.safetyInterval}d Safety
                </span>
              </div>
              <div className="text-xs font-bold text-white">{activeCrop.diseaseTarget}</div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {activeCrop.treatment} ({activeCrop.dosage})
              </p>
              <p className="text-[11px] text-text-muted">
                Pre-harvest interval: {activeCrop.safetyInterval} days before harvesting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

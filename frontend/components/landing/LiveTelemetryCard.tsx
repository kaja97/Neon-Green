"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Droplets, Sparkles, Sprout, ShieldCheck,
  CheckCircle2, AlertCircle, ArrowUpRight, Gauge, Cpu, Clock
} from "lucide-react";

interface CropTelemetry {
  id: string;
  name: string;
  category: string;
  stage: string;
  stageNum: number;
  totalStages: number;
  daysActive: number;
  totalDays: number;
  moisture: number;
  targetMoisture: string;
  npk: { n: number; p: number; k: number };
  healthScore: number;
  nextWater: string;
  waterDose: string;
  aiInsight: string;
  status: "Optimal" | "Synced" | "Active";
}

const SAMPLE_CROPS: CropTelemetry[] = [
  {
    id: "strawberry",
    name: "Alpine Strawberry",
    category: "Berries / Hydroponic",
    stage: "Flowering & Fruit Set",
    stageNum: 3,
    totalStages: 5,
    daysActive: 42,
    totalDays: 75,
    moisture: 68,
    targetMoisture: "65 - 72%",
    npk: { n: 120, p: 55, k: 210 },
    healthScore: 100,
    nextWater: "45 mins",
    waterDose: "1.2 L (ET₀ adjusted)",
    aiInsight: "Canopy transpiration optimal. Potassium reserves verified for dense sugar synthesis. Zero pathogens detected.",
    status: "Optimal"
  },
  {
    id: "tomato",
    name: "Roma Tomato (F1)",
    category: "Solanaceae / Greenhouse",
    stage: "Vegetative Canopy Expansion",
    stageNum: 2,
    totalStages: 5,
    daysActive: 28,
    totalDays: 90,
    moisture: 72,
    targetMoisture: "70 - 75%",
    npk: { n: 180, p: 40, k: 150 },
    healthScore: 99,
    nextWater: "1 hr 15m",
    waterDose: "2.4 L (Solar linked)",
    aiInsight: "Pruning recommended on 3 lower lateral suckers to maximize light penetration before flowering cluster sets.",
    status: "Synced"
  },
  {
    id: "bell_pepper",
    name: "Sweet Bell Pepper",
    category: "Protected Agriculture",
    stage: "Fruit Maturation",
    stageNum: 4,
    totalStages: 5,
    daysActive: 64,
    totalDays: 85,
    moisture: 64,
    targetMoisture: "62 - 68%",
    npk: { n: 110, p: 50, k: 240 },
    healthScore: 98,
    nextWater: "2 hrs 10m",
    waterDose: "1.8 L (Pulse Drip)",
    aiInsight: "Calcium mobility verified. Zero blossom-end rot risk detected by multimodal vision scan.",
    status: "Optimal"
  }
];

export default function LiveTelemetryCard() {
  const [selectedId, setSelectedId] = useState<string>("strawberry");
  const crop = SAMPLE_CROPS.find((c) => c.id === selectedId) || SAMPLE_CROPS[0];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Outer Glow Container */}
      <div className="relative rounded-[28px] p-1 bg-gradient-to-b from-emerald-500/30 via-teal-500/15 to-transparent shadow-[0_8px_40px_rgba(16,185,129,0.18)]">
        <div className="relative rounded-[26px] bg-surface-secondary/95 border border-border backdrop-blur-2xl p-5 sm:p-7 space-y-6 overflow-hidden">
          {/* Header & Crop Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                    Live Telemetry Simulation
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    AUTONOMOUS
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white">
                  Stage-by-Stage Precision Telemetry
                </h3>
              </div>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-tertiary/70 p-1 rounded-2xl border border-border">
              {SAMPLE_CROPS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    selectedId === item.id
                      ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                  }`}
                >
                  {item.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Content Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Crop Hero Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-surface-tertiary/50 border border-border/80">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-900 dark:text-white">{crop.name}</h4>
                    <span className="text-xs text-text-muted font-medium">· {crop.category}</span>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    Current Stage: <span className="text-slate-900 dark:text-slate-900 dark:text-white font-bold">{crop.stage}</span> (Day {crop.daysActive} of {crop.totalDays})
                  </p>
                </div>

                {/* Stage Progress Pills */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: crop.totalStages }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        idx + 1 < crop.stageNum
                          ? "w-7 bg-emerald-500"
                          : idx + 1 === crop.stageNum
                          ? "w-9 bg-emerald-400 shadow-[0_0_10px_rgba(0,255,135,0.6)] animate-pulse"
                          : "w-5 bg-border"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 4 Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Metric 1: Soil Moisture */}
                <div className="p-3.5 rounded-2xl bg-surface-primary/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-semibold">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      Moisture
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">OPTIMAL</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-900 dark:text-white font-mono">
                    {crop.moisture}%
                  </div>
                  <div className="w-full bg-surface-tertiary h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${crop.moisture}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted">Target: {crop.targetMoisture}</p>
                </div>

                {/* Metric 2: N-P-K Synced Ratios */}
                <div className="p-3.5 rounded-2xl bg-surface-primary/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-semibold">
                      <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                      NPK Balance
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">100% SYNC</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white font-mono">
                    {crop.npk.n} · {crop.npk.p} · {crop.npk.k}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono font-semibold pt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400">N:{crop.npk.n}</span>
                    <span className="text-text-muted">·</span>
                    <span className="text-cyan-600 dark:text-cyan-400">P:{crop.npk.p}</span>
                    <span className="text-text-muted">·</span>
                    <span className="text-amber-600 dark:text-amber-400">K:{crop.npk.k}</span>
                  </div>
                  <p className="text-[10px] text-text-muted">PPM in root zone</p>
                </div>

                {/* Metric 3: AI Health Index */}
                <div className="p-3.5 rounded-2xl bg-surface-primary/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      AI Health
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">PRISTINE</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {crop.healthScore}%
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Zero Pests Detected</span>
                  </div>
                  <p className="text-[10px] text-text-muted">Gemini Vision verified</p>
                </div>

                {/* Metric 4: Next Irrigation Trigger */}
                <div className="p-3.5 rounded-2xl bg-surface-primary/70 border border-border space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      Next Cycle
                    </span>
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">AUTO</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 dark:text-slate-900 dark:text-white font-mono">
                    {crop.nextWater}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 font-semibold truncate">
                    {crop.waterDose}
                  </div>
                  <p className="text-[10px] text-text-muted">Solar & ET₀ calculated</p>
                </div>
              </div>

              {/* AI Real-Time Agronomist Prescription Box */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Gemini Agronomy Intelligence
                    </span>
                    <span className="text-[10px] text-text-muted">Just now</span>
                  </div>
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-semibold">
                    {crop.aiInsight}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

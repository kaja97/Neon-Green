"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Sprout, Stethoscope, Store, Sparkles,
  ArrowRight, CheckCircle2, ShieldCheck, Droplets, Zap,
  TrendingUp, Activity, FileCheck, Layers, AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function PlatformCockpit() {
  const [activeTab, setActiveTab] = useState<"soil" | "stages" | "doctor" | "market">("soil");

  return (
    <div className="w-full space-y-8">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Autonomous Capability Cockpit</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
          Engineered for Absolute Agronomic Precision
        </h2>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-medium">
          Explore how Neon Farming automates every dimension of your crop cycle — from subterranean soil ion chemistry to peak harvest and direct wholesale trading.
        </p>
      </div>

      {/* Tab Switcher Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 max-w-2xl mx-auto rounded-3xl bg-surface-secondary border border-border backdrop-blur-xl shadow-sm">
        <button
          onClick={() => setActiveTab("soil")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
            activeTab === "soil"
              ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Soil AI & Ions</span>
        </button>

        <button
          onClick={() => setActiveTab("stages")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
            activeTab === "stages"
              ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>70-Crop Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab("doctor")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
            activeTab === "doctor"
              ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>AI Plant Doctor</span>
        </button>

        <button
          onClick={() => setActiveTab("market")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
            activeTab === "market"
              ? "bg-emerald-500 text-slate-950 font-black shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Market Telemetry</span>
        </button>
      </div>

      {/* Main Interactive Stage Box */}
      <div className="relative rounded-[32px] p-1 bg-gradient-to-b from-emerald-500/20 via-border/50 to-transparent">
        <div className="rounded-[30px] bg-surface-secondary/95 border border-border backdrop-blur-2xl p-6 sm:p-10 min-h-[460px] flex items-center justify-center overflow-hidden shadow-xl">
          <AnimatePresence mode="wait">
            {/* ════════ TAB 1: SOIL AI & ION BALANCER ════════ */}
            {activeTab === "soil" && (
              <motion.div
                key="soil"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Description */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
                    Instant AI Soil Diagnostics & NPK Formulation
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    Upload soil lab documents or input sensor telemetry. Our multimodal Vision AI automatically extracts organic carbon, pH, electrical conductivity (EC), and exact N-P-K balances to generate custom mineral and compost recipes.
                  </p>
                  <ul className="space-y-2 text-xs text-text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Automatic PDF/Image lab document OCR extraction</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Stage-specific macro and micro-nutrient deficit balancer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Zero-waste organic compost & chemical dosage guides</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 group"
                    >
                      <span>Try Soil Lab Document Extraction</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Interactive Simulation Widget */}
                <div className="lg:col-span-7 rounded-2xl bg-surface-primary/80 border border-border p-5 sm:p-6 space-y-5 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-900 dark:text-white">Lab Test Extraction: #SL-40892</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      OCR VERIFIED
                    </span>
                  </div>

                  {/* NPK Slider Readouts */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-secondary font-mono">Nitrogen (N) — Vegetative Growth</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">140 ppm (Optimal)</span>
                      </div>
                      <div className="w-full bg-surface-tertiary h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-[70%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-secondary font-mono">Phosphorus (P) — Root & Flowering</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">45 ppm (Balanced)</span>
                      </div>
                      <div className="w-full bg-surface-tertiary h-2 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full w-[55%]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-text-secondary font-mono">Potassium (K) — Fruit Sugar & Yield</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">210 ppm (High Demand)</span>
                      </div>
                      <div className="w-full bg-surface-tertiary h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full w-[85%]" />
                      </div>
                    </div>
                  </div>

                  {/* pH and Organic Carbon gauges */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-surface-secondary border border-border text-center">
                      <p className="text-[10px] font-mono text-text-muted font-bold">SOIL pH LEVEL</p>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-900 dark:text-white font-mono">6.4</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Optimal Acidity</span>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-secondary border border-border text-center">
                      <p className="text-[10px] font-mono text-text-muted font-bold">ORGANIC CARBON</p>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-900 dark:text-white font-mono">1.82%</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Rich Bio-Activity</span>
                    </div>
                  </div>

                  {/* AI Output Recipe Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Recommended Prescription:
                    </p>
                    <p className="text-text-secondary font-medium">
                      Apply 220g Organic Compost per bed + 45g Potassium Sulphate before flowering transition to prevent potassium lockup.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════ TAB 2: 70-CROP STAGE TIMELINE ════════ */}
            {activeTab === "stages" && (
              <motion.div
                key="stages"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Description */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
                    Multi-Stage Continuous Agronomic Intelligence
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    Our library spans 70 master crops with 420 distinct phenological growth stages. The system calculates continuous ET₀ irrigation, canopy pruning schedules, and nutrient adjustments dynamically adapted to real-time weather.
                  </p>
                  <ul className="space-y-2 text-xs text-text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>Stage-by-stage continuous irrigation mathematics (ET₀ × Kc)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>Zero-waste nutrient scheduling aligned with crop growth</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                      <span>Automated canopy pruning and pest shielding calendars</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 group"
                    >
                      <span>Explore Full 70 Crops Knowledge Base</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Interactive Growth Stage Visualizer */}
                <div className="lg:col-span-7 rounded-2xl bg-surface-primary/80 border border-border p-5 sm:p-6 space-y-5 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-900 dark:text-white">Crop Stage Progression Engine</span>
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-bold">420 Phenological Stages</span>
                  </div>

                  {/* 5 Stage Horizontal Stepper */}
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {[
                      { name: "Seedling", days: "Day 1-14", active: true, done: true },
                      { name: "Vegetative", days: "Day 15-35", active: true, done: true },
                      { name: "Flowering", days: "Day 36-55", active: true, current: true },
                      { name: "Fruiting", days: "Day 56-75", active: false },
                      { name: "Harvest", days: "Day 76-90", active: false }
                    ].map((st, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          st.current
                            ? "bg-cyan-500/20 border-cyan-500 text-slate-900 dark:text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                            : st.done
                            ? "bg-surface-secondary border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold"
                            : "bg-surface-tertiary/40 border-border text-text-muted opacity-60"
                        }`}
                      >
                        <p className="font-bold text-[11px] truncate">{st.name}</p>
                        <p className="text-[9px] font-mono opacity-80">{st.days}</p>
                      </div>
                    ))}
                  </div>

                  {/* Active Stage Detail Box */}
                  <div className="p-4 rounded-2xl bg-surface-secondary border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-cyan-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-900 dark:text-white">Active Phase: Flowering & Fruit Set</span>
                      </div>
                      <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-bold">Kc: 1.15</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-surface-primary border border-border">
                        <p className="text-[10px] text-text-muted font-semibold">DAILY WATER NEED</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white font-mono">4.2 mm/day</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-primary border border-border">
                        <p className="text-[10px] text-text-muted font-semibold">TARGET NPK RATIO</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white font-mono">1 : 0.5 : 2.0</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-surface-primary border border-border col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-text-muted font-semibold">PRUNING PROTOCOL</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">De-sucker Wk 6</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════ TAB 3: AI PLANT DOCTOR ════════ */}
            {activeTab === "doctor" && (
              <motion.div
                key="doctor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Description */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
                    Multimodal AI Pest & Disease Specialist
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    Zero-cost AI diagnostics powered by Google Gemini. Snap a photo or describe symptoms in any language. Receive verified pathogen identification, confidence scores, and dual-layer treatment plans (organic first, chemical backup).
                  </p>
                  <ul className="space-y-2 text-xs text-text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>99.4% diagnostic accuracy across 1,140 verified remedies</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Zero-cost free tier with voice & multimodal photo analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
                      <span>Offline-first PWA caching for rural field reliability</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/register"
                      className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-500 group"
                    >
                      <span>Start Free AI Plant Diagnostics</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Interactive AI Doctor Scanner */}
                <div className="lg:col-span-7 rounded-2xl bg-surface-primary/80 border border-border p-5 sm:p-6 space-y-4 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      Gemini Multimodal Crop Diagnostic Scan
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      99.4% MATCH
                    </span>
                  </div>

                  {/* Diagnosis Result Banner */}
                  <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white">Identified: Early Blight (Alternaria solani)</h4>
                      <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">High Severity</span>
                    </div>
                    <p className="text-xs text-text-secondary font-medium">
                      Concentric target-like brown spots observed on lower foliage with chlorotic yellow halo.
                    </p>
                  </div>

                  {/* Remediation Protocols */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-surface-secondary border border-emerald-500/30 space-y-1">
                      <p className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">1. Organic Primary Protocol</p>
                      <p className="text-text-secondary text-[11px] font-medium">
                        Apply 5ml/L Cold-Pressed Neem Oil + 2g/L Potassium Bicarbonate foliar spray at sunset.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-secondary border border-amber-500/30 space-y-1">
                      <p className="font-bold text-amber-700 dark:text-amber-400 font-mono">2. Chemical Emergency Backup</p>
                      <p className="text-text-secondary text-[11px] font-medium">
                        Copper Oxychloride (50% WP) @ 2.5g/L if lesions expand within 48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════════ TAB 4: MARKET TELEMETRY ════════ */}
            {activeTab === "market" && (
              <motion.div
                key="market"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Left Description */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Store className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
                    Direct Wholesale Trading & Economic Centers
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    Bypass commission-heavy middlemen. Connect straight with verified agricultural buyers, exporters, and wholesale merchants with live price tracking from major dedicated economic centres.
                  </p>
                  <ul className="space-y-2 text-xs text-text-primary font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Live wholesale price feeds (Pettah, Dambulla, Keppetipola, Meegoda)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>0% transaction fees — direct peer-to-peer agro-trading</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Automated harvest volume listings and instant buyer requests</span>
                    </li>
                  </ul>
                  <div className="pt-2">
                    <Link
                      href="/market"
                      className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 group"
                    >
                      <span>Explore Live Marketplace</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Interactive Market Price Ticker */}
                <div className="lg:col-span-7 rounded-2xl bg-surface-primary/80 border border-border p-5 sm:p-6 space-y-4 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      Live Economic Center Wholesale Feeds
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">UPDATED REAL-TIME</span>
                  </div>

                  {/* 4 Market Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-white">Pettah Central</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">+4.2%</span>
                      </div>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">Rs. 420<span className="text-xs text-text-muted">/kg</span></p>
                      <p className="text-[10px] text-text-muted font-medium">Grade A Tomato · High Demand</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-white">Dambulla D.E.C.</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">+2.1%</span>
                      </div>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">Rs. 395<span className="text-xs text-text-muted">/kg</span></p>
                      <p className="text-[10px] text-text-muted font-medium">High Volume Daily Turnout</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-white">Keppetipola Hub</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">+5.8%</span>
                      </div>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">Rs. 410<span className="text-xs text-text-muted">/kg</span></p>
                      <p className="text-[10px] text-text-muted font-medium">Upcountry Vegetable Exchange</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-surface-secondary border border-border space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-900 dark:text-white">Meegoda Market</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-[11px]">+1.5%</span>
                      </div>
                      <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">Rs. 430<span className="text-xs text-text-muted">/kg</span></p>
                      <p className="text-[10px] text-text-muted font-medium">Direct Supermarket Hub</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Calendar, Bug, Store, Sparkles, Droplets, Leaf,
  Scissors, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Geo-Mapping & Soil Analysis",
    badge: "Initialization",
    icon: MapPin,
    color: "from-blue-500 to-emerald-500",
    iconColor: "text-blue-400",
    bgGlow: "bg-blue-500/10",
    description:
      "Pinpoint your exact farm acreage with GPS coordinates. AgriFarm AI maps your soil profile (pH, texture, N-P-K levels) and binds hyper-local OpenWeather telemetry.",
    metrics: ["Micro-Climate Telemetry", "pH & NPK Soil Baseline", "Rainfall Accumulation"],
  },
  {
    step: "02",
    title: "Autonomous Activity Schedule",
    badge: "Engine",
    icon: Calendar,
    color: "from-emerald-400 to-green-500",
    iconColor: "text-emerald-400",
    bgGlow: "bg-emerald-500/10",
    description:
      "Our planner engine compiles 6 unbroken developmental stages. It computes stage-by-stage irrigation volume (liters), fertilizer timing, and pruning trigger days.",
    metrics: ["Litres / Acre Water Formula", "Pruning Trigger Protocols", "Organic / Synthetic Modes"],
  },
  {
    step: "03",
    title: "AI Plant Doctor & Protection",
    badge: "Health AI",
    icon: Bug,
    color: "from-amber-400 to-rose-500",
    iconColor: "text-rose-400",
    bgGlow: "bg-rose-500/10",
    description:
      "Protect crops with bi-weekly preventative protocols and zero-cost Gemini computer vision. Snap a photo of leaf symptoms to receive verified dosage instructions.",
    metrics: ["1,140 Verified Solutions", "Pre-Harvest Safety Windows", "Zero-Cost AI Diagnosis"],
  },
  {
    step: "04",
    title: "Direct Marketplace & Price Indices",
    badge: "Harvest & Trade",
    icon: Store,
    color: "from-purple-400 to-emerald-400",
    iconColor: "text-purple-400",
    bgGlow: "bg-purple-500/10",
    description:
      "Monitor wholesale price trends across Dambulla, Pettah, Keppetipola, and Meegoda economic centers. List harvested crops directly to wholesale buyers with zero middleman fees.",
    metrics: ["6 Wholesale Market Feeds", "Direct Farmer-Buyer Deal", "Real-Time Price Indices"],
  },
];

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="workflow" className="relative py-16 scroll-mt-24">
      <div className="text-center space-y-4 mb-14">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,135,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          End-to-End Precision Pipeline
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          From Seed Sowing to Bumper Harvest
        </h2>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          How AgriFarm AI guides growers through every single day of the agricultural season.
        </p>
      </div>

      {/* ── 4 Steps Grid ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = activeStep === idx;

          return (
            <div
              key={step.step}
              onClick={() => setActiveStep(idx)}
              className={`glass-card-hover p-6 rounded-3xl cursor-pointer transition-all duration-500 flex flex-col justify-between relative overflow-hidden ${
                isCurrent
                  ? "border-emerald-400/80 shadow-[0_0_30px_rgba(0,255,135,0.25)] scale-[1.02]"
                  : "border-border/80 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Step number watermark */}
              <div className="absolute -top-4 -right-2 text-6xl font-black text-white/[0.03] select-none font-mono">
                {step.step}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${step.bgGlow} border border-border`}>
                    <Icon className={`w-6 h-6 ${step.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-surface-tertiary text-text-secondary border border-border">
                    {step.badge}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400">Step {step.step}</span>
                  <h3 className="text-lg font-bold text-white mt-1 leading-snug">{step.title}</h3>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/70 space-y-1.5">
                {step.metrics.map((m) => (
                  <div key={m} className="flex items-center gap-2 text-[11px] text-text-muted">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

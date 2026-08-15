"use client";

import { useState } from "react";
import {
  Sparkles, Sprout, Droplets, Scissors, ShieldAlert,
  TrendingUp, CheckCircle2, ChevronRight
} from "lucide-react";

interface Step {
  step: string;
  title: string;
  badge: string;
  description: string;
  icon: any;
  iconColor: string;
  bgGlow: string;
  metrics: string[];
}

const STEPS: Step[] = [
  {
    step: "01",
    title: "Soil Diagnostic & Calibration",
    badge: "Day 0",
    description: "Upload soil lab tests or input manual NPK readings. Gemini AI automatically computes chemical deficits, optimal pH balance, and organic compost recipes tailored to your crop.",
    icon: Droplets,
    iconColor: "text-blue-500 dark:text-blue-400",
    bgGlow: "bg-blue-500/10",
    metrics: ["Instant OCR Extraction", "NPK Deficit Math", "Organic Alternatives"],
  },
  {
    step: "02",
    title: "Continuous Growth Engine",
    badge: "Vegetative Phase",
    description: "Your crop automatically advances across growth stages. Our FAO-56 Penman-Monteith engine delivers precision daily irrigation dosages and microclimate canopy pruning triggers.",
    icon: Sprout,
    iconColor: "text-emerald-500 dark:text-emerald-400",
    bgGlow: "bg-emerald-500/10",
    metrics: ["ET₀ Evapotranspiration", "Canopy Sun Exposure", "Stage-by-Stage Nutrition"],
  },
  {
    step: "03",
    title: "AI Plant Doctor & Shielding",
    badge: "Continuous Active",
    description: "Snap a photo of leaf anomalies or pest infestations. Get multimodal AI diagnostics, confidence percentages, and zero-cost organic or chemical remediation protocols.",
    icon: ShieldAlert,
    iconColor: "text-purple-500 dark:text-purple-400",
    bgGlow: "bg-purple-500/10",
    metrics: ["Multimodal Image AI", "99.4% Diagnosis Match", "Dual Treatment Paths"],
  },
  {
    step: "04",
    title: "Harvest & Direct Marketplace",
    badge: "Maturity Phase",
    description: "Log harvest volume and list directly to wholesale buyers and dedicated economic centers without commission cuts or intermediate broker price slashing.",
    icon: TrendingUp,
    iconColor: "text-amber-500 dark:text-amber-400",
    bgGlow: "bg-amber-500/10",
    metrics: ["Direct Wholesale Trade", "Live Economic Center Ticker", "0% Broker Cuts"],
  },
];

export default function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="workflow" className="scroll-mt-28 space-y-12">
      {/* ── Section Header ── */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,135,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          End-to-End Precision Pipeline
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-slate-900 dark:text-white tracking-tight">
          From Seed Sowing to Bumper Harvest
        </h2>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
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
              className={`glass-card-hover p-6 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                isCurrent
                  ? "border-emerald-500 shadow-[0_0_30px_rgba(0,255,135,0.22)] scale-[1.02]"
                  : "border-border opacity-90 hover:opacity-100"
              }`}
            >
              {/* Step number watermark */}
              <div className="absolute -top-4 -right-2 text-6xl font-black text-slate-900/[0.04] dark:text-slate-900 dark:text-white/[0.03] select-none font-mono">
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
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Step {step.step}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white mt-1 leading-snug">{step.title}</h3>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed font-medium">{step.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/70 space-y-1.5">
                {step.metrics.map((m) => (
                  <div key={m} className="flex items-center gap-2 text-[11px] text-text-muted font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
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

"use client";

import React, { useState, useEffect } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { Sprout, Sun, Sparkles, Activity, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";

interface HUDProps {
  progress: MotionValue<number>;
}

export default function PhaseTelemetryHUD({ progress }: HUDProps) {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [depthText, setDepthText] = useState("DEPTH: -1.20M");
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const unsubscribe = progress.on("change", (latest) => {
      const pct = Math.round(latest * 100);
      setScrollPct(pct);

      if (latest < 0.35) {
        setActivePhase(1);
        setDepthText("SOIL DEPTH: -1.20M");
      } else if (latest < 0.68) {
        setActivePhase(2);
        setDepthText("AERIAL ALT: +15.0M");
      } else {
        setActivePhase(3);
        setDepthText("ORBITAL ALT: +400KM");
      }
    });

    return () => unsubscribe();
  }, [progress]);

  const scrollToPhase = (phase: 1 | 2 | 3) => {
    if (typeof window === "undefined") return;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    let targetRatio = 0;
    if (phase === 1) targetRatio = 0;
    else if (phase === 2) targetRatio = 0.45;
    else if (phase === 3) targetRatio = 0.85;

    window.scrollTo({
      top: docHeight * targetRatio,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 left-4 sm:left-8 z-40 select-none flex flex-col gap-2 pointer-events-auto">
      {/* ── Cyber HUD Container ── */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-emerald-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center gap-2 sm:gap-3 transition-all duration-300">
        {/* Live Status Beacon */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">{depthText}</span>
          <span className="sm:hidden">{scrollPct}%</span>
        </div>

        {/* 3 Clickable Phase Switches */}
        <div className="flex items-center gap-1.5">
          {/* Phase 1: Genesis */}
          <button
            onClick={() => scrollToPhase(1)}
            aria-label="Jump to Genesis Phase"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 ${
              activePhase === 1
                ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                : "bg-surface-secondary/60 text-slate-400 hover:text-emerald-300 hover:bg-surface-elevated"
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span className="hidden md:inline">01 Genesis</span>
            <span className="md:hidden">01</span>
          </button>

          {/* Phase 2: Synthesis */}
          <button
            onClick={() => scrollToPhase(2)}
            aria-label="Jump to Synthesis Phase"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 ${
              activePhase === 2
                ? "bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-105"
                : "bg-surface-secondary/60 text-slate-400 hover:text-cyan-300 hover:bg-surface-elevated"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden md:inline">02 Synthesis</span>
            <span className="md:hidden">02</span>
          </button>

          {/* Phase 3: Abundance */}
          <button
            onClick={() => scrollToPhase(3)}
            aria-label="Jump to Abundance Phase"
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 ${
              activePhase === 3
                ? "bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105"
                : "bg-surface-secondary/60 text-slate-400 hover:text-amber-300 hover:bg-surface-elevated"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">03 Abundance</span>
            <span className="md:hidden">03</span>
          </button>
        </div>
      </div>
    </div>
  );
}

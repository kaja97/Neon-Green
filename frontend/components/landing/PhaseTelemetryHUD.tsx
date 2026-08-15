"use client";

import React, { useState, useEffect } from "react";
import { MotionValue } from "framer-motion";
import { Sparkles, Sprout, TrendingUp } from "lucide-react";

interface HUDProps {
  progress: MotionValue<number>;
}

export default function PhaseTelemetryHUD({ progress }: HUDProps) {
  const [activePhase, setActivePhase] = useState<1 | 2 | 3>(1);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    return progress.on("change", (latest) => {
      setPct(Math.round(latest * 100));
      if (latest < 0.35) {
        setActivePhase(1);
      } else if (latest < 0.70) {
        setActivePhase(2);
      } else {
        setActivePhase(3);
      }
    });
  }, [progress]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (typeof document !== "undefined") {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <aside
      aria-label="Agronomic Phase Telemetry"
      className="hidden lg:block fixed right-6 top-32 z-40 select-none pointer-events-auto"
    >
      <div className="glass-card p-3 rounded-2xl border-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-3 w-56">
        {/* HUD Top Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              SYSTEM HUD
            </span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">{pct}%</span>
        </div>

        {/* 3 Interactive Phase Links */}
        <div className="space-y-1.5">
          {/* Phase 1: Genesis */}
          <a
            href="#genesis"
            onClick={(e) => handleSmoothScroll(e, "genesis")}
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
              activePhase === 1
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "text-text-secondary hover:text-white hover:bg-surface-secondary"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>01. Genesis</span>
            </div>
            <span className="text-[9px] font-mono text-text-muted">Soil / AI</span>
          </a>

          {/* Phase 2: Synthesis */}
          <a
            href="#cockpit"
            onClick={(e) => handleSmoothScroll(e, "cockpit")}
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
              activePhase === 2
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "text-text-secondary hover:text-white hover:bg-surface-secondary"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sprout className="w-3.5 h-3.5 text-cyan-400" />
              <span>02. Synthesis</span>
            </div>
            <span className="text-[9px] font-mono text-text-muted">Canopy</span>
          </a>

          {/* Phase 3: Abundance */}
          <a
            href="#abundance"
            onClick={(e) => handleSmoothScroll(e, "abundance")}
            className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold transition-all ${
              activePhase === 3
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "text-text-secondary hover:text-white hover:bg-surface-secondary"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>03. Abundance</span>
            </div>
            <span className="text-[9px] font-mono text-text-muted">Harvest</span>
          </a>
        </div>
      </div>
    </aside>
  );
}

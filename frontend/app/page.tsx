"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useScroll } from "framer-motion";
import {
  Sprout, Sun, Droplets, Leaf, Scissors, Bug, ShieldCheck,
  TrendingUp, Sparkles, ArrowRight, LayoutDashboard, CheckCircle2,
  Zap, Radar, Activity, Globe, Database, Cpu, FlaskConical,
  Stethoscope, Store, Layers, Play
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import LandingNavbar from "@/components/landing/LandingNavbar";
import CyberBackgroundTriad from "@/components/landing/CyberBackgroundTriad";
import PhaseTelemetryHUD from "@/components/landing/PhaseTelemetryHUD";
import LiveTelemetryCard from "@/components/landing/LiveTelemetryCard";
import PlatformCockpit from "@/components/landing/PlatformCockpit";
import WorkflowSection from "@/components/landing/WorkflowSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user, accessToken } = useAuthStore();
  const isLoggedIn = mounted && !!user && !!accessToken;

  // Scroll Tracking for Phase Telemetry HUD & 3-Stage Background
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-surface-primary text-text-primary selection:bg-emerald-500/30 selection:text-white transition-colors duration-500">
      {/* ── Transformative 3-Stage Background (Genesis -> Synthesis -> Abundance) ── */}
      <CyberBackgroundTriad />

      {/* ── Dynamic Auth-Aware Navigation Header ── */}
      <LandingNavbar />

      {/* ── Interactive Agronomic Phase Telemetry HUD ── */}
      <PhaseTelemetryHUD progress={scrollYProgress} />

      {/* ── Main Content Container ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-28">
        {/* ═══════════════════════════════════════════════════════════════
            PHASE 1: HERO & GENESIS
            ═══════════════════════════════════════════════════════════════ */}
        <section id="genesis" className="text-center space-y-8 py-8 sm:py-14 animate-slide-up relative scroll-mt-28">
          {/* Top glowing badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(0,255,135,0.25)]">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Autonomous Precision Agronomy Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-5xl mx-auto">
            The Intelligent Operating System for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-glow-green">
              Modern Agriculture
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Eliminate guesswork, optimize water, and maximize crop yields.
            Powered by 70 master crops, stage-by-stage continuous irrigation mathematics,
            and zero-cost Gemini AI diagnostics tailored to your exact soil coordinates.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="btn-primary px-8 py-3.5 text-base sm:text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,135,0.4)]"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Open Your Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/projects"
                  className="btn-secondary px-8 py-3.5 text-base sm:text-lg flex items-center gap-2"
                >
                  <span>Manage Projects</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary px-8 py-3.5 text-base sm:text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,135,0.4)]"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Start Free — No Credit Card</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#synthesis"
                  className="btn-secondary px-8 py-3.5 text-base sm:text-lg flex items-center gap-2"
                >
                  <span>Explore Capabilities</span>
                </a>
              </>
            )}
          </div>

          {/* Hero Live Telemetry Simulator Preview Card */}
          <div className="pt-6">
            <LiveTelemetryCard />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CORE ARCHITECTURAL PILLARS (BENTO GRID)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Core Platform Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Four Superpowers of Neon Farming
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1: Soil AI */}
            <div className="glass-card-hover p-6 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50 space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Soil & Nutrient Engine</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Vision AI extracts lab reports instantly. Calculate exact NPK deficits and generate organic & mineral recipes tailored to soil pH.
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-emerald-400">
                <span>Lab OCR Extraction · Zero Deficit</span>
              </div>
            </div>

            {/* Pillar 2: Stage Engine */}
            <div className="glass-card-hover p-6 rounded-3xl flex flex-col justify-between border-border/80 hover:border-cyan-500/50 space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Continuous Crop Timelines</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  70 master crops spanning 420 phenological growth stages. Automated daily ET₀ water math and stage-specific canopy pruning.
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-cyan-400">
                <span>70 Master Crops · ET₀ Evapotranspiration</span>
              </div>
            </div>

            {/* Pillar 3: AI Doctor */}
            <div className="glass-card-hover p-6 rounded-3xl flex flex-col justify-between border-border/80 hover:border-purple-500/50 space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Multimodal AI Doctor</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Zero-cost plant diagnostics. Upload leaf photos or speak symptoms for instant 99.4% accurate disease recognition and organic remedies.
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-purple-400">
                <span>Gemini Multimodal · 1,140 Remedies</span>
              </div>
            </div>

            {/* Pillar 4: Direct Marketplace */}
            <div className="glass-card-hover p-6 rounded-3xl flex flex-col justify-between border-border/80 hover:border-amber-500/50 space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Direct Agro-Marketplace</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Connect straight with wholesale buyers and economic centers in Pettah, Dambulla, Keppetipola and Meegoda with zero broker cuts.
                </p>
              </div>
              <div className="pt-3 border-t border-border/60 text-[11px] font-mono text-amber-400">
                <span>6 Economic Centers · Zero Middlemen</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PHASE 2: INTERACTIVE CAPABILITY COCKPIT (SYNTHESIS)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="synthesis" className="scroll-mt-28">
          <PlatformCockpit />
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            PHASE 3: 3-STEP WORKFLOW & IMPACT (ABUNDANCE)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="abundance" className="scroll-mt-28 space-y-24">
          <WorkflowSection />

          {/* Minimalist High-Impact Bento Stats */}
          <section id="stats" className="glass-card p-8 sm:p-12 rounded-3xl border-emerald-500/30 text-center space-y-8 scroll-mt-24 shadow-[0_0_40px_rgba(0,255,135,0.15)]">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                Platform Impact & Agronomic Scale
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Empowering Modern Growers Worldwide
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
              <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">70</span>
                <p className="text-sm font-bold text-white">Master Crops</p>
                <p className="text-xs text-text-muted">420 growth stages with automated water math</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">99.4%</span>
                <p className="text-sm font-bold text-white">AI Diagnostic Accuracy</p>
                <p className="text-xs text-text-muted">Zero-cost multimodal vision verification</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">35%</span>
                <p className="text-sm font-bold text-white">Average Water Savings</p>
                <p className="text-xs text-text-muted">Real-time solar & evapotranspiration math</p>
              </div>

              <div className="p-5 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
                <span className="text-3xl sm:text-4xl font-black text-purple-400 font-mono">0%</span>
                <p className="text-sm font-bold text-white">Intermediary Broker Cuts</p>
                <p className="text-xs text-text-muted">100% value returned to grower & buyer</p>
              </div>
            </div>
          </section>

          {/* Futuristic High-Voltage Terminal Call To Action */}
          <section className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-400/60 shadow-[0_0_60px_rgba(0,255,135,0.25)] text-center space-y-6 overflow-hidden">
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px]" />

            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM ONLINE · ZERO CLOUD RUNTIME COST
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto">
              Ready to Transform Your Farm with AI Autonomy?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join forward-thinking growers leveraging automated soil calculations, continuous irrigation timelines, and zero-cost Gemini AI plant protection.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="btn-primary px-9 py-3.5 text-base sm:text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,135,0.5)]"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Go to Farm Console</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="btn-primary px-9 py-3.5 text-base sm:text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,135,0.5)]"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Create Free Farm Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="btn-secondary px-9 py-3.5 text-base sm:text-lg flex items-center gap-2"
                  >
                    <span>Sign In</span>
                  </Link>
                </>
              )}
            </div>
          </section>
        </section>
      </main>

      {/* ── Modern Landing Footer ── */}
      <LandingFooter />
    </div>
  );
}

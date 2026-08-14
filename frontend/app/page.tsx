"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sprout, Sun, Droplets, Leaf, Scissors, Bug, ShieldCheck,
  TrendingUp, Sparkles, ArrowRight, LayoutDashboard, CheckCircle2,
  Zap, Radar, Activity, Globe, Database, Cpu
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import LandingNavbar from "@/components/landing/LandingNavbar";
import ScrollDroneCanvas from "@/components/landing/ScrollDroneCanvas";
import InteractiveFarmSimulator from "@/components/landing/InteractiveFarmSimulator";
import CropsLibraryShowcase from "@/components/landing/CropsLibraryShowcase";
import WorkflowSection from "@/components/landing/WorkflowSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { user, accessToken } = useAuthStore();
  const isLoggedIn = mounted && !!user && !!accessToken;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-surface-primary text-text-primary selection:bg-emerald-500/30 selection:text-white transition-colors duration-500">
      {/* ── Scroll-Driven Animated Cyber-Drone & Topographic Background ── */}
      <ScrollDroneCanvas />

      {/* ── Dynamic Auth-Aware Navigation Header ── */}
      <LandingNavbar />

      {/* ── Main Content Container ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-24">
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <section className="text-center space-y-8 py-10 sm:py-16 lg:py-20 animate-slide-up relative">
          {/* Top glowing badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase shadow-[0_0_25px_rgba(0,255,135,0.25)]">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Zero-Cost AI · Precision Agriculture · 70 Crops Library</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-5xl mx-auto">
            Autonomous Farming Intelligence for the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 text-glow-green">
              Modern Grower
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Maximize crop yield, eliminate water wastage, and shield your farm from pests.
            Powered by 70 master crops, stage-by-stage continuous irrigation, precision pruning schedules,
            and zero-cost Gemini AI diagnostics tailored to your exact soil and weather coordinates.
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
                  href="#simulator"
                  className="btn-secondary px-8 py-3.5 text-base sm:text-lg flex items-center gap-2"
                >
                  <span>Explore Live Simulator</span>
                </a>
              </>
            )}
          </div>

          {/* Trust Chips / Feature highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>70 Crops & 221 Cultivars</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Stage-by-Stage Pruning Guides</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Open For Farmers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sinhala, Tamil & English</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FEATURE BENTO GRID SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <section id="features" className="space-y-10 scroll-mt-24">
          <div className="text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Precision Agronomic Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Engineered for Complete Farm Autonomy
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Every tool a commercial or smallholder grower needs to run high-efficiency, data-driven farming cycles.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Stage-by-Stage Smart Irrigation */}
            <div className="glass-card-hover p-8 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Droplets className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Smart Stage-by-Stage Irrigation</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Computes daily water consumption in millimeters and converts to precise liters/acre based on crop canopy growth and live weather forecast, automatically skipping irrigation when rain occurs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>Rain Skipping Algorithm</span>
                <span>420 Stages</span>
              </div>
            </div>

            {/* Feature 2: Canopy Architecture & Pruning */}
            <div className="glass-card-hover p-8 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Scissors className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Precision Pruning & Training</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Scheduled canopy management protocols (pinching, topping, desuckering, thinning, sanitation) triggered at exact developmental days with step-by-step paragraphs and tool sterilization steps.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-amber-400">
                <span>164 Pruning Guides</span>
                <span>Canopy Management</span>
              </div>
            </div>

            {/* Feature 3: AI Vision Plant Doctor */}
            <div className="glass-card-hover p-8 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Bug className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Vision Plant Doctor</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Zero-cost Gemini 2.5 Flash RAG diagnostics. Snap a picture of infected crop foliage to receive verified symptom matching and curative/preventive remedies across Organic, Conventional, and Integrated methods.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-rose-400">
                <span>1,140 Remedies</span>
                <span>Pre-Harvest Safety</span>
              </div>
            </div>

            {/* Feature 4: 70 Crops Agronomic Intelligence */}
            <div className="glass-card-hover p-8 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sprout className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">70 Master Crops Knowledge Base</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Complete botanical coverage across 9 agricultural categories with 221 cultivars, optimal soil pH ranges, companion/incompatible plants, and multi-lingual Sinhala and Tamil names.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>221 Cultivars</span>
                <span>Local Language UI</span>
              </div>
            </div>

            {/* Feature 5: Soil Chemistry & NPK Balancer */}
            <div className="glass-card-hover p-8 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Leaf className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Soil Chemistry & Fertilizer Engine</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Calculates elemental Nitrogen, Phosphorus, Potassium, Calcium, and Magnesium deficits and generates exact fertilizer product application rates in kilograms per acre.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-teal-400">
                <span>1,272 Recipes</span>
                <span>Organic & NPK</span>
              </div>
            </div>

            {/* Feature 6: Direct Marketplace Exchange */}
            <div className="glass-card-hover p-8 rounded-3xl flex flex-col justify-between border-border/80 hover:border-emerald-500/50">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Direct Marketplace & Wholesale Feeds</h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Real-time price trend monitoring across Dambulla, Pettah, Keppetipola, and Jaffna wholesale economic centers. List produce directly for buyers with zero intermediary cuts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-purple-400">
                <span>6 Economic Centers</span>
                <span>Zero Middlemen</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            LIVE INTERACTIVE FARM SIMULATOR
            ═══════════════════════════════════════════════════════════════ */}
        <InteractiveFarmSimulator />

        {/* ═══════════════════════════════════════════════════════════════
            70 CROPS INTERACTIVE SHOWCASE
            ═══════════════════════════════════════════════════════════════ */}
        <CropsLibraryShowcase />

        {/* ═══════════════════════════════════════════════════════════════
            PRECISION WORKFLOW TIMELINE
            ═══════════════════════════════════════════════════════════════ */}
        <WorkflowSection />

        {/* ═══════════════════════════════════════════════════════════════
            PLATFORM IMPACT & STATS
            ═══════════════════════════════════════════════════════════════ */}
        <section id="stats" className="glass-card p-8 sm:p-12 rounded-3xl border-emerald-500/30 text-center space-y-8 scroll-mt-24 shadow-[0_0_40px_rgba(0,255,135,0.15)]">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Autonomous Agronomy Dataset
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              The Largest Open-Access Precision Farming Knowledge Base
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-4">
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">70</span>
              <p className="text-xs font-semibold text-white">Master Crops</p>
              <p className="text-[10px] text-text-muted">9 Categories</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">221</span>
              <p className="text-xs font-semibold text-white">Cultivars</p>
              <p className="text-[10px] text-text-muted">Yield & Duration</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">420</span>
              <p className="text-xs font-semibold text-white">Growth Stages</p>
              <p className="text-[10px] text-text-muted">Continuous Cycles</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">1,272</span>
              <p className="text-xs font-semibold text-white">Fertilizer Plans</p>
              <p className="text-[10px] text-text-muted">Organic & NPK</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">164</span>
              <p className="text-xs font-semibold text-white">Pruning Guides</p>
              <p className="text-[10px] text-text-muted">Canopy Protocols</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 text-glow-green">1,140</span>
              <p className="text-xs font-semibold text-white">Disease Remedies</p>
              <p className="text-[10px] text-text-muted">Verified Dosages</p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            BOTTOM HIGH-VOLTAGE CALL TO ACTION
            ═══════════════════════════════════════════════════════════════ */}
        <section className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border-2 border-emerald-400/60 shadow-[0_0_60px_rgba(0,255,135,0.25)] text-center space-y-6 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-[100px]" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Instant Farm Deployment
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto">
            Ready to Supercharge Your Farm with AI?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join forward-thinking growers leveraging automated water calculators, precision pruning calendars, and zero-cost AI plant protection.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn-primary px-9 py-3.5 text-base sm:text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,135,0.5)]"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="btn-primary px-9 py-3.5 text-base sm:text-lg flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,135,0.5)]"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Create Free Account</span>
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
      </main>

      {/* ── Modern Landing Footer ── */}
      <LandingFooter />
    </div>
  );
}

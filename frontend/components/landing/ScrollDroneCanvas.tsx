"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Bot, Radar, Sparkles, Activity, ShieldCheck, Zap } from "lucide-react";

export default function ScrollDroneCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Calculate dynamic drone vertical position (0% to 92%)
  const droneY = useTransform(smoothProgress, [0, 1], ["2%", "92%"]);
  // Drone subtle sway
  const droneRotate = useTransform(smoothProgress, [0, 0.25, 0.5, 0.75, 1], [0, 4, -4, 3, 0]);
  const laserAngle = useTransform(smoothProgress, [0, 0.3, 0.6, 1], [-25, 15, -10, 0]);
  const laserOpacity = useTransform(smoothProgress, [0, 0.05, 0.95, 1], [0.3, 0.85, 0.85, 0.3]);
  const altitudeReadout = useTransform(smoothProgress, [0, 1], [120, 24]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* ── 1. Cyber Contour Grid & Agricultural Topography Lines ──────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 dark:opacity-30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="neonGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00FF87" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="cyberLineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#00FF87" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
          </linearGradient>
          <pattern id="cropMatrixGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="1.2" fill="#10B981" fillOpacity="0.35" />
            <line x1="0" y1="30" x2="60" y2="30" stroke="#10B981" strokeOpacity="0.06" strokeWidth="0.8" />
            <line x1="30" y1="0" x2="30" y2="60" stroke="#10B981" strokeOpacity="0.06" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* Matrix Grid overlay */}
        <rect width="100%" height="100%" fill="url(#cropMatrixGrid)" />

        {/* Curved Smart Irrigation Pipeline Tracks */}
        <path
          d="M 40 0 C 120 400, 10 900, 80 1400 C 150 1900, 30 2400, 90 3000 C 140 3600, 50 4200, 80 5000"
          fill="none"
          stroke="url(#cyberLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          className="animate-pulse"
        />
        <path
          d="M 96% 0 C 88% 450, 98% 950, 91% 1500 C 85% 2050, 97% 2600, 90% 3200 C 85% 3800, 96% 4400, 92% 5000"
          fill="none"
          stroke="url(#cyberLineGrad)"
          strokeWidth="1.5"
          strokeDasharray="8 6"
        />
      </svg>

      {/* ── 2. Ambient Floating Neon Glow Orbs ───────────────────────── */}
      <div className="absolute top-[10%] left-[-100px] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[150px] animate-float" />
      <div className="absolute top-[35%] right-[-120px] w-[600px] h-[600px] rounded-full bg-green-400/10 blur-[160px] animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[65%] left-[5%] w-[550px] h-[550px] rounded-full bg-teal-500/10 blur-[150px] animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute top-[85%] right-[10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[140px] animate-float" style={{ animationDelay: "1s" }} />

      {/* ── 3. Scroll-Tracking Autonomous Farm Drone with Laser Scan ─── */}
      <motion.div
        style={{ top: droneY, rotate: droneRotate }}
        className="fixed right-4 sm:right-10 lg:right-16 z-30 flex flex-col items-center select-none"
      >
        {/* Drone Body HUD */}
        <div className="relative group flex items-center gap-3">
          {/* Drone Telemetry Pill (Desktop) */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 backdrop-blur-md text-[10px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>DRONE-SCAN-01</span>
            </div>
            <div className="text-slate-400 flex items-center gap-2 mt-0.5">
              <span>AGR-SPECTRUM</span>
              <span className="text-emerald-300">ONLINE</span>
            </div>
          </div>

          {/* Futuristic Drone Vehicle SVG Icon */}
          <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950/90 to-slate-900 border border-emerald-400/50 shadow-[0_0_25px_rgba(0,255,135,0.4)] backdrop-blur-xl">
            {/* Spinning Rotor Blades */}
            <div className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-400/80 border-t-transparent animate-spin" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-400/80 border-t-transparent animate-spin" style={{ animationDirection: "reverse" }} />
            <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-400/80 border-t-transparent animate-spin" style={{ animationDirection: "reverse" }} />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-emerald-400/80 border-t-transparent animate-spin" />

            {/* Drone Core Sensor Eye */}
            <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
              <Radar className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>

            {/* Glowing Thrust Particle Jet */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-gradient-to-b from-emerald-400 to-transparent blur-[2px]" />
          </div>
        </div>

        {/* Downward Scanning Laser Fan */}
        <motion.div
          style={{
            rotate: laserAngle,
            opacity: laserOpacity,
          }}
          className="relative mt-1 origin-top flex flex-col items-center"
        >
          <div className="w-0.5 h-32 bg-gradient-to-b from-emerald-400 via-emerald-400/40 to-transparent" />
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent blur-[1px] -mt-1 shadow-[0_0_12px_#00FF87]" />
        </motion.div>
      </motion.div>

      {/* ── 4. Fiber-Optic Scroll Progress Line on the Left Edge ─────── */}
      <div className="fixed left-4 sm:left-8 top-0 bottom-0 z-20 hidden md:flex flex-col items-center justify-between py-12 pointer-events-none">
        <div className="flex flex-col items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="rotate-90 origin-left translate-y-6">0%</span>
        </div>

        {/* Continuous Track Line with Dynamic Glow Fill */}
        <div className="relative w-1 flex-1 my-8 bg-slate-800/40 rounded-full overflow-hidden border border-emerald-950/60">
          <motion.div
            style={{ scaleY: smoothProgress, transformOrigin: "top" }}
            className="w-full h-full bg-gradient-to-b from-emerald-400 via-green-500 to-teal-400 shadow-[0_0_12px_rgba(0,255,135,0.7)]"
          />
        </div>

        <div className="flex flex-col items-center gap-1 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
          <span className="rotate-90 origin-left translate-y-6">100%</span>
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

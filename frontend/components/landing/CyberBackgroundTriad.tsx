"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import StageOneGenesis from "./illustrations/StageOneGenesis";
import StageTwoSynthesis from "./illustrations/StageTwoSynthesis";
import StageThreeAbundance from "./illustrations/StageThreeAbundance";

export default function CyberBackgroundTriad() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global Page Scroll Tracking
  const { scrollYProgress } = useScroll();

  // Smooth Spring Scroll Interpolation for Butter-smooth Transitions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 26,
    restDelta: 0.001,
  });

  // Stage 1 (Genesis): 0.0 -> 0.35
  const stage1Opacity = useTransform(smoothProgress, [0, 0.20, 0.35], [1, 0.9, 0]);
  const stage1Scale = useTransform(smoothProgress, [0, 0.35], [1, 1.05]);

  // Stage 2 (Synthesis): 0.25 -> 0.70
  const stage2Opacity = useTransform(smoothProgress, [0.24, 0.36, 0.56, 0.70], [0, 1, 1, 0]);
  const stage2Scale = useTransform(smoothProgress, [0.24, 0.46, 0.70], [0.95, 1, 1.04]);

  // Stage 3 (Abundance): 0.60 -> 1.0
  const stage3Opacity = useTransform(smoothProgress, [0.58, 0.72, 1], [0, 1, 1]);
  const stage3Scale = useTransform(smoothProgress, [0.58, 0.85, 1], [0.95, 1, 1]);

  // Ambient Matrix Glow Shift based on scroll
  const glowColor1 = useTransform(
    smoothProgress,
    [0, 0.45, 0.85],
    ["rgba(16,185,129,0.08)", "rgba(56,189,248,0.08)", "rgba(245,158,11,0.09)"]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Dynamic Ambient Color Field ── */}
      <motion.div
        style={{ backgroundColor: glowColor1 }}
        className="absolute inset-0 transition-colors duration-1000"
      />

      {/* ── Subtle Cybernetic Coordinate Grid Overlay ── */}
      <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-25" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="triadGrid" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="1.2" fill="#10B981" fillOpacity="0.5" />
            <line x1="0" y1="40" x2="80" y2="40" stroke="#10B981" strokeOpacity="0.1" strokeWidth="0.8" />
            <line x1="40" y1="0" x2="40" y2="80" stroke="#10B981" strokeOpacity="0.1" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#triadGrid)" />
      </svg>

      {/* ── 3 Transformative Large Illustration Layers ── */}
      {/* STAGE 1: SUBTERRANEAN BIO-NEURAL GENESIS */}
      <motion.div
        style={{ opacity: stage1Opacity, scale: stage1Scale }}
        className="absolute inset-0 w-full h-full will-change-transform opacity-70 dark:opacity-100"
      >
        <StageOneGenesis progress={smoothProgress} />
      </motion.div>

      {/* STAGE 2: AUTONOMOUS PHOTOSYNTHETIC CANOPY & LIDAR MATRIX */}
      <motion.div
        style={{ opacity: stage2Opacity, scale: stage2Scale }}
        className="absolute inset-0 w-full h-full will-change-transform opacity-70 dark:opacity-100"
      >
        <StageTwoSynthesis progress={smoothProgress} />
      </motion.div>

      {/* STAGE 3: PLANETARY BIO-HARVEST & COSMIC EQUILIBRIUM */}
      <motion.div
        style={{ opacity: stage3Opacity, scale: stage3Scale }}
        className="absolute inset-0 w-full h-full will-change-transform opacity-70 dark:opacity-100"
      >
        <StageThreeAbundance progress={smoothProgress} />
      </motion.div>

      {/* ── Vignette Gradients for Impeccable Foreground Readability in both Light & Dark ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-primary/60 via-surface-primary/30 to-surface-primary/80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-30 dark:opacity-75" />
    </div>
  );
}

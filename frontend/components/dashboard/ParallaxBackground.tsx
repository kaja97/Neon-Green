"use client";

import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

/**
 * CropSceneBackground
 * ───────────────────────────────────────────────────────────
 * A living, scroll-driven background that makes the crop appear to
 * grow and flower as the user scrolls down.
 *
 * Layers (fixed, behind all content at z-[-1]):
 *  1. Crop field base image (crop-bg.png)        — slow parallax (0.3x)
 *  2. Neon seeds image (neon-seeds-bg.png)        — faster parallax (0.6x), fades in
 *  3. Drifting pollen / seed particles            — randomized, each on own depth
 *  4. Scroll-driven sky tint overlay              — midnight → dawn → day → harvest gold
 *  5. Soil vignette at bottom                     — depth grounding
 *
 * Honors prefers-reduced-motion: disables parallax + particles,
 * keeps a static base image.
 */
export default function CropSceneBackground() {
  const { scrollYProgress } = useScroll();
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Smooth out the raw scroll value for buttery motion.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax translations for each image layer.
  const fieldY = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
  const seedsY = useTransform(smoothProgress, [0, 1], ["0%", "60%"]);
  // Field image fades as we leave the top; seeds fade in as we descend.
  const fieldOpacity = useTransform(smoothProgress, [0, 0.6], [1, 0.35]);
  const seedsOpacity = useTransform(smoothProgress, [0.2, 0.9], [0, 1]);

  // Scroll-driven sky tint — the "crop matures & flowers" illusion.
  // midnight blue → dawn indigo/violet → daytime teal-green → harvest gold/green
  const skyGradient = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1],
    [
      "linear-gradient(180deg, rgba(10,15,18,0.55) 0%, rgba(10,15,18,0.15) 45%, rgba(10,15,18,0.9) 100%)",
      "linear-gradient(180deg, rgba(26,37,80,0.5) 0%, rgba(60,40,90,0.18) 45%, rgba(10,15,18,0.9) 100%)",
      "linear-gradient(180deg, rgba(15,40,45,0.45) 0%, rgba(20,80,60,0.2) 45%, rgba(10,15,18,0.9) 100%)",
      "linear-gradient(180deg, rgba(50,38,14,0.5) 0%, rgba(80,70,20,0.22) 45%, rgba(10,15,18,0.9) 100%)",
    ]
  );

  // Particle field — memoized so positions stay stable across renders.
  const particles = useMemo(() => {
    if (reduced) return [];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 8,
      depth: 0.15 + Math.random() * 0.6, // parallax depth multiplier
      hue: ["#22c55e", "#f59e0b", "#34d399", "#a3e635"][i % 4],
    }));
  }, [reduced]);

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-surface-primary">
      {/* Layer 1 — Crop field base (slow parallax) */}
      <motion.div
        style={reduced ? undefined : { y: fieldY as MotionValue<string>, opacity: fieldOpacity }}
        className="absolute inset-0 w-full h-[120%]"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/crop-bg.png')" }}
        />
      </motion.div>

      {/* Layer 2 — Neon seeds (faster parallax, fades in) */}
      <motion.div
        style={reduced ? undefined : { y: seedsY as MotionValue<string>, opacity: seedsOpacity }}
        className="absolute inset-0 w-full h-[120%]"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/neon-seeds-bg.png')" }}
        />
      </motion.div>

      {/* Layer 3 — Drifting pollen / seed particles */}
      {!reduced && mounted && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.hue,
                boxShadow: `0 0 ${p.size * 3}px ${p.hue}`,
                opacity: 0.55,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, p.depth * 20 - 10, 0],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Layer 4 — Scroll-driven sky tint overlay */}
      <motion.div
        style={reduced ? undefined : { background: skyGradient as MotionValue<string> }}
        className="absolute inset-0"
      >
        {reduced && (
          <div className="w-full h-full bg-gradient-to-b from-[#0a0f12]/40 via-transparent to-[#0a0f12]" />
        )}
      </motion.div>

      {/* Layer 5 — Soil vignette for depth */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-surface-primary via-surface-primary/60 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-surface-primary/80 to-transparent" />
    </div>
  );
}

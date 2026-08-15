"use client";

import React from "react";
import { MotionValue } from "framer-motion";

interface StageProps {
  progress: MotionValue<number>;
}

export default function StageThreeAbundance({ progress }: StageProps) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden">
      {/* ── Planetary Bio-Harvest & Harmonic Equilibrium Vector Artwork ── */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover scale-105 lg:scale-100 transition-transform duration-700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Radial Gradients */}
          <radialGradient id="solarMandalaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="65%" stopColor="#8B5CF6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="wheatSheafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FEF08A" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="orbitalBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00FF87" stopOpacity="0.1" />
          </linearGradient>

          {/* Filters */}
          <filter id="goldGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="cosmicHarvestGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="20" result="blur1" />
            <feGaussianBlur stdDeviation="40" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── 1. Cosmic Planetary Horizon & Constellation Grids ── */}
        <g opacity="0.45">
          {/* Orbital Horizon Arc */}
          <path
            d="M -200 680 C 300 520, 1140 520, 1640 680"
            stroke="url(#orbitalBeamGrad)"
            strokeWidth="2.5"
          />
          <path
            d="M -200 740 C 300 590, 1140 590, 1640 740"
            stroke="#F59E0B"
            strokeWidth="1.2"
            strokeDasharray="8 12"
            strokeOpacity="0.5"
          />
        </g>

        {/* ── 2. Central Golden-Emerald Cyber-Solar Mandala (The Great Harvest) ── */}
        <g transform="translate(720, 410)" filter="url(#cosmicHarvestGlow)">
          {/* Radiant Solar Background Sphere */}
          <circle cx="0" cy="0" r="180" fill="url(#solarMandalaGlow)" />

          {/* Outer Sacred Geometry Star Ring */}
          <circle
            cx="0"
            cy="0"
            r="150"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeDasharray="24 12 6 12"
            strokeOpacity="0.75"
            className="animate-spin"
            style={{ animationDuration: "50s" }}
          />
          <circle
            cx="0"
            cy="0"
            r="120"
            stroke="#00FF87"
            strokeWidth="2"
            strokeDasharray="16 8"
            strokeOpacity="0.85"
            className="animate-spin"
            style={{ animationDuration: "30s", animationDirection: "reverse" }}
          />
          <circle
            cx="0"
            cy="0"
            r="80"
            stroke="#FEF08A"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            strokeOpacity="0.95"
          />

          {/* Geometric Solar Flares (12 Rays) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2="0"
              y2="-170"
              stroke="url(#wheatSheafGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${angle})`}
            />
          ))}

          {/* Central Radiant Golden Embryo Core */}
          <circle cx="0" cy="0" r="30" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="14" fill="#FEF08A" className="animate-ping" style={{ animationDuration: "2.5s" }} />
          <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
        </g>

        {/* ── 3. Radiant Golden-Emerald Grain Sheaves (Flourishing Wings) ── */}
        <g filter="url(#goldGlow)">
          {/* Left Sheaf Cluster */}
          <g transform="translate(560, 460) rotate(-25)">
            <path
              d="M 0 0 C -40 -80, -90 -140, -140 -190 M 0 0 C -20 -90, -50 -160, -90 -220 M 0 0 C 0 -100, -10 -180, -30 -250"
              stroke="url(#wheatSheafGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Grain Nodes */}
            {[-60, -120, -180].map((y, i) => (
              <g key={i} transform={`translate(${y * 0.4}, ${y})`}>
                <ellipse cx="-8" cy="0" rx="8" ry="4" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1" />
                <ellipse cx="8" cy="0" rx="8" ry="4" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1" />
              </g>
            ))}
          </g>

          {/* Right Sheaf Cluster */}
          <g transform="translate(880, 460) rotate(25)">
            <path
              d="M 0 0 C 40 -80, 90 -140, 140 -190 M 0 0 C 20 -90, 50 -160, 90 -220 M 0 0 C 0 -100, 10 -180, 30 -250"
              stroke="url(#wheatSheafGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Grain Nodes */}
            {[-60, -120, -180].map((y, i) => (
              <g key={i} transform={`translate(${y * -0.4}, ${y})`}>
                <ellipse cx="-8" cy="0" rx="8" ry="4" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1" />
                <ellipse cx="8" cy="0" rx="8" ry="4" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1" />
              </g>
            ))}
          </g>
        </g>

        {/* ── 4. Orbital Agronomy Satellites & Global Constellation Links ── */}
        {/* Orbital Satellite 1 (Left Upper Stratosphere) */}
        <g transform="translate(240, 160)">
          {/* Satellite Body */}
          <rect x="-14" y="-10" width="28" height="20" rx="4" fill="#1E1B4B" stroke="#F59E0B" strokeWidth="1.8" />
          {/* Solar Wing Panels */}
          <rect x="-44" y="-7" width="26" height="14" rx="2" fill="#3B82F6" stroke="#FEF08A" strokeWidth="1" />
          <rect x="18" y="-7" width="26" height="14" rx="2" fill="#3B82F6" stroke="#FEF08A" strokeWidth="1" />
          {/* Downward Constellation Link Beam */}
          <path d="M 0 10 L 480 340" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.75" />
          <circle cx="0" cy="0" r="4" fill="#F59E0B" className="animate-ping" />
        </g>

        {/* Orbital Satellite 2 (Right Upper Stratosphere) */}
        <g transform="translate(1200, 160)">
          {/* Satellite Body */}
          <rect x="-14" y="-10" width="28" height="20" rx="4" fill="#1E1B4B" stroke="#00FF87" strokeWidth="1.8" />
          {/* Solar Wing Panels */}
          <rect x="-44" y="-7" width="26" height="14" rx="2" fill="#10B981" stroke="#38BDF8" strokeWidth="1" />
          <rect x="18" y="-7" width="26" height="14" rx="2" fill="#10B981" stroke="#38BDF8" strokeWidth="1" />
          {/* Downward Constellation Link Beam */}
          <path d="M 0 10 L -480 340" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.75" />
          <circle cx="0" cy="0" r="4" fill="#00FF87" className="animate-ping" />
        </g>

        {/* ── 5. Floating Planetary Abundance HUDs ── */}
        {/* Left Telemetry: Global Bio-Market & Yield */}
        <g transform="translate(180, 310)" opacity="0.9">
          <rect width="220" height="96" rx="16" fill="#171120" fillOpacity="0.85" stroke="#F59E0B" strokeWidth="1.2" />
          <line x1="16" y1="30" x2="204" y2="30" stroke="#F59E0B" strokeOpacity="0.35" />
          <text x="18" y="20" fill="#F59E0B" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            ORBITAL HARVEST YIELD
          </text>
          <text x="18" y="52" fill="#FFFFFF" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            INDEX: +340% YIELD
          </text>
          <text x="18" y="76" fill="#FEF08A" fontSize="11" fontFamily="monospace">
            ZERO MIDDLEMEN · 100% DIRECT
          </text>
        </g>

        {/* Right Telemetry: Planetary Regeneration */}
        <g transform="translate(1040, 310)" opacity="0.9">
          <rect width="220" height="96" rx="16" fill="#064E3B" fillOpacity="0.85" stroke="#00FF87" strokeWidth="1.2" />
          <line x1="16" y1="30" x2="204" y2="30" stroke="#00FF87" strokeOpacity="0.35" />
          <text x="18" y="20" fill="#00FF87" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            PLANETARY EQUILIBRIUM
          </text>
          <text x="18" y="52" fill="#FFFFFF" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            CARBON: -14.2 TONS
          </text>
          <text x="18" y="76" fill="#38BDF8" fontSize="11" fontFamily="monospace">
            REGENERATIVE: SUSTAINABLE
          </text>
        </g>

        {/* Bottom Abundance Status Bar */}
        <g transform="translate(550, 810)" opacity="0.85">
          <rect width="340" height="36" rx="18" fill="#171120" fillOpacity="0.85" stroke="#F59E0B" strokeWidth="1" />
          <circle cx="18" cy="18" r="4.5" fill="#F59E0B" className="animate-pulse" />
          <text x="34" y="23" fill="#FEF08A" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            ALTITUDE: ORBITAL · HARVEST HARMONY ACTIVE
          </text>
        </g>
      </svg>
    </div>
  );
}

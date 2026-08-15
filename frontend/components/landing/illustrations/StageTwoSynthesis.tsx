"use client";

import React from "react";
import { MotionValue } from "framer-motion";

interface StageProps {
  progress: MotionValue<number>;
}

export default function StageTwoSynthesis({ progress }: StageProps) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden">
      {/* ── Autonomous Canopy & Aerial LiDAR Matrix Vector Artwork ── */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover scale-105 lg:scale-100 transition-transform duration-700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="canopyCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#10B981" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#0284C7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="laserBeamGrad1" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="laserBeamGrad2" x1="100%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#00FF87" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="trunkGrad" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#064E3B" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00FF87" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="leafVeinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
          </linearGradient>

          {/* Filters */}
          <filter id="neonGlow2" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="laserScanFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="18" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── 1. Atmospheric Photosynthetic Grid & Horizon ── */}
        <g opacity="0.35">
          <line x1="0" y1="480" x2="1440" y2="480" stroke="#10B981" strokeWidth="1" strokeDasharray="10 10" />
          <path
            d="M 0 520 C 400 480, 1000 540, 1440 500"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
        </g>

        {/* ── 2. Massive Bioluminescent Canopy & Branching Tree of Life ── */}
        <g filter="url(#neonGlow2)">
          {/* Main Trunk / Plant Stem Column */}
          <path
            d="M 720 900 L 720 480 C 720 420, 700 370, 720 320"
            stroke="url(#trunkGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Major Canopy Arcs / Branches */}
          <path
            d="M 720 480 C 640 430, 520 410, 400 430 C 310 445, 230 480, 160 520"
            stroke="url(#trunkGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 720 480 C 800 430, 920 410, 1040 430 C 1130 445, 1210 480, 1280 520"
            stroke="url(#trunkGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 720 400 C 650 340, 560 300, 460 310 C 370 320, 290 350, 210 390"
            stroke="url(#trunkGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 720 400 C 790 340, 880 300, 980 310 C 1070 320, 1150 350, 1230 390"
            stroke="url(#trunkGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 720 320 C 680 250, 610 200, 530 190 M 720 320 C 760 250, 830 200, 910 190"
            stroke="url(#trunkGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Bioluminescent Leaf Vein Clusters */}
          {[
            { cx: 400, cy: 430, rot: -20 },
            { cx: 1040, cy: 430, rot: 20 },
            { cx: 460, cy: 310, rot: -35 },
            { cx: 980, cy: 310, rot: 35 },
            { cx: 530, cy: 190, rot: -45 },
            { cx: 910, cy: 190, rot: 45 },
            { cx: 720, cy: 260, rot: 0 },
            { cx: 280, cy: 410, rot: -15 },
            { cx: 1160, cy: 410, rot: 15 },
          ].map((leaf, i) => (
            <g key={i} transform={`translate(${leaf.cx}, ${leaf.cy}) rotate(${leaf.rot})`}>
              {/* Leaf Blade Outer Contour */}
              <path
                d="M 0 0 C 35 -25, 75 -20, 95 0 C 75 20, 35 25, 0 0 Z"
                fill="#10B981"
                fillOpacity="0.25"
                stroke="url(#leafVeinGrad)"
                strokeWidth="1.8"
              />
              {/* Internal Neural Veins */}
              <line x1="0" y1="0" x2="90" y2="0" stroke="#00FF87" strokeWidth="1.4" />
              <line x1="30" y1="0" x2="50" y2="-12" stroke="#38BDF8" strokeWidth="1" />
              <line x1="30" y1="0" x2="50" y2="12" stroke="#38BDF8" strokeWidth="1" />
              <line x1="60" y1="0" x2="75" y2="-8" stroke="#38BDF8" strokeWidth="0.8" />
              <line x1="60" y1="0" x2="75" y2="8" stroke="#38BDF8" strokeWidth="0.8" />
              {/* Glowing Chlorophyll Node */}
              <circle cx="95" cy="0" r="3.5" fill="#00FF87" className="animate-ping" style={{ animationDuration: "3s" }} />
              <circle cx="95" cy="0" r="2.5" fill="#FFFFFF" />
            </g>
          ))}
        </g>

        {/* ── 3. Central Canopy Photosynthesis Halo ── */}
        <g transform="translate(720, 330)" filter="url(#canopyCoreGlow)">
          <circle cx="0" cy="0" r="140" fill="url(#canopyCoreGlow)" />
          <circle
            cx="0"
            cy="0"
            r="100"
            stroke="#00FF87"
            strokeWidth="1.5"
            strokeDasharray="12 6"
            strokeOpacity="0.7"
            className="animate-spin"
            style={{ animationDuration: "35s" }}
          />
          <circle
            cx="0"
            cy="0"
            r="70"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeDasharray="4 8"
            strokeOpacity="0.85"
            className="animate-spin"
            style={{ animationDuration: "20s", animationDirection: "reverse" }}
          />
          {/* Core Blossom */}
          <polygon
            points="0,-25 18,-8 11,18 -11,18 -18,-8"
            fill="#00FF87"
            fillOpacity="0.6"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <circle cx="0" cy="0" r="6" fill="#FFFFFF" className="animate-pulse" />
        </g>

        {/* ── 4. Autonomous Aerial AI Drones with LiDAR Laser Cones ── */}
        {/* DRONE 01 (Left Aerial Sector) */}
        <g transform="translate(320, 130)" filter="url(#laserScanFilter)">
          {/* Downward LiDAR Scan Cone */}
          <polygon points="0,25 -160,340 160,340" fill="url(#laserBeamGrad1)" opacity="0.45" />
          <line x1="0" y1="25" x2="-160" y2="340" stroke="#00FF87" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="0" y1="25" x2="160" y2="340" stroke="#00FF87" strokeWidth="1.5" strokeOpacity="0.8" />
          <ellipse cx="0" cy="340" rx="160" ry="14" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.7" fill="none" />

          {/* Drone Body HUD Frame */}
          <rect x="-35" y="-18" width="70" height="36" rx="10" fill="#022c22" stroke="#00FF87" strokeWidth="1.8" />
          {/* Rotors */}
          <circle cx="-42" cy="-18" r="9" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          <circle cx="42" cy="-18" r="9" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          <circle cx="-42" cy="18" r="9" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          <circle cx="42" cy="18" r="9" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          {/* Drone Core Lens */}
          <circle cx="0" cy="0" r="7" fill="#00FF87" className="animate-pulse" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>

        {/* DRONE 02 (Right Aerial Sector) */}
        <g transform="translate(1120, 130)" filter="url(#laserScanFilter)">
          {/* Downward LiDAR Scan Cone */}
          <polygon points="0,25 -160,340 160,340" fill="url(#laserBeamGrad2)" opacity="0.45" />
          <line x1="0" y1="25" x2="-160" y2="340" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.8" />
          <line x1="0" y1="25" x2="160" y2="340" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.8" />
          <ellipse cx="0" cy="340" rx="160" ry="14" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 4" strokeOpacity="0.7" fill="none" />

          {/* Drone Body HUD Frame */}
          <rect x="-35" y="-18" width="70" height="36" rx="10" fill="#082f49" stroke="#38BDF8" strokeWidth="1.8" />
          {/* Rotors */}
          <circle cx="-42" cy="-18" r="9" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          <circle cx="42" cy="-18" r="9" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          <circle cx="-42" cy="18" r="9" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          <circle cx="42" cy="18" r="9" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="4 4" className="animate-spin" />
          {/* Drone Core Lens */}
          <circle cx="0" cy="0" r="7" fill="#38BDF8" className="animate-pulse" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>

        {/* ── 5. Floating Aerial Agronomic Telemetry HUDs ── */}
        {/* Left Telemetry: NDVI & Chlorophyll */}
        <g transform="translate(190, 80)" opacity="0.9">
          <rect width="210" height="90" rx="16" fill="#022c22" fillOpacity="0.85" stroke="#00FF87" strokeWidth="1.2" />
          <line x1="16" y1="28" x2="194" y2="28" stroke="#00FF87" strokeOpacity="0.35" />
          <text x="18" y="20" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            SPECTRUM NDVI: 0.88
          </text>
          <text x="18" y="50" fill="#FFFFFF" fontSize="13" fontFamily="sans-serif" fontWeight="bold">
            CANOPY COVER: 94.2%
          </text>
          <text x="18" y="72" fill="#38BDF8" fontSize="11" fontFamily="monospace">
            CHLOROPHYLL: PEAK VITAL
          </text>
        </g>

        {/* Right Telemetry: Precision Micro-Irrigation */}
        <g transform="translate(1040, 80)" opacity="0.9">
          <rect width="210" height="90" rx="16" fill="#082f49" fillOpacity="0.85" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="16" y1="28" x2="194" y2="28" stroke="#38BDF8" strokeOpacity="0.35" />
          <text x="18" y="20" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            MICRO-SPRAY RATE
          </text>
          <text x="18" y="50" fill="#FFFFFF" fontSize="13" fontFamily="sans-serif" fontWeight="bold">
            DOSAGE: 12.4 L/MIN
          </text>
          <text x="18" y="72" fill="#00FF87" fontSize="11" fontFamily="monospace">
            VPD: 1.12 kPa (BALANCED)
          </text>
        </g>

        {/* Bottom Canopy Status Bar */}
        <g transform="translate(570, 810)" opacity="0.85">
          <rect width="300" height="36" rx="18" fill="#022c22" fillOpacity="0.85" stroke="#00FF87" strokeWidth="1" />
          <circle cx="18" cy="18" r="4.5" fill="#38BDF8" className="animate-pulse" />
          <text x="34" y="23" fill="#00FF87" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            ALTITUDE: +15.0M · AERIAL CANOPY ACTIVE
          </text>
        </g>
      </svg>
    </div>
  );
}

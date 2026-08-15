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

          <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#059669" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#022C22" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="leafGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0D9488" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#022C22" stopOpacity="0.2" />
          </linearGradient>

          {/* Filters */}
          <filter id="synthGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── 1. Aerial LiDAR Autonomous Scanning Fan ── */}
        <g opacity="0.45">
          {/* Triangular Scanning Mesh Projection */}
          <polygon points="720,40 160,800 1280,800" fill="url(#laserBeamGrad1)" fillOpacity="0.08" />

          {/* Scanning Laser Beams */}
          <line x1="720" y1="40" x2="320" y2="780" stroke="#00FF87" strokeWidth="1.6" strokeDasharray="6 4" strokeOpacity="0.7" />
          <line x1="720" y1="40" x2="520" y2="820" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="720" y1="40" x2="720" y2="860" stroke="#00FF87" strokeWidth="2" strokeOpacity="0.85" />
          <line x1="720" y1="40" x2="920" y2="820" stroke="#38BDF8" strokeWidth="1.2" strokeOpacity="0.6" />
          <line x1="720" y1="40" x2="1120" y2="780" stroke="#00FF87" strokeWidth="1.6" strokeDasharray="6 4" strokeOpacity="0.7" />

          {/* LiDAR Sweep Arcs */}
          <path d="M 400 500 A 400 400 0 0 1 1040 500" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="8 6" strokeOpacity="0.5" />
          <path d="M 280 650 A 600 600 0 0 1 1160 650" stroke="#00FF87" strokeWidth="1.5" strokeDasharray="12 8" strokeOpacity="0.4" />
        </g>

        {/* ── 2. Cybernetic Bio-Tree & Photosynthetic Foliage ── */}
        <g id="treeCanopy" filter="url(#synthGlow)">
          {/* Main Central Vascular Trunk */}
          <path
            d="M 720 850 C 720 720, 715 620, 720 480 C 720 420, 720 360, 720 300"
            stroke="url(#trunkGrad)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Primary Canopy Arcs (Left Branches) */}
          <path
            d="M 720 540 C 640 500, 540 470, 440 450 C 350 435, 270 420, 190 390"
            stroke="url(#trunkGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 720 430 C 630 380, 520 330, 420 300 C 330 270, 240 250, 160 210"
            stroke="url(#trunkGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Primary Canopy Arcs (Right Branches) */}
          <path
            d="M 720 540 C 800 500, 900 470, 1000 450 C 1090 435, 1170 420, 1250 390"
            stroke="url(#trunkGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 720 430 C 810 380, 920 330, 1020 300 C 1110 270, 1200 250, 1280 210"
            stroke="url(#trunkGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* ── Geometric Silicon Leaves (Left Side) ── */}
          <path d="M 440 450 C 430 390, 470 350, 520 370 C 570 390, 560 460, 440 450 Z" fill="url(#leafGrad1)" stroke="#00FF87" strokeWidth="1.5" />
          <path d="M 350 435 C 330 380, 360 340, 410 355 C 450 370, 440 430, 350 435 Z" fill="url(#leafGrad1)" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M 420 300 C 390 240, 430 200, 490 215 C 540 230, 530 300, 420 300 Z" fill="url(#leafGrad1)" stroke="#00FF87" strokeWidth="1.5" />
          <path d="M 270 260 C 240 210, 270 170, 320 185 C 370 200, 360 260, 270 260 Z" fill="url(#leafGrad1)" stroke="#34D399" strokeWidth="1.5" />

          {/* ── Geometric Silicon Leaves (Right Side) ── */}
          <path d="M 1000 450 C 1010 390, 970 350, 920 370 C 870 390, 880 460, 1000 450 Z" fill="url(#leafGrad2)" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M 1090 435 C 1110 380, 1080 340, 1030 355 C 990 370, 1000 430, 1090 435 Z" fill="url(#leafGrad2)" stroke="#00FF87" strokeWidth="1.5" />
          <path d="M 1020 300 C 1050 240, 1010 200, 950 215 C 900 230, 910 300, 1020 300 Z" fill="url(#leafGrad2)" stroke="#38BDF8" strokeWidth="1.5" />
          <path d="M 1170 260 C 1200 210, 1170 170, 1120 185 C 1070 200, 1080 260, 1170 260 Z" fill="url(#leafGrad2)" stroke="#34D399" strokeWidth="1.5" />
        </g>

        {/* ── 3. High-Precision Micro-Irrigation & Aeroponic Misting Rings ── */}
        <g>
          {/* Left Misting Emitter Node */}
          <g transform="translate(440, 450)">
            <circle cx="0" cy="0" r="16" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: "12s" }} />
            <circle cx="0" cy="0" r="5" fill="#38BDF8" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="0" cy="0" r="4" fill="#00FF87" />
          </g>

          {/* Right Misting Emitter Node */}
          <g transform="translate(1000, 450)">
            <circle cx="0" cy="0" r="16" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: "12s" }} />
            <circle cx="0" cy="0" r="5" fill="#38BDF8" className="animate-ping" style={{ animationDuration: "3s" }} />
            <circle cx="0" cy="0" r="4" fill="#00FF87" />
          </g>

          {/* Central Apex Apex Light Node */}
          <g transform="translate(720, 260)">
            <circle cx="0" cy="0" r="28" stroke="#00FF87" strokeWidth="1.6" strokeDasharray="6 4" className="animate-spin" style={{ animationDuration: "18s" }} />
            <circle cx="0" cy="0" r="12" fill="#00FF87" fillOpacity="0.4" />
            <circle cx="0" cy="0" r="6" fill="#FFFFFF" className="animate-pulse" />
          </g>
        </g>

        {/* ── 4. Floating Holographic Aerial Telemetry HUD ── */}
        {/* Left Telemetry Cluster: Evapotranspiration & Microclimate */}
        <g transform="translate(140, 490)" opacity="0.88">
          <rect width="230" height="110" rx="20" fill="#021c24" fillOpacity="0.88" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="16" y1="34" x2="214" y2="34" stroke="#38BDF8" strokeOpacity="0.35" />
          <text x="18" y="24" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            MICROCLIMATE HUD
          </text>
          <text x="18" y="58" fill="#FFFFFF" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            ET₀: 4.8 MM/DAY
          </text>
          <text x="18" y="84" fill="#00FF87" fontSize="11" fontFamily="monospace">
            VPD: 1.15 KPA (PERFECT)
          </text>
          <path d="M 230 50 L 440 450" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
        </g>

        {/* Right Telemetry Cluster: Photosynthesis Efficiency */}
        <g transform="translate(1070, 490)" opacity="0.88">
          <rect width="230" height="110" rx="20" fill="#021c24" fillOpacity="0.88" stroke="#00FF87" strokeWidth="1.2" />
          <line x1="16" y1="34" x2="214" y2="34" stroke="#00FF87" strokeOpacity="0.35" />
          <text x="18" y="24" fill="#00FF87" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            CHLOROPHYLL TELEMETRY
          </text>
          <text x="18" y="58" fill="#FFFFFF" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            PAR: 1,420 μMOL/M²/S
          </text>
          <text x="18" y="84" fill="#38BDF8" fontSize="11" fontFamily="monospace">
            CANOPY INDEX: 3.82 LAI
          </text>
          <path d="M 0 50 L -70 450" stroke="#00FF87" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

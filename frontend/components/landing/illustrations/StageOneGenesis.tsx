"use client";

import React from "react";
import { MotionValue } from "framer-motion";

interface StageProps {
  progress: MotionValue<number>;
}

export default function StageOneGenesis({ progress }: StageProps) {
  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none overflow-hidden">
      {/* ── Subterranean Bio-Neural Genesis Vector Artwork ── */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover scale-105 lg:scale-100 transition-transform duration-700"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Radial Gradients */}
          <radialGradient id="seedCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.9" />
            <stop offset="35%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#059669" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="rootNexusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#065F46" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="rootBranchGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00FF87" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#064E3B" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="rootBranchGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#059669" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#022C22" stopOpacity="0.05" />
          </linearGradient>

          {/* Filters */}
          <filter id="neonGlow1" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="heavyGlow1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── 1. Geometric Topographic Soil Strata & Geological Waveform ── */}
        <g opacity="0.35">
          <path
            d="M 0 540 C 320 500, 600 580, 880 520 C 1120 470, 1300 540, 1440 510 L 1440 900 L 0 900 Z"
            fill="#022c22"
            fillOpacity="0.5"
          />
          <path
            d="M 0 620 C 380 590, 680 670, 1020 610 C 1240 570, 1380 630, 1440 610 L 1440 900 L 0 900 Z"
            fill="#011b15"
            fillOpacity="0.75"
          />
          {/* Subtle horizontal strata scanning lines */}
          <line
            x1="0"
            y1="540"
            x2="1440"
            y2="510"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            strokeOpacity="0.35"
          />
          <line
            x1="0"
            y1="620"
            x2="1440"
            y2="610"
            stroke="#00FF87"
            strokeWidth="0.8"
            strokeDasharray="6 12"
            strokeOpacity="0.25"
          />
        </g>

        {/* ── 2. Intricate Mycorrhizal Neural Root Network ── */}
        <g filter="url(#neonGlow1)">
          {/* Main Primary Taproots */}
          <path
            d="M 720 450 C 720 560, 680 630, 610 740 C 550 820, 470 880, 380 930"
            stroke="url(#rootBranchGrad1)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M 720 450 C 720 560, 760 630, 830 740 C 900 825, 980 885, 1080 930"
            stroke="url(#rootBranchGrad2)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />
          <path
            d="M 720 450 C 720 580, 710 690, 720 840 C 725 900, 730 960, 720 1020"
            stroke="url(#rootBranchGrad1)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Secondary Lateral Capillary Roots */}
          <path
            d="M 660 560 C 570 600, 490 640, 410 660 C 340 680, 260 690, 180 680"
            stroke="url(#rootBranchGrad1)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 780 570 C 870 610, 960 640, 1040 655 C 1120 670, 1210 675, 1290 665"
            stroke="url(#rootBranchGrad2)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 630 690 C 560 740, 500 790, 430 840 C 370 880, 290 900, 220 920"
            stroke="url(#rootBranchGrad1)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 810 700 C 890 750, 950 800, 1030 845 C 1100 885, 1180 900, 1240 915"
            stroke="url(#rootBranchGrad2)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Micro-Mycelium Neural Fibers */}
          <path
            d="M 410 660 C 370 620, 310 610, 250 630 M 410 660 C 380 700, 330 730, 280 740"
            stroke="#34D399"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
          <path
            d="M 1040 655 C 1090 620, 1150 610, 1210 630 M 1040 655 C 1080 695, 1130 725, 1190 735"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeOpacity="0.7"
          />
          <path
            d="M 610 740 C 540 750, 480 770, 420 760 M 830 740 C 900 750, 960 770, 1020 760"
            stroke="#10B981"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
        </g>

        {/* ── 3. Bio-Synapse Nodes & Nutrient Flow Transmitters ── */}
        <g>
          {[
            { cx: 660, cy: 560, r: 4.5, c: "#00FF87" },
            { cx: 780, cy: 570, r: 4.5, c: "#38BDF8" },
            { cx: 610, cy: 740, r: 5.5, c: "#00FF87" },
            { cx: 830, cy: 740, r: 5.5, c: "#34D399" },
            { cx: 410, cy: 660, r: 4, c: "#38BDF8" },
            { cx: 1040, cy: 655, r: 4, c: "#00FF87" },
            { cx: 430, cy: 840, r: 3.5, c: "#00FF87" },
            { cx: 1030, cy: 845, r: 3.5, c: "#34D399" },
            { cx: 720, cy: 840, r: 5, c: "#00FF87" },
          ].map((node, i) => (
            <g key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.25}s` }}>
              <circle cx={node.cx} cy={node.cy} r={node.r * 2.8} fill={node.c} fillOpacity="0.2" />
              <circle cx={node.cx} cy={node.cy} r={node.r} fill={node.c} />
              <circle cx={node.cx} cy={node.cy} r={node.r * 0.45} fill="#FFFFFF" />
            </g>
          ))}
        </g>

        {/* ── 4. Central Quantum Bio-Seed Core (The Nexus) ── */}
        <g id="seedCore" filter="url(#heavyGlow1)">
          {/* Ambient Outer Aura */}
          <circle cx="720" cy="420" r="150" fill="url(#seedCoreGlow)" />

          {/* Concentric Holographic Calibration Rings */}
          <circle
            cx="720"
            cy="420"
            r="120"
            stroke="#10B981"
            strokeWidth="1.4"
            strokeDasharray="8 10"
            strokeOpacity="0.65"
            className="animate-spin"
            style={{ animationDuration: "40s" }}
          />
          <circle
            cx="720"
            cy="420"
            r="90"
            stroke="#38BDF8"
            strokeWidth="1.8"
            strokeDasharray="16 8 4 8"
            strokeOpacity="0.8"
            className="animate-spin"
            style={{ animationDuration: "25s", animationDirection: "reverse" }}
          />
          <circle
            cx="720"
            cy="420"
            r="65"
            stroke="#00FF87"
            strokeWidth="2.2"
            strokeDasharray="6 4"
            strokeOpacity="0.95"
          />

          {/* Geometric Bio-Seed Shell */}
          <path
            d="M 720 330 C 770 370, 790 425, 770 480 C 750 525, 720 550, 720 550 C 720 550, 690 525, 670 480 C 650 425, 670 370, 720 330 Z"
            fill="url(#rootNexusGlow)"
            stroke="#00FF87"
            strokeWidth="2.8"
          />

          {/* Inner Embryonic Core Crystal */}
          <path
            d="M 720 360 C 750 395, 760 435, 745 465 C 735 490, 720 505, 720 505 C 720 505, 705 490, 695 465 C 680 435, 690 395, 720 360 Z"
            fill="#00FF87"
            fillOpacity="0.45"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />

          {/* Core Pulsing Point */}
          <circle cx="720" cy="425" r="10" fill="#FFFFFF" className="animate-ping" style={{ animationDuration: "2.2s" }} />
          <circle cx="720" cy="425" r="7" fill="#00FF87" />
          <circle cx="720" cy="425" r="3" fill="#FFFFFF" />
        </g>

        {/* ── 5. Holographic Subterranean HUD Telemetry Widgets ── */}
        {/* Left Telemetry Cluster: N-P-K Ion Balance */}
        <g transform="translate(180, 290)" opacity="0.85">
          <rect width="220" height="106" rx="18" fill="#022c22" fillOpacity="0.88" stroke="#10B981" strokeWidth="1.2" />
          <line x1="16" y1="34" x2="204" y2="34" stroke="#10B981" strokeOpacity="0.35" />
          <text x="18" y="24" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            SOIL ION MATRIX
          </text>
          <text x="18" y="58" fill="#FFFFFF" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            NPK: 140 · 45 · 210
          </text>
          <text x="18" y="84" fill="#38BDF8" fontSize="11" fontFamily="monospace">
            BIO-ACTIVITY: 98.4%
          </text>
          {/* Target Pointer Line to Root */}
          <path d="M 220 50 L 410 660" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
        </g>

        {/* Right Telemetry Cluster: Soil Moisture & pH */}
        <g transform="translate(1040, 290)" opacity="0.85">
          <rect width="220" height="106" rx="18" fill="#022c22" fillOpacity="0.88" stroke="#38BDF8" strokeWidth="1.2" />
          <line x1="16" y1="34" x2="204" y2="34" stroke="#38BDF8" strokeOpacity="0.35" />
          <text x="18" y="24" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1.5">
            AQUIFER TELEMETRY
          </text>
          <text x="18" y="58" fill="#FFFFFF" fontSize="14" fontFamily="sans-serif" fontWeight="bold">
            MOISTURE: 68.2%
          </text>
          <text x="18" y="84" fill="#00FF87" fontSize="11" fontFamily="monospace">
            pH: 6.4 (OPTIMAL)
          </text>
          {/* Target Pointer Line to Root */}
          <path d="M 0 50 L -180 655" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.4" />
        </g>

        {/* Bottom Sub-Telemetry Tag */}
        <g transform="translate(580, 810)" opacity="0.85">
          <rect width="280" height="36" rx="18" fill="#022c22" fillOpacity="0.88" stroke="#10B981" strokeWidth="1" />
          <circle cx="18" cy="18" r="4.5" fill="#00FF87" className="animate-pulse" />
          <text x="34" y="23" fill="#34D399" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
            DEPTH: -1.20M · ROOT SYNC ACTIVE
          </text>
        </g>
      </svg>
    </div>
  );
}

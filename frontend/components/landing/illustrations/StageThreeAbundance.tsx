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
        </defs>

        {/* ── 1. Cosmic Planetary Horizon & Orbital Geo-Rings ── */}
        <g opacity="0.4">
          {/* Concentric Celestial Orbit Rings */}
          <circle cx="720" cy="500" r="420" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="16 8" strokeOpacity="0.6" />
          <circle cx="720" cy="500" r="340" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="12 12" strokeOpacity="0.5" />
          <circle cx="720" cy="500" r="260" stroke="#00FF87" strokeWidth="1.8" strokeDasharray="6 6" strokeOpacity="0.7" />

          {/* Tangent Supply Chain Node Lines */}
          <line x1="200" y1="350" x2="1240" y2="650" stroke="url(#orbitalBeamGrad)" strokeWidth="1.4" strokeDasharray="8 6" />
          <line x1="200" y1="650" x2="1240" y2="350" stroke="url(#orbitalBeamGrad)" strokeWidth="1.4" strokeDasharray="8 6" />
        </g>

        {/* ── 2. Golden Solar Harvest Mandala (Crops in Bloom & Full Yield) ── */}
        <g id="harvestMandala" filter="url(#goldGlow)">
          {/* Central Solar Core */}
          <circle cx="720" cy="500" r="180" fill="url(#solarMandalaGlow)" />

          {/* Radiating High-Yield Wheat Ears / Crop Spikes (12 Rays) */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => (
            <g key={i} transform={`rotate(${deg}, 720, 500)`}>
              {/* Central Stem */}
              <line x1="720" y1="500" x2="720" y2="280" stroke="url(#wheatSheafGrad)" strokeWidth="3" strokeLinecap="round" />
              {/* Golden Grains */}
              <circle cx="712" cy="330" r="7" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
              <circle cx="728" cy="310" r="7" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
              <circle cx="712" cy="290" r="6" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
              <circle cx="728" cy="270" r="6" fill="#F59E0B" stroke="#FEF08A" strokeWidth="1.5" />
              <circle cx="720" cy="250" r="8" fill="#FEF08A" />
            </g>
          ))}

          {/* Central Quantum Harmonic Ring */}
          <circle cx="720" cy="500" r="70" fill="#030712" stroke="#F59E0B" strokeWidth="3" />
          <circle cx="720" cy="500" r="50" fill="#F59E0B" fillOpacity="0.3" stroke="#FEF08A" strokeWidth="1.5" />
          <circle cx="720" cy="500" r="14" fill="#FEF08A" className="animate-ping" style={{ animationDuration: "2.8s" }} />
          <circle cx="720" cy="500" r="10" fill="#F59E0B" />
        </g>

        {/* ── 3. Autonomous Agro-Drones & Autonomous Fleet Navigation ── */}
        {/* Left Agro-Drone */}
        <g transform="translate(340, 260)" className="animate-pulse">
          {/* Drone Chassis */}
          <rect x="-24" y="-12" width="48" height="24" rx="8" fill="#0f172a" stroke="#F59E0B" strokeWidth="1.6" />
          <circle cx="-26" cy="-14" r="7" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="26" cy="-14" r="7" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="-26" cy="14" r="7" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="26" cy="14" r="7" stroke="#FEF08A" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* Downward Scan Light */}
          <polygon points="0,12 -80,240 80,240" fill="#F59E0B" fillOpacity="0.08" />
          <line x1="0" y1="12" x2="0" y2="240" stroke="#F59E0B" strokeWidth="1.4" strokeDasharray="4 4" strokeOpacity="0.6" />
        </g>

        {/* Right Agro-Drone */}
        <g transform="translate(1100, 260)" className="animate-pulse" style={{ animationDelay: "1s" }}>
          {/* Drone Chassis */}
          <rect x="-24" y="-12" width="48" height="24" rx="8" fill="#0f172a" stroke="#00FF87" strokeWidth="1.6" />
          <circle cx="-26" cy="-14" r="7" stroke="#00FF87" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="26" cy="-14" r="7" stroke="#00FF87" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="-26" cy="14" r="7" stroke="#00FF87" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="26" cy="14" r="7" stroke="#00FF87" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* Downward Scan Light */}
          <polygon points="0,12 -80,240 80,240" fill="#00FF87" fillOpacity="0.08" />
          <line x1="0" y1="12" x2="0" y2="240" stroke="#00FF87" strokeWidth="1.4" strokeDasharray="4 4" strokeOpacity="0.6" />
        </g>

        {/* ── 4. Distributed Regional Economic Hub Beacons ── */}
        {/* Hub 1: Pettah */}
        <g transform="translate(240, 720)">
          <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#FEF08A" className="animate-ping" />
          <text x="22" y="5" fill="#FEF08A" fontSize="11" fontFamily="monospace" fontWeight="bold">
            PETTAH HUB · +4.2%
          </text>
        </g>

        {/* Hub 2: Dambulla */}
        <g transform="translate(1080, 720)">
          <circle cx="0" cy="0" r="14" fill="#0f172a" stroke="#00FF87" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="5" fill="#00FF87" className="animate-ping" />
          <text x="-160" y="5" fill="#00FF87" fontSize="11" fontFamily="monospace" fontWeight="bold">
            DAMBULLA HUB · +2.1%
          </text>
        </g>
      </svg>
    </div>
  );
}

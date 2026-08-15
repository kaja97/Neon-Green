"use client";

import { Sprout } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-surface-primary">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right green blob */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-green-500/10 blur-[120px] animate-float" />
        {/* Bottom-left emerald blob */}
        <div
          className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-emerald-600/10 blur-[100px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        {/* Center gold accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-neon-gold/5 blur-[80px] animate-float"
          style={{ animationDelay: "3s" }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Clickable Logo pointing to Landing Page */}
      <Link href="/" className="relative z-10 flex items-center gap-3 mb-8 animate-fade-in group hover:opacity-90 transition-opacity">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform">
          <Sprout className="w-8 h-8 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
            AgriFarm <span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </h1>
          <p className="text-xs font-bold text-text-secondary tracking-widest uppercase">
            Intelligent Growth
          </p>
        </div>
      </Link>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        {children}
      </div>

      {/* Footer */}
      <p className="relative z-10 mt-8 text-xs text-text-muted animate-fade-in font-medium">
        © 2026 AgriFarm AI · Zero-Cost AI for Modern Agriculture
      </p>
    </div>
  );
}

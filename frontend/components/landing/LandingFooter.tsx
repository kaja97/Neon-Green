"use client";

import Link from "next/link";
import { Sprout, Heart, ArrowUp, Github, Shield, Globe } from "lucide-react";

export default function LandingFooter() {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative border-t border-border/80 bg-surface-primary/90 backdrop-blur-xl mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" onClick={scrollToTop} className="flex items-center gap-3 group inline-flex">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-all">
                <Sprout className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black text-white">
                AgriFarm <span className="text-emerald-400 text-glow-green">AI</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm">
              Empowering farmers with autonomous precision agriculture, 70-crop agronomic intelligence, stage-by-stage irrigation, precision pruning, and zero-cost AI plant protection.
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>FastAPI · Next.js · Supabase · Redis · Vercel</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Navigation</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">Core Features</a></li>
              <li><a href="#simulator" className="hover:text-emerald-400 transition-colors">Live Crop Simulator</a></li>
              <li><a href="#crops" className="hover:text-emerald-400 transition-colors">70 Crops Library</a></li>
              <li><a href="#workflow" className="hover:text-emerald-400 transition-colors">Precision Pipeline</a></li>
              <li><a href="#stats" className="hover:text-emerald-400 transition-colors">Platform Impact</a></li>
            </ul>
          </div>

          {/* App Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform Apps</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Farmer Dashboard</Link></li>
              <li><Link href="/projects" className="hover:text-emerald-400 transition-colors">Project Planner</Link></li>
              <li><Link href="/market" className="hover:text-emerald-400 transition-colors">Marketplace Exchange</Link></li>
              <li><Link href="/community" className="hover:text-emerald-400 transition-colors">Farmer Community</Link></li>
              <li><Link href="/chat" className="hover:text-emerald-400 transition-colors">AI Farm Assistant</Link></li>
            </ul>
          </div>

          {/* Languages & Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Localization</h4>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-emerald-400" /> English (Global)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-emerald-400" /> සිංහල (Sinhala)</li>
              <li className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-emerald-400" /> தமிழ் (Tamil)</li>
              <li className="pt-2 text-[11px] text-text-muted">Zero-Cost AI Architecture for Farmers.</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} AgriFarm AI · Built for sustainable, autonomous agriculture.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary text-text-secondary hover:text-white hover:bg-surface-tertiary transition-all"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </div>
    </footer>
  );
}

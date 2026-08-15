"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sprout, LayoutDashboard, FolderOpen, Store, MessageCircle,
  LogIn, ArrowRight, Sparkles, Menu, X, Layers, Cpu, Activity
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import ThemeToggle from "@/components/layout/ThemeToggle";
import ProfileDropdown from "@/components/layout/ProfileDropdown";

export default function LandingNavbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, accessToken } = useAuthStore();

  const isLoggedIn = mounted && !!user && !!accessToken;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (typeof document !== "undefined") {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-surface-primary/85 backdrop-blur-2xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link
          href="/"
          onClick={scrollToTop}
          className="flex items-center gap-3 group select-none"
          title="AgriFarm AI Home"
        >
          <div className="relative p-2 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-[0_0_20px_rgba(0,255,135,0.4)] group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,255,135,0.7)] transition-all duration-300">
            <Sprout className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              AgriFarm
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 text-glow-green">
                AI
              </span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">
              Precision Agriculture
            </span>
          </div>
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <nav className="hidden lg:flex items-center gap-1 bg-surface-secondary/70 border border-border/80 backdrop-blur-xl px-4 py-1.5 rounded-full shadow-inner">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-emerald-400 hover:bg-surface-tertiary rounded-full transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                href="/projects"
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-emerald-400 hover:bg-surface-tertiary rounded-full transition-all flex items-center gap-1.5"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Projects
              </Link>
              <Link
                href="/market"
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-emerald-400 hover:bg-surface-tertiary rounded-full transition-all flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                Marketplace
              </Link>
              <Link
                href="/chat"
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-emerald-400 hover:bg-surface-tertiary rounded-full transition-all flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                AI Assistant
              </Link>
            </>
          ) : (
            <>
              <a
                href="#features"
                onClick={(e) => handleSmoothScroll(e, "features")}
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-surface-tertiary rounded-full transition-all"
              >
                Architecture
              </a>
              <a
                href="#cockpit"
                onClick={(e) => handleSmoothScroll(e, "cockpit")}
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-surface-tertiary rounded-full transition-all flex items-center gap-1.5"
              >
                <span>Capability Cockpit</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/30 animate-pulse">
                  LIVE
                </span>
              </a>
              <a
                href="#workflow"
                onClick={(e) => handleSmoothScroll(e, "workflow")}
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-surface-tertiary rounded-full transition-all"
              >
                Pipeline
              </a>
              <a
                href="#stats"
                onClick={(e) => handleSmoothScroll(e, "stats")}
                className="px-3.5 py-1.5 text-xs font-bold text-text-secondary hover:text-white hover:bg-surface-tertiary rounded-full transition-all"
              >
                Impact
              </a>
            </>
          )}
        </nav>

        {/* ── Actions & Auth Status ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {isLoggedIn ? (
            /* Logged-In User Actions */
            <div className="flex items-center gap-2.5 animate-fade-in">
              <Link
                href="/dashboard"
                className="btn-primary px-4 sm:px-5 py-2 text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.4)]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Farm</span> Console
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <ProfileDropdown variant="landing" />
            </div>
          ) : (
            /* Logged-Out Guest Actions */
            <div className="flex items-center gap-2 sm:gap-2.5 animate-fade-in">
              <Link
                href="/login"
                className="hidden sm:flex px-4 py-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-white hover:bg-surface-tertiary rounded-xl transition-all items-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary px-3.5 sm:px-5 py-2 text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,255,135,0.35)]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-surface-secondary border border-border text-text-secondary hover:text-white transition-all"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Dropdown ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 bg-surface-primary/95 border-b border-border/80 backdrop-blur-2xl animate-slide-down space-y-3">
          <div className="space-y-1">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  Farm Dashboard
                </Link>
                <Link
                  href="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  Projects
                </Link>
                <Link
                  href="/market"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  Marketplace Exchange
                </Link>
                <Link
                  href="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  AI Farm Assistant
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#features"
                  onClick={(e) => handleSmoothScroll(e, "features")}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Core Architecture
                </a>
                <a
                  href="#cockpit"
                  onClick={(e) => handleSmoothScroll(e, "cockpit")}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Capability Cockpit
                </a>
                <a
                  href="#workflow"
                  onClick={(e) => handleSmoothScroll(e, "workflow")}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <Activity className="w-4 h-4 text-purple-400" />
                  Precision Pipeline
                </a>
                <a
                  href="#stats"
                  onClick={(e) => handleSmoothScroll(e, "stats")}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Platform Impact
                </a>
                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-bold text-text-secondary bg-surface-secondary rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full btn-primary py-2.5 text-center text-xs font-bold rounded-xl"
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

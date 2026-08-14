"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LayoutDashboard,
  FolderOpen,
  Store,
  MessageCircle,
  LogOut,
  ChevronDown,
  ShieldAlert,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";

interface ProfileDropdownProps {
  variant?: "topbar" | "landing";
}

export default function ProfileDropdown({ variant = "topbar" }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "ME";

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      await logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    } catch (e) {
      console.error("Logout error:", e);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoggingOut}
        className={`group flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl transition-all duration-300 ${
          variant === "landing"
            ? "bg-surface-secondary/80 border border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            : "bg-surface-secondary/70 border border-primary/30 hover:border-primary hover:shadow-[0_0_15px_rgba(34,197,94,0.25)]"
        } ${isOpen ? "ring-2 ring-primary/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : ""}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Account: ${user.name || user.email}`}
      >
        {/* Avatar with Online Badge */}
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-surface-primary rounded-full shadow-[0_0_6px_#10b981]" />
        </div>

        {/* User First Name / Email snippet on larger screens */}
        <span className="hidden sm:inline text-xs font-bold text-text-primary max-w-[100px] truncate">
          {user.name ? user.name.split(" ")[0] : user.email.split("@")[0]}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-transform duration-300 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-72 origin-top-right rounded-3xl bg-surface-primary/95 border border-border/80 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.5)] z-50 p-2 animate-scale-in">
          {/* User Header Section */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-surface-secondary to-surface-tertiary/60 border border-border/60 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-sm shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-text-primary truncate">
                  {user.name || "AgriFarm User"}
                </p>
                <p className="text-xs text-text-muted truncate font-mono">{user.email}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-2.5 h-2.5" />
                    {user.role || "Farmer"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-0.5">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-surface-secondary group-hover:bg-primary/15 text-text-muted group-hover:text-primary transition-colors">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Profile & Settings</span>
                <span className="text-[10px] text-text-muted">Account info, farm data, language</span>
              </div>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-surface-secondary group-hover:bg-emerald-500/15 text-text-muted group-hover:text-emerald-400 transition-colors">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Farm Dashboard</span>
                <span className="text-[10px] text-text-muted">Overview, alerts, weather telemetry</span>
              </div>
            </Link>

            <Link
              href="/projects"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-surface-secondary group-hover:bg-blue-500/15 text-text-muted group-hover:text-blue-400 transition-colors">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">My Projects</span>
                <span className="text-[10px] text-text-muted">70 crop cycles, soil tests & logs</span>
              </div>
            </Link>

            <Link
              href="/market"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-surface-secondary group-hover:bg-amber-500/15 text-text-muted group-hover:text-amber-400 transition-colors">
                <Store className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Marketplace</span>
                <span className="text-[10px] text-text-muted">Wholesale pricing, buyer orders</span>
              </div>
            </Link>

            <Link
              href="/chat"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors group"
            >
              <div className="p-1.5 rounded-lg bg-surface-secondary group-hover:bg-purple-500/15 text-text-muted group-hover:text-purple-400 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">AI Agronomist</span>
                <span className="text-[10px] text-text-muted">Ask questions about your farm</span>
              </div>
            </Link>

            {user.role === "admin" && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neon-purple hover:bg-neon-purple/10 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-neon-purple/10 text-neon-purple">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Admin Console</span>
                  <span className="text-[10px] text-text-muted">System management</span>
                </div>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-border/80" />

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-red-500/[0.08] hover:bg-red-500/[0.16] border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                ) : (
                  <LogOut className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">
                  {isLoggingOut ? "Signing Out..." : "Logout Account"}
                </p>
                <p className="text-[10px] text-red-400/70">Reset active login session</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20">
              ESC
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

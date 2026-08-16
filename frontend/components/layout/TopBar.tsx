"use client";

import { Bell, WifiOff, ShieldAlert, Sprout, FolderOpen, Store, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useOffline } from "@/lib/hooks/useOffline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";
import ThemeToggle from "@/components/layout/ThemeToggle";
import ProfileDropdown from "@/components/layout/ProfileDropdown";

export default function TopBar() {
  const isOffline = useOffline();
  const { user } = useAuthStore();

  const { data: countData } = useQuery({
    queryKey: ["notification_count"],
    queryFn: async () => {
      const res = await api.get("/notifications", {
        params: { unread_only: true },
      });
      return { count: res.data.data?.length || 0 };
    },
    enabled: !isOffline && !!user,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  const unreadCount = countData?.count || 0;

  return (
    <header className="sticky top-0 z-40 bg-surface-primary/85 backdrop-blur-xl border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 shadow-[0_0_15px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-black text-lg text-slate-900 dark:text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
              AgriFarm <span className="text-emerald-600 dark:text-emerald-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-secondary/70 border border-border p-1 rounded-full text-xs font-bold">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="px-3.5 py-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/market"
              className="px-3.5 py-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/community"
              className="px-3.5 py-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-tertiary transition-colors"
            >
              Community
            </Link>

          </nav>
        </div>

        {/* Right: Actions, Theme, Alerts, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Offline Banner Indicator */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline Mode</span>
            </div>
          )}

          {/* Admin Indicator */}
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-mono font-bold hover:bg-purple-500/25 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Console</span>
            </Link>
          )}

          {/* Notifications Bell */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile Dropdown */}
          <ProfileDropdown variant="app" />
        </div>
      </div>
    </header>
  );
}

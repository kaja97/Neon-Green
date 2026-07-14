"use client";

import { Bell, User, WifiOff, ShieldAlert, Sprout, FolderOpen } from "lucide-react";
import Link from "next/link";
import { useOffline } from "@/lib/hooks/useOffline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

export default function TopBar() {
  const isOffline = useOffline();
  const { user } = useAuthStore();

  // Fetch unread notification count
  const { data: countData } = useQuery({
    queryKey: ["notification_count"],
    queryFn: async () => {
      const res = await api.get("/notifications", {
        params: { unread_only: true },
      });
      return { count: res.data.data?.length || 0 };
    },
    enabled: !isOffline && !!user,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000,
  });

  const unreadCount = countData?.count || 0;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-primary/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 group-hover:glow-green transition-all">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            AgriFarm
            <span className="text-primary"> AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 text-sm font-semibold text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-surface-tertiary"
          >
            Dashboard
          </Link>
          <Link
            href="/projects"
            className="px-3 py-1.5 text-sm font-semibold text-text-secondary hover:text-white transition-colors rounded-lg hover:bg-surface-tertiary flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Projects
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Offline Indicator */}
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neon-gold/10 border border-neon-gold/20 rounded-full text-neon-gold text-xs font-semibold animate-pulse-glow">
              <WifiOff className="w-3.5 h-3.5" />
              Offline
            </div>
          )}

          {/* Admin Link */}
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-purple/10 border border-neon-purple/20 text-neon-purple rounded-xl text-xs font-bold hover:bg-neon-purple/20 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2.5 rounded-xl text-text-secondary hover:text-white hover:bg-surface-tertiary transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 animate-pulse-glow">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile Avatar */}
          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs hover:border-primary/60 transition-all"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}

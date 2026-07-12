"use client";

import { Bell, UserCircle2, WifiOff, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useOffline } from "@/lib/hooks/useOffline";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

export default function TopBar() {
  const isOffline = useOffline();
  const { user } = useAuthStore();

  // Try to fetch unread notification count, ignore if offline
  const { data: countData } = useQuery({
    queryKey: ["notification_count"],
    queryFn: async () => {
      const res = await api.get("/notifications/count");
      return res.data;
    },
    enabled: !isOffline,
  });

  const unreadCount = countData?.count || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-green-700">
            AgriFarm AI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {isOffline && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-600 text-xs font-semibold shadow-sm">
              <WifiOff className="w-3.5 h-3.5" />
              Offline
            </div>
          )}
          {user?.role === "admin" && (
            <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold hover:bg-purple-200 transition-colors">
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <Link href="/notifications" className="relative p-2 text-slate-500 hover:text-slate-800 transition-colors">
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
            )}
          </Link>
          <Link href="/profile" className="p-1 text-slate-500 hover:text-slate-800 transition-colors">
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

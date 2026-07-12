"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Users, Sprout, Bell, BarChart3, Loader2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load stats.
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 text-sm">System-wide statistics and activity</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Stat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Total Users</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.users.total}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-green-600 font-medium">{stats.users.active} Active</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{stats.users.admins} Admins</span>
          </div>
        </div>

        {/* Projects Stat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Total Projects</h3>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.projects.total}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-green-600 font-medium">{stats.projects.active} Active</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">{stats.projects.harvested} Harvested</span>
          </div>
        </div>

        {/* AI Stat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">AI Usage</h3>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.ai.calls_today}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-slate-500">Calls Today</span>
          </div>
        </div>

        {/* Notifications Stat */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-600">Notifications</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.notifications.total}</p>
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className="text-slate-500">All Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}

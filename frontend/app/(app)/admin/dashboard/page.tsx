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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-red-400">Failed to load stats.</div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.users.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", sub: `${stats.users.active} Active`, sub2: `${stats.users.admins} Admins` },
    { label: "Total Projects", value: stats.projects.total, icon: Sprout, color: "text-green-400", bg: "bg-green-500/10", sub: `${stats.projects.active} Active`, sub2: `${stats.projects.harvested} Harvested` },
    { label: "AI Usage", value: stats.ai.calls_today, icon: BarChart3, color: "text-neon-purple", bg: "bg-purple-500/10", sub: "Calls Today", sub2: null },
    { label: "Notifications", value: stats.notifications.total, icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", sub: "All Time", sub2: null },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
          Platform Overview<span className="text-green-400 text-glow-green">.</span>
        </h1>
        <p className="text-text-muted text-sm mt-1">System-wide statistics and activity</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card-hover rounded-3xl p-6 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-text-secondary">{card.label}</h3>
                <div className={`p-2 rounded-xl ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <span className="text-green-400 font-medium">{card.sub}</span>
                {card.sub2 && (
                  <>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{card.sub2}</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

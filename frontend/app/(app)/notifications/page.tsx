"use client";

import { Bell, CloudRain, AlertTriangle, Bot, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

const getIcon = (type: string) => {
  switch (type) {
    case 'alert': return CloudRain;
    case 'disease': return AlertTriangle;
    case 'ai': return Bot;
    case 'task': return CheckCircle2;
    default: return Bell;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'alert': return { text: "text-blue-400", bg: "bg-blue-500/10" };
    case 'disease': return { text: "text-amber-400", bg: "bg-amber-500/10" };
    case 'ai': return { text: "text-green-400", bg: "bg-green-500/10" };
    case 'task': return { text: "text-emerald-400", bg: "bg-emerald-500/10" };
    default: return { text: "text-text-secondary", bg: "bg-surface-tertiary" };
  }
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications?limit=50");
      return res.data.data;
    }
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification_count"] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification_count"] });
    }
  });

  const unreadCount = notifications?.filter((n: any) => !n.is_read)?.length || 0;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24">
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href="/dashboard"
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Notifications<span className="text-green-400 text-glow-green">.</span>
            </h1>
            <p className="text-text-muted text-sm mt-0.5">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full hover:bg-green-500/20 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n: any, idx) => {
            const Icon = getIcon(n.type);
            const { text, bg } = getColor(n.type);

            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                className={clsx(
                  "flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer animate-slide-up",
                  n.is_read
                    ? "glass-card"
                    : "glass-card-hover border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.08)]"
                )}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className={clsx("p-2.5 rounded-xl shrink-0", bg)}>
                  <Icon className={clsx("w-5 h-5", text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={clsx(
                      "font-semibold text-sm",
                      n.is_read ? "text-text-secondary" : "text-white"
                    )}>
                      {n.title}
                    </h3>
                    {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 shadow-[0_0_8px_#22c55e]" />}
                  </div>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card-hover rounded-3xl p-12 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-float glow-green">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
            <p className="text-text-secondary text-sm">You don&apos;t have any notifications right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}

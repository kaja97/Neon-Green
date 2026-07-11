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
    case 'alert': return { text: "text-blue-500", bg: "bg-blue-50" };
    case 'disease': return { text: "text-amber-500", bg: "bg-amber-50" };
    case 'ai': return { text: "text-green-500", bg: "bg-green-50" };
    case 'task': return { text: "text-emerald-500", bg: "bg-emerald-50" };
    default: return { text: "text-slate-500", bg: "bg-slate-100" };
  }
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications?limit=50");
      return res.data;
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
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-900 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-slate-500 text-sm mt-0.5">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllReadMutation.mutate()}
              className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors bg-green-50 px-3 py-1.5 rounded-full"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : notifications && notifications.length > 0 ? (
          notifications.map((n: any) => {
            const Icon = getIcon(n.type);
            const { text, bg } = getColor(n.type);
            
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markReadMutation.mutate(n.id)}
                className={clsx(
                  "flex items-start gap-4 p-5 rounded-2xl border transition-colors cursor-pointer shadow-sm",
                  n.is_read
                    ? "bg-white border-slate-200"
                    : "bg-green-50/50 border-green-200"
                )}
              >
                <div className={clsx("p-2.5 rounded-xl shrink-0", bg)}>
                  <Icon className={clsx("w-5 h-5", text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={clsx("font-semibold text-sm", n.is_read ? "text-slate-600" : "text-slate-900")}>
                      {n.title}
                    </h3>
                    {!n.is_read && <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">All caught up!</h3>
            <p className="text-slate-500 text-sm">
              You don't have any notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

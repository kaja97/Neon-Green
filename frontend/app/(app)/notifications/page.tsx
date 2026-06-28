import { Bell, CloudRain, AlertTriangle, Bot, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

export default function NotificationsPage() {
  const notifications = [
    {
      id: "1",
      type: "alert",
      title: "Heavy Rain Warning",
      message: "Expected 45mm rainfall tomorrow. Postpone fertilizer application for Tomato Farm.",
      time: "10 min ago",
      read: false,
      icon: CloudRain,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      id: "2",
      type: "disease",
      title: "Blight Risk Detected",
      message: "High humidity (78%) increases early blight risk. Check lower leaves on your tomato plants.",
      time: "1 hour ago",
      read: false,
      icon: AlertTriangle,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: "3",
      type: "ai",
      title: "Weekly AI Summary Ready",
      message: "Your Tomato Farm AI summary for this week is now available. Tap to view insights.",
      time: "3 hours ago",
      read: true,
      icon: Bot,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: "4",
      type: "task",
      title: "Daily Tasks Complete!",
      message: "Great work! You completed all 3 tasks for Chili Pepper today.",
      time: "Yesterday",
      read: true,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
          <p className="text-slate-400 text-sm mt-1">2 unread</p>
        </div>
        <button className="text-sm font-semibold text-primary hover:text-emerald-400 transition-colors">
          Mark all read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div
              key={n.id}
              className={clsx(
                "flex items-start gap-4 p-5 rounded-2xl border transition-colors cursor-pointer",
                n.read
                  ? "bg-card/30 border-slate-800/50 hover:bg-card/60"
                  : "bg-card border-slate-700 hover:border-slate-600 shadow-lg"
              )}
            >
              <div className={clsx("p-2.5 rounded-xl shrink-0", n.bgColor)}>
                <Icon className={clsx("w-5 h-5", n.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={clsx("font-semibold text-sm", n.read ? "text-slate-400" : "text-white")}>
                    {n.title}
                  </h3>
                  {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-slate-600 mt-2">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

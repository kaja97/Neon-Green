"use client";

import { Check, SkipForward, Clock, Droplets, Leaf, Bug, Sprout } from "lucide-react";
import { formatDateFull, formatTime } from "@/lib/utils/dateUtils";

interface Activity {
  id: string;
  activity_type?: string;
  type?: string;
  title: string;
  description?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  priority?: number;
  status: string;
  is_weather_adjusted?: boolean;
  stage?: string;
}

interface ActivityCardProps {
  activity: Activity;
  onDone: (id: string, notes?: string) => void;
  onSkip: (id: string) => void;
  isHighlighted?: boolean;
}

const TYPE_ICONS: Record<string, typeof Droplets> = {
  watering: Droplets,
  irrigation: Droplets,
  fertilizer: Leaf,
  fertilizing: Leaf,
  monitoring: Bug,
  planting: Sprout,
  harvesting: Sprout,
};

const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  watering: { text: "text-blue-400", bg: "bg-blue-500/10" },
  irrigation: { text: "text-blue-400", bg: "bg-blue-500/10" },
  fertilizer: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  fertilizing: { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  monitoring: { text: "text-amber-400", bg: "bg-amber-500/10" },
  planting: { text: "text-green-400", bg: "bg-green-500/10" },
  harvesting: { text: "text-purple-400", bg: "bg-purple-500/10" },
};

export default function ActivityCard({
  activity,
  onDone,
  onSkip,
  isHighlighted = false,
}: ActivityCardProps) {
  const actType = activity.activity_type || activity.type || "monitoring";
  const Icon = TYPE_ICONS[actType] || Clock;
  const colors = TYPE_COLORS[actType] || {
    text: "text-text-secondary",
    bg: "bg-surface-tertiary",
  };

  const isDone = activity.status === "done" || activity.status === "completed";
  const isSkipped = activity.status === "skipped";
  const isPending = !isDone && !isSkipped;

  return (
    <div
      id={`activity-${activity.id}`}
      className={`glass-card p-4 transition-all duration-300 ${
        isHighlighted ? "animate-highlight-flash ring-2 ring-primary" : ""
      } ${isDone ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div className={`p-2.5 rounded-xl ${colors.bg} shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}
            >
              {actType}
            </span>
            {activity.scheduled_time && (
              <span className="text-[10px] font-mono text-text-muted">
                {formatTime(activity.scheduled_time)}
              </span>
            )}
            {activity.is_weather_adjusted && (
              <span className="text-[10px] font-bold text-neon-gold bg-neon-gold/10 px-1.5 py-0.5 rounded">
                ⚡ Weather
              </span>
            )}
          </div>

          <p
            className={`text-sm font-semibold ${isDone ? "line-through text-text-muted" : "text-white"}`}
          >
            {activity.title}
          </p>

          {activity.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">
              {activity.description}
            </p>
          )}

          {activity.scheduled_date && (
            <p className="text-xs text-text-muted mt-1.5 font-mono">
              📅 {formatDateFull(activity.scheduled_date)}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isPending && (
        <div className="flex gap-2 mt-3 ml-12">
          <button
            onClick={() => onDone(activity.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Record Done
          </button>
          <button
            onClick={() => onSkip(activity.id)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-surface-elevated text-text-muted text-xs font-bold hover:text-text-secondary hover:bg-surface-elevated/80 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        </div>
      )}

      {/* Status badges */}
      {isDone && (
        <div className="mt-2 ml-12">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
            ✓ Completed
          </span>
        </div>
      )}
      {isSkipped && (
        <div className="mt-2 ml-12">
          <span className="text-[10px] font-bold text-neon-gold bg-neon-gold/10 px-2 py-1 rounded-lg">
            ↷ Skipped
          </span>
        </div>
      )}
    </div>
  );
}

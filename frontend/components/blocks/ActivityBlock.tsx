"use client";

import { CheckCircle2, Circle, Clock, CalendarDays } from "lucide-react";
import { clsx } from "clsx";
import { useCompleteActivity } from "@/lib/hooks/useActivities";
import { useState } from "react";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityBlock({
  projectId,
  activities,
  upcomingActivities,
}: {
  projectId: string;
  activities: any[];
  upcomingActivities?: any[];
}) {
  const completeMutation = useCompleteActivity(projectId);
  const [optimisticCompleted, setOptimisticCompleted] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleComplete = (id: string, status: string) => {
    if (status !== "completed" && !optimisticCompleted.includes(id)) {
      setOptimisticCompleted(prev => [...prev, id]);
      completeMutation.mutate({ activityId: id, data: {} }, {
        onError: () => {
          setOptimisticCompleted(prev => prev.filter(v => v !== id));
        }
      });
    }
  };

  const total = activities?.length || 0;
  const done = (activities?.filter((t) => t.status === "completed").length || 0) + optimisticCompleted.length;
  const upcoming = upcomingActivities?.length || 0;

  return (
    <div className="glass-card rounded-3xl p-6 min-w-[320px] md:col-span-2 animate-slide-up">
      {/* Today's Tasks */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Today&apos;s Tasks
        </h3>
        <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
          {done}/{total} Done
        </span>
      </div>

      <div className="space-y-4">
        {activities?.length > 0 ? activities.map((task) => {
          const isDone = task.status === "completed" || optimisticCompleted.includes(task.id);

          return (
            <div
              key={task.id}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-tertiary/60 transition-colors cursor-pointer"
              onClick={() => handleComplete(task.id, task.status)}
            >
              <button className="flex-shrink-0" disabled={isDone || completeMutation.isPending}>
                {isDone ? (
                  <CheckCircle2 className="w-7 h-7 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)]" />
                ) : (
                  <Circle className="w-7 h-7 text-text-muted hover:text-green-400 transition-colors" />
                )}
              </button>
              <div className="flex-1">
                <h4
                  className={clsx(
                    "font-medium",
                    isDone ? "text-text-muted line-through" : "text-white"
                  )}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3.5 h-3.5 text-text-muted" />
                  <span className="text-xs text-text-muted">Today</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="text-sm text-text-muted text-center py-4">No tasks scheduled for today.</p>
        )}
      </div>

      {/* Next Up — upcoming tasks with dates */}
      {upcoming > 0 && (
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-violet-400" />
              Next Up
            </h3>
            {upcoming > 2 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20 transition-colors"
              >
                {isExpanded ? "Show Less" : `View All (${upcoming})`}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {(isExpanded ? upcomingActivities : upcomingActivities?.slice(0, 2))?.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-3 rounded-2xl bg-violet-500/[0.06] border border-violet-500/15"
              >
                <Circle className="w-7 h-7 text-violet-400/50 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <CalendarDays className="w-3.5 h-3.5 text-violet-400/70" />
                    <span className="text-xs text-violet-400">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when nothing at all */}
      {total === 0 && upcoming === 0 && (
        <div className="text-center py-6">
          <CalendarDays className="w-10 h-10 text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-muted">No upcoming tasks. You&apos;re all caught up!</p>
        </div>
      )}
    </div>
  );
}

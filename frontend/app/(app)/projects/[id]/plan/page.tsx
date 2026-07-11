"use client";

import { ArrowLeft, CheckCircle2, Circle, SkipForward, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useCompleteActivity, useSkipActivity } from "@/lib/hooks/useActivities";
import { useState } from "react";


export default function PlanPage({ params }: { params: { id: string } }) {
  const completeMutation = useCompleteActivity(params.id);
  const skipMutation = useSkipActivity(params.id);
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, string>>({});

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["all-activities", params.id],
    queryFn: async () => {
      const res = await api.get(`/planner/${params.id}/activities`);
      return res.data;
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data;
    },
  });

  const handleComplete = (id: string, status: string) => {
    if (status !== "completed" && status !== "skipped" && !optimisticStatus[id]) {
      setOptimisticStatus(prev => ({ ...prev, [id]: "completed" }));
      completeMutation.mutate(id, {
        onError: () => {
          setOptimisticStatus(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      });
    }
  };

  const handleSkip = (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "completed" && status !== "skipped" && !optimisticStatus[id]) {
      setOptimisticStatus(prev => ({ ...prev, [id]: "skipped" }));
      skipMutation.mutate({ activityId: id, reason: "Skipped via timeline" }, {
        onError: () => {
          setOptimisticStatus(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Group activities by week
  const groupedActivities: Record<string, any[]> = {};
  
  if (activities) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getWeekNumber = (d: Date) => {
      const date = new Date(d.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    };

    const currentWeek = getWeekNumber(today);

    activities.forEach((task: any) => {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      let groupLabel = "";
      
      if (dueDate.getTime() < today.getTime()) {
        groupLabel = "Past";
      } else if (getWeekNumber(dueDate) === currentWeek && dueDate.getFullYear() === today.getFullYear()) {
        groupLabel = "This Week";
      } else {
        const month = dueDate.toLocaleString('default', { month: 'short' });
        groupLabel = `Week of ${month} ${dueDate.getDate()}`;
      }

      if (!groupedActivities[groupLabel]) {
        groupedActivities[groupLabel] = [];
      }
      groupedActivities[groupLabel].push(task);
    });
  }

  const groupOrder = ["Past", "This Week", ...Object.keys(groupedActivities).filter(k => k !== "Past" && k !== "This Week").sort()];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Plan</h1>
          <p className="text-slate-500 text-sm">Full timeline {dashboard?.project?.plant?.common_name ? `· ${dashboard.project.plant.common_name}` : ""}</p>
        </div>
      </header>

      {error ? (
        <div className="p-8 text-center text-red-500">Failed to load timeline.</div>
      ) : Object.keys(groupedActivities).length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl bg-white">
           <h3 className="text-lg font-semibold mb-2">No activities planned</h3>
           <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
             The AI is still generating your plan, or there are no activities remaining.
           </p>
         </div>
      ) : (
        groupOrder.map((groupLabel) => {
          const tasks = groupedActivities[groupLabel];
          if (!tasks || tasks.length === 0) return null;

          return (
            <section key={groupLabel}>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{groupLabel}</h2>
              <div className="space-y-3">
                {tasks.map((task: any) => {
                  const status = optimisticStatus[task.id] || task.status;
                  const isDone = status === "completed";
                  const isSkipped = status === "skipped";
                  
                  let typeIcon = "📅";
                  if (task.activity_type === "irrigation") typeIcon = "💧";
                  if (task.activity_type === "fertilizer") typeIcon = "🧪";
                  if (task.activity_type === "disease_check") typeIcon = "🔍";

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleComplete(task.id, status)}
                      className={clsx(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer shadow-sm",
                        isDone && "bg-slate-100 border-slate-200",
                        !isDone && !isSkipped && "bg-white border-slate-200 hover:border-green-300 hover:shadow-md",
                        isSkipped && "bg-red-50 border-red-200 opacity-60"
                      )}
                    >
                      <span className="text-xl w-8 text-center">{typeIcon}</span>
                      <div className="flex-1">
                        <h3 className={clsx(
                          "font-medium",
                          (isDone || isSkipped) ? "text-slate-500 line-through" : "text-slate-800"
                        )}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {isSkipped && <span className="text-xs text-red-500 font-medium ml-2">Skipped</span>}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isDone && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        {(!isDone && !isSkipped) && (
                          <div className="flex gap-2">
                            <button className="p-1.5 bg-green-100 rounded-lg text-green-700 hover:bg-green-200 transition-colors" title="Complete">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button onClick={(e) => handleSkip(task.id, status, e)} className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors" title="Skip">
                              <SkipForward className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {isSkipped && <SkipForward className="w-6 h-6 text-red-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )
        })
      )}
    </div>
  );
}

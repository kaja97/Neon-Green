"use client";

import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useCompleteActivity } from "@/lib/hooks/useActivities";
import { useState } from "react";

export default function ActivityBlock({ projectId, activities }: { projectId: string, activities: any[] }) {
  const completeMutation = useCompleteActivity(projectId);
  const [optimisticCompleted, setOptimisticCompleted] = useState<string[]>([]);

  const handleComplete = (id: string, status: string) => {
    if (status !== "completed" && !optimisticCompleted.includes(id)) {
      setOptimisticCompleted(prev => [...prev, id]);
      completeMutation.mutate(id, {
        onError: () => {
          setOptimisticCompleted(prev => prev.filter(v => v !== id));
        }
      });
    }
  };

  const total = activities?.length || 0;
  const done = (activities?.filter((t) => t.status === "completed").length || 0) + optimisticCompleted.length;

  return (
    <div className="bg-white border rounded-3xl p-6 min-w-[320px] md:col-span-2 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          Today's Tasks
        </h3>
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">
          {done}/{total} Done
        </span>
      </div>

      <div className="space-y-4">
        {activities?.length > 0 ? activities.map((task) => {
          const isDone = task.status === "completed" || optimisticCompleted.includes(task.id);
          
          return (
            <div
              key={task.id}
              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => handleComplete(task.id, task.status)}
            >
              <button className="flex-shrink-0" disabled={isDone || completeMutation.isPending}>
                {isDone ? (
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                ) : (
                  <Circle className="w-7 h-7 text-slate-300 hover:text-green-500 transition-colors" />
                )}
              </button>
              <div className="flex-1">
                <h4
                  className={clsx(
                    "font-medium",
                    isDone ? "text-slate-400 line-through" : "text-slate-700"
                  )}
                >
                  {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500">Today</span>
                </div>
              </div>
            </div>
          )
        }) : (
          <p className="text-sm text-slate-500 text-center py-4">No tasks scheduled for today.</p>
        )}
      </div>
    </div>
  );
}

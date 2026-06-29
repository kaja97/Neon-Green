"use client";

import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  status: string;
  due_date: string;
}

export default function ActivityBlock({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [optimisticCompleted, setOptimisticCompleted] = useState<string[]>([]);

  const { data: activities, isLoading, error } = useQuery<Activity[]>({
    queryKey: ["activities", projectId, "today"],
    queryFn: async () => {
      const res = await api.get(`/planner/${projectId}/today`);
      return res.data;
    },
    enabled: !!projectId && projectId !== "1" && projectId !== "2" && projectId !== "3", // Ignore mock IDs for now
  });

  const completeMutation = useMutation({
    mutationFn: async (activityId: string) => {
      await api.patch(`/planner/activities/${activityId}/complete`, { notes: "Completed via dashboard" });
    },
    onMutate: (activityId) => {
      setOptimisticCompleted((prev) => [...prev, activityId]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", projectId, "today"] });
    },
    onError: (err, activityId) => {
      setOptimisticCompleted((prev) => prev.filter((id) => id !== activityId));
    },
  });

  const handleComplete = (id: string) => {
    if (!optimisticCompleted.includes(id)) {
      completeMutation.mutate(id);
    }
  };

  // Fallback to mock data if no activities or if it's a mock project ID
  const displayActivities = activities && activities.length > 0 ? activities.map(a => ({
    id: a.id,
    title: a.title,
    type: a.activity_type,
    status: optimisticCompleted.includes(a.id) ? "done" : a.status,
    time: a.due_date
  })) : [
    { id: "mock-1", title: "Water plants (180L)", type: "irrigation", status: "done", time: "06:00 AM" },
    { id: "mock-2", title: "Apply Potassium", type: "fertilizer", status: "pending", time: "04:30 PM" },
    { id: "mock-3", title: "Check for Blight", type: "disease", status: "pending", time: "Anytime" },
  ];

  const total = displayActivities.length;
  const done = displayActivities.filter((t) => t.status === "done").length;

  return (
    <div className="bg-card border border-slate-800 rounded-3xl p-6 min-w-[320px] md:col-span-2 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          Today's Tasks
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </h3>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
          {done}/{total} Done
        </span>
      </div>

      <div className="space-y-4">
        {displayActivities.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors cursor-pointer"
            onClick={() => handleComplete(task.id)}
          >
            <button className="flex-shrink-0" disabled={task.status === "done"}>
              {task.status === "done" ? (
                <CheckCircle2 className="w-7 h-7 text-primary" />
              ) : (
                <Circle className="w-7 h-7 text-slate-600 hover:text-primary transition-colors" />
              )}
            </button>
            <div className="flex-1">
              <h4
                className={clsx(
                  "font-medium",
                  task.status === "done" ? "text-slate-500 line-through" : "text-slate-200"
                )}
              >
                {task.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">{task.time}</span>
              </div>
            </div>
          </div>
        ))}
        {error && <p className="text-red-400 text-sm">Failed to load tasks</p>}
      </div>
    </div>
  );
}

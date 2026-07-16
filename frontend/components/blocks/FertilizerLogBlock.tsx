"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { FlaskConical, Plus, Loader2 } from "lucide-react";

interface FertilizerEntry {
  id: string;
  title: string;
  due_date: string;
  status: string;
  completed_at?: string;
}

export default function FertilizerLogBlock({ projectId }: { projectId: string }) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["all-activities", projectId],
    queryFn: async () => {
      const res = await api.get(`/planner/${projectId}/activities`);
      return res.data.data;
    },
  });

  const fertilizerActivities = (activities || [])
    .filter((a: any) => a.activity_type === "fertilizer")
    .sort((a: any, b: any) => {
      // Completed first (by completed_at desc), then pending (by due_date asc)
      if (a.status === "completed" && b.status !== "completed") return -1;
      if (a.status !== "completed" && b.status === "completed") return 1;
      return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
    });

  const lastApplied = fertilizerActivities.find((a: any) => a.status === "completed");
  const pendingCount = fertilizerActivities.filter((a: any) => a.status === "pending").length;

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">Fertilizer Log</h3>
        </div>
        <Link
          href={`/projects/${projectId}/fertilizer`}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg hover:bg-green-500/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Log
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : lastApplied ? (
        <div className="space-y-3">
          <div className="flex items-start justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
            <div>
              <p className="text-sm font-medium text-white">{lastApplied.title}</p>
              <p className="text-xs text-text-muted mt-0.5">
                Applied: {new Date(lastApplied.completed_at || lastApplied.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-500/20 text-green-400">
              Done
            </span>
          </div>

          {pendingCount > 0 && (
            <p className="text-xs text-text-muted">
              {pendingCount} fertilizer {pendingCount === 1 ? "task" : "tasks"} pending
            </p>
          )}
        </div>
      ) : fertilizerActivities.length === 0 ? (
        <p className="text-sm text-text-muted">No fertilizer applications logged yet.</p>
      ) : (
        <p className="text-sm text-text-muted">No completed applications yet.</p>
      )}
    </div>
  );
}

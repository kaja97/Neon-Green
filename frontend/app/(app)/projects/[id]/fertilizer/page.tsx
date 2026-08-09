"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  FlaskConical,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  Sparkles,
  Info,
  Calendar
} from "lucide-react";
import { clsx } from "clsx";
import Modal from "@/components/ui/Modal";

export default function FertilizerLogPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  
  // Modal states
  const [completingTask, setCompletingTask] = useState<any | null>(null);
  const [actualFertilizer, setActualFertilizer] = useState("");
  const [notes, setNotes] = useState("");
  const [detailTask, setDetailTask] = useState<any | null>(null);

  // Queries
  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data.data;
    }
  });

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["all-activities", params.id],
    queryFn: async () => {
      const res = await api.get(`/planner/${params.id}/activities`);
      return res.data.data;
    }
  });

  // Mutations
  const completeMutation = useMutation({
    mutationFn: async ({ activityId, actualFertilizer, notes }: { activityId: string; actualFertilizer?: string; notes?: string }) => {
      const payload: any = { notes };
      if (actualFertilizer) payload.actual_fertilizer_kg = parseFloat(actualFertilizer);
      return api.patch(`/planner/activities/${activityId}/complete`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-activities", params.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      setCompletingTask(null);
    }
  });

  const resetMutation = useMutation({
    mutationFn: async (activityId: string) => {
      return api.post(`/planner/activities/${activityId}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-activities", params.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      if (detailTask) setDetailTask(null);
    }
  });

  const fertilizerActivities = (activities || [])
    .filter((a: any) => a.activity_type === "fertilizer");

  const pendingTasks = fertilizerActivities.filter((a: any) => a.status === "pending");
  const completedTasks = fertilizerActivities.filter((a: any) => a.status === "completed");

  // Sum of total actual fertilizer applied
  const totalAppliedKg = completedTasks.reduce((sum: number, task: any) => {
    return sum + (task.actual_fertilizer_kg || task.required_fertilizer_kg || 0);
  }, 0);

  const handleCompleteClick = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletingTask(task);
    setActualFertilizer(task.required_fertilizer_kg?.toString() || "");
    setNotes(task.notes || "");
  };

  const confirmComplete = () => {
    if (!completingTask) return;
    completeMutation.mutate({
      activityId: completingTask.id,
      actualFertilizer,
      notes
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen text-white">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Fertilizer Log<span className="text-green-400 text-glow-green">.</span></h1>
          <p className="text-text-muted text-sm">Track crop nutrition and recommendations</p>
        </div>
      </header>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 bg-slate-950/20 relative overflow-hidden">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Total Applied</p>
          <p className="text-2xl font-black text-white mt-1">{totalAppliedKg.toFixed(1)} kg</p>
          <p className="text-[11px] text-text-muted mt-0.5">Across all stages</p>
        </div>
        <div className="glass-card p-5 bg-slate-950/20 relative overflow-hidden">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Pending Appls</p>
          <p className="text-2xl font-black text-amber-400 mt-1">{pendingTasks.length}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Needs action</p>
        </div>
        <div className="glass-card p-5 bg-slate-950/20 relative overflow-hidden">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Growth Stage</p>
          <p className="text-2xl font-black text-green-400 mt-1 truncate capitalize">
            {dashboard?.current_stage?.stage_name || "Active"}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">Day {dashboard?.farming_circle?.current_day || 0}</p>
        </div>
      </div>

      {/* Current Stage Recommendation & Soil Status */}
      <section className="glass-card border-green-500/20 p-5 bg-slate-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20" />
        <div className="flex items-center gap-2 text-green-400 mb-3 relative z-10">
          <Sparkles className="w-5 h-5 text-glow-green" />
          <h3 className="font-bold text-base">Stage Nutrition & Soil Profile</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {/* Stage Rec */}
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <h4 className="font-bold text-white text-sm">Stage: {dashboard?.current_stage?.stage_name || "Active"}</h4>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              For conventional crops, apply split NPK doses. For organic projects, integrate high-quality compost or fish emulsion around the root zone.
            </p>
            {dashboard?.current_stage?.watch_for && (
              <p className="text-xs text-amber-300 font-medium mt-2">
                ⚠️ Watch out for: {dashboard.current_stage.watch_for}
              </p>
            )}
          </div>

          {/* Soil Status & Required Amount */}
          <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
            <h4 className="font-bold text-white text-sm mb-3">Soil Deficiencies & Required Application</h4>
            {dashboard?.soil_status ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Nitrogen (N):</span>
                  <span className={clsx("font-semibold capitalize", dashboard.soil_status.nitrogen_status?.includes("low") ? "text-red-400" : "text-green-400")}>
                    {dashboard.soil_status.nitrogen_status?.replace("level_", "") || "Optimal"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Phosphorus (P):</span>
                  <span className={clsx("font-semibold capitalize", dashboard.soil_status.phosphorus_status?.includes("low") ? "text-red-400" : "text-green-400")}>
                    {dashboard.soil_status.phosphorus_status?.replace("level_", "") || "Optimal"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Potassium (K):</span>
                  <span className={clsx("font-semibold capitalize", dashboard.soil_status.potassium_status?.includes("low") ? "text-red-400" : "text-green-400")}>
                    {dashboard.soil_status.potassium_status?.replace("level_", "") || "Optimal"}
                  </span>
                </div>
                
                {pendingTasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-amber-300 font-semibold mb-1">Target Application Amounts:</p>
                    <ul className="space-y-1">
                      {pendingTasks.map((pt: any) => (
                        <li key={pt.id} className="text-sm text-slate-300 flex justify-between">
                           <span className="truncate max-w-[150px]">{pt.title}</span>
                           <span className="font-bold text-white">{pt.required_fertilizer_kg ? `${pt.required_fertilizer_kg} kg` : "Variable"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic">No recent soil tests found. Add a soil test to view NPK gaps.</p>
            )}
          </div>
        </div>
      </section>

      {/* Pending logs section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Pending Applications</h2>
        {isLoading ? (
          <div className="text-center py-6"><Loader2 className="w-6 h-6 animate-spin text-green-400 mx-auto" /></div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center p-6 glass-card bg-slate-950/25 border-slate-900">
            <p className="text-sm text-text-secondary">No pending fertilizer applications. You are all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task: any) => (
              <div
                key={task.id}
                onClick={() => setDetailTask(task)}
                className="flex items-center justify-between p-4 glass-card-hover bg-slate-950/25 border-white/5 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧪</span>
                    <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">{task.title}</h3>
                  </div>
                  <p className="text-xs text-text-muted mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </p>
                </div>
                <button
                  onClick={(e) => handleCompleteClick(task, e)}
                  className="bg-green-500/10 border border-green-500/20 hover:bg-green-500/25 text-green-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm"
                >
                  Log Work
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Application History section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Application History Logs</h2>
        {isLoading ? (
          <div className="text-center py-6"><Loader2 className="w-6 h-6 animate-spin text-green-400 mx-auto" /></div>
        ) : completedTasks.length === 0 ? (
          <div className="text-center p-6 glass-card bg-slate-950/25 border-slate-900">
            <p className="text-sm text-text-secondary">No fertilizer applications logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedTasks.map((task: any) => (
              <div
                key={task.id}
                onClick={() => setDetailTask(task)}
                className="flex items-center justify-between p-4 glass-card bg-slate-900/10 border-white/5 opacity-80 cursor-pointer hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <h3 className="font-semibold text-white line-through decoration-slate-600">{task.title}</h3>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Applied: {new Date(task.completed_at || task.due_date).toLocaleDateString()}
                    {task.actual_fertilizer_kg && ` · Used ${task.actual_fertilizer_kg} kg`}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); resetMutation.mutate(task.id); }}
                  disabled={resetMutation.isPending}
                  className="p-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 rounded-lg text-slate-400 hover:text-white transition-all"
                  title="Reset to pending"
                >
                  {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Complete Log Modal */}
      <Modal isOpen={!!completingTask} onClose={() => setCompletingTask(null)} title="Log Fertilizer Application">
        {completingTask && (
          <div className="space-y-4">
            <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm">
              <span className="font-bold">Task:</span> {completingTask.title}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Actual Quantity Applied (kg)</label>
              <input
                type="number"
                step="0.1"
                value={actualFertilizer}
                onChange={e => setActualFertilizer(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 25.0"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Notes / Brand used</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-24"
                placeholder="Details of fertilizer brand, application procedure, or crop response..."
              />
            </div>
            <button
              onClick={confirmComplete}
              disabled={completeMutation.isPending}
              className="w-full btn-primary px-4 py-2.5 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {completeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Confirm Log Application
            </button>
          </div>
        )}
      </Modal>

      {/* Task Details Modal */}
      <Modal isOpen={!!detailTask} onClose={() => setDetailTask(null)} title="Activity Details">
        {detailTask && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Title</h4>
              <p className="text-base text-white mt-0.5">{detailTask.title}</p>
            </div>
            {detailTask.description && (
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Description / Instructions</h4>
                <p className="text-sm text-slate-300 mt-0.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">{detailTask.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Scheduled Date</h4>
                <p className="text-sm text-white mt-0.5">{new Date(detailTask.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</h4>
                <span className={clsx("inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mt-1",
                  detailTask.status === "completed" ? "bg-green-500/20 text-green-400 border border-green-900/50" : "bg-amber-500/20 text-amber-400 border border-amber-900/50"
                )}>
                  {detailTask.status}
                </span>
              </div>
            </div>
            {detailTask.ai_reasoning && (
              <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Recommended Reasoning
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{detailTask.ai_reasoning}</p>
              </div>
            )}
            {detailTask.status === "completed" && (
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Actual Quantity</h4>
                    <p className="text-sm text-white mt-0.5">{detailTask.actual_fertilizer_kg || "N/A"} kg</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Completed At</h4>
                    <p className="text-sm text-white mt-0.5">{detailTask.completed_at ? new Date(detailTask.completed_at).toLocaleString() : "N/A"}</p>
                  </div>
                </div>
                {detailTask.notes && (
                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">Farmer Notes</h4>
                    <p className="text-sm text-slate-300 mt-0.5 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">{detailTask.notes}</p>
                  </div>
                )}
                {/* Reset button inside details */}
                <button
                  onClick={() => resetMutation.mutate(detailTask.id)}
                  disabled={resetMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 mt-4 disabled:opacity-50"
                >
                  {resetMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                  Reset Work State back to Pending
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

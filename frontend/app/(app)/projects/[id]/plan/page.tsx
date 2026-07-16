"use client";

import { ArrowLeft, CheckCircle2, SkipForward, Clock, Loader2, Plus, Pencil, Trash2, Sparkles, Sprout, AlertTriangle, Sun } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import {
  useCompleteActivity, useSkipActivity,
  useCreateActivity, useUpdateActivity, useDeleteActivity,
} from "@/lib/hooks/useActivities";
import { useState } from "react";
import Modal from "@/components/ui/Modal";

// Canonical activity-type enum — kept in sync with backend
// backend/modules/planner/schemas.py::ACTIVITY_TYPES
const ACTIVITY_TYPES = [
  { value: "irrigation", label: "💧 Irrigation" },
  { value: "fertilizer", label: "🧪 Fertilizer" },
  { value: "pest_control", label: "🐛 Pest Control" },
  { value: "disease_check", label: "🔍 Disease Check" },
  { value: "harvesting", label: "🌾 Harvesting" },
  { value: "weeding", label: "🌿 Weeding" },
  { value: "soil_preparation", label: "🪏 Soil Preparation" },
  { value: "monitoring", label: "🔎 Monitoring" },
  { value: "other", label: "📅 Other" },
];

const ACTIVITY_EMOJI: Record<string, string> = ACTIVITY_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label.split(" ")[0];
  return acc;
}, {} as Record<string, string>);

export default function PlanPage({ params }: { params: { id: string } }) {
  const completeMutation = useCompleteActivity(params.id);
  const skipMutation = useSkipActivity(params.id);
  const createMutation = useCreateActivity(params.id);
  const updateMutation = useUpdateActivity(params.id);
  const deleteMutation = useDeleteActivity(params.id);
  const [optimisticStatus, setOptimisticStatus] = useState<Record<string, string>>({});

  // Complete modal
  const [completingTask, setCompletingTask] = useState<any>(null);
  const [actualWater, setActualWater] = useState("");
  const [actualFertilizer, setActualFertilizer] = useState("");
  const [notes, setNotes] = useState("");

  // Add/Edit modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    activity_type: "irrigation",
    name: "",
    description: "",
    due_date: new Date().toISOString().split("T")[0],
  });

  const { data: activities, isLoading, error } = useQuery({
    queryKey: ["all-activities", params.id],
    queryFn: async () => {
      const res = await api.get(`/planner/${params.id}/activities`);
      return res.data.data;
    },
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data.data;
    },
  });

  const handleCompleteClick = (task: any, status: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (status !== "completed" && status !== "skipped" && !optimisticStatus[task.id]) {
      setCompletingTask(task);
      setActualWater("");
      setActualFertilizer("");
      setNotes("");
    }
  };

  const confirmComplete = () => {
    if (!completingTask) return;
    const id = completingTask.id;
    setOptimisticStatus(prev => ({ ...prev, [id]: "completed" }));

    const data: any = {};
    if (actualWater) data.actual_water_liters = parseFloat(actualWater);
    if (actualFertilizer) data.actual_fertilizer_kg = parseFloat(actualFertilizer);
    if (notes) data.notes = notes;

    completeMutation.mutate({ activityId: id, data }, {
      onError: () => setOptimisticStatus(prev => { const n = { ...prev }; delete n[id]; return n; }),
    });
    setCompletingTask(null);
  };

  const handleSkip = (id: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (status !== "completed" && status !== "skipped" && !optimisticStatus[id]) {
      setOptimisticStatus(prev => ({ ...prev, [id]: "skipped" }));
      skipMutation.mutate({ activityId: id, reason: "Skipped via timeline" }, {
        onError: () => setOptimisticStatus(prev => { const n = { ...prev }; delete n[id]; return n; }),
      });
    }
  };

  const openAddModal = () => {
    setEditingTask(null);
    setTaskForm({ title: "", activity_type: "irrigation", name: "", description: "", due_date: new Date().toISOString().split("T")[0] });
    setTaskModalOpen(true);
  };

  const openEditModal = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      activity_type: task.activity_type || "other",
      // For 'other' tasks the title IS the custom name; prefill it.
      name: task.activity_type === "other" ? (task.name || task.title || "") : "",
      description: task.description || "",
      due_date: task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setTaskModalOpen(true);
  };

  const submitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({ activityId: editingTask.id, data: taskForm }, { onSuccess: () => setTaskModalOpen(false) });
    } else {
      createMutation.mutate(taskForm, { onSuccess: () => setTaskModalOpen(false) });
    }
  };

  const handleDelete = (task: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete task "${task.title}"?`)) {
      deleteMutation.mutate(task.id);
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
      if (dueDate.getTime() < today.getTime()) groupLabel = "Past";
      else if (getWeekNumber(dueDate) === currentWeek && dueDate.getFullYear() === today.getFullYear()) groupLabel = "This Week";
      else {
        const month = dueDate.toLocaleString('default', { month: 'short' });
        groupLabel = `Week of ${month} ${dueDate.getDate()}`;
      }
      if (!groupedActivities[groupLabel]) groupedActivities[groupLabel] = [];
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Plan</h1>
          <p className="text-slate-500 text-sm">Full timeline {dashboard?.project?.plant?.common_name ? `· ${dashboard.project.plant.common_name}` : ""}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">Add Task</span>
        </button>
      </header>

      {/* Today's Crop Status Card */}
      {dashboard && (
        <section className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100 rounded-xl">
                <Sprout className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-base">
                  {dashboard.current_stage?.stage_name || "Active Stage"}
                </h2>
                <p className="text-sm text-slate-500">
                  Day {dashboard.farming_circle?.current_day || 0} of {dashboard.farming_circle?.total_days || "?"}
                  {dashboard.project?.plant?.common_name ? ` · ${dashboard.project.plant.common_name}` : ""}
                </p>
              </div>
            </div>
            {dashboard.weather?.current && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{Math.round(dashboard.weather.current.temp_celsius)}°C</span>
              </div>
            )}
          </div>
          {dashboard.current_stage?.watch_for && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-amber-800">
                <span className="font-semibold">Watch for:</span> {dashboard.current_stage.watch_for}
              </span>
            </div>
          )}
        </section>
      )}

      {error ? (
        <div className="p-8 text-center text-red-500">Failed to load timeline.</div>
      ) : Object.keys(groupedActivities).length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl bg-white">
          <h3 className="text-lg font-semibold mb-2">No activities planned</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            The AI is still generating your plan, or there are no activities remaining. Add a manual task to get started.
          </p>
          <button onClick={openAddModal} className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700">
            <Plus className="w-4 h-4" /> Add Task
          </button>
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
                  const isManual = task.is_ai_recommended === false;

                  return (
                    <div
                      key={task.id}
                      onClick={() => handleCompleteClick(task, status)}
                      className={clsx(
                        "flex items-center gap-4 p-4 rounded-2xl border transition-colors shadow-sm",
                        isDone && "bg-slate-100 border-slate-200",
                        !isDone && !isSkipped && "bg-white border-slate-200 hover:border-green-300 hover:shadow-md",
                        isSkipped && "bg-red-50 border-red-200 opacity-60",
                        "cursor-pointer"
                      )}
                    >
                      <span className="text-xl w-8 text-center">{ACTIVITY_EMOJI[task.activity_type] || "📅"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={clsx("font-medium truncate", (isDone || isSkipped) ? "text-slate-500 line-through" : "text-slate-800")}>
                            {task.title}
                          </h3>
                          {isManual && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-violet-100 text-violet-700 shrink-0">
                              <Sparkles className="w-2.5 h-2.5" /> Manual
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500">
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {isSkipped && <span className="text-xs text-red-500 font-medium ml-2">Skipped</span>}
                        </div>
                      </div>

                      {/* Manual task actions: edit + delete */}
                      {isManual && status === "pending" && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={(e) => openEditModal(task, e)}
                            className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(task, e)}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 bg-slate-100 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div className="shrink-0">
                        {isDone && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        {(!isDone && !isSkipped) && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleCompleteClick(task, status, e)}
                              className="p-1.5 bg-green-100 rounded-lg text-green-700 hover:bg-green-200 transition-colors"
                              title="Complete"
                            >
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
          );
        })
      )}

      {/* Add/Edit Task Modal */}
      <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title={editingTask ? "Edit Task" : "Add New Task"}>
        <form onSubmit={submitTask} className="space-y-4">
          {/* For 'other' we ask for a custom Name instead of a generic Title */}
          {taskForm.activity_type === "other" ? (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Activity Name</label>
              <input
                type="text"
                required
                value={taskForm.name}
                onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value, title: e.target.value })}
                placeholder="e.g. Mulch the beds"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Task Title</label>
              <input
                type="text"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Apply compost to row 3"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Type</label>
              <select
                value={taskForm.activity_type}
                onChange={(e) => setTaskForm({ ...taskForm, activity_type: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value} className="bg-slate-800 text-white">{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Due Date</label>
              <input
                type="date"
                required
                value={taskForm.due_date}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Description (optional)</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-20"
              placeholder="Notes about this task..."
            />
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {editingTask ? "Save Changes" : "Add Task"}
          </button>
        </form>
      </Modal>

      {/* Completion Modal */}
      <Modal isOpen={!!completingTask} onClose={() => setCompletingTask(null)} title="Complete Activity">
        {completingTask && (
          <div className="space-y-4">
            <div className="p-3 bg-green-950/40 text-green-400 border border-green-900 rounded-xl mb-4 text-sm">
              <span className="font-bold">Task:</span> {completingTask.title}
            </div>
            {completingTask.activity_type === "irrigation" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Actual Water Used (Liters)</label>
                <input type="number" value={actualWater} onChange={e => setActualWater(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Optional" />
              </div>
            )}
            {completingTask.activity_type === "fertilizer" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-300">Actual Fertilizer Used (Kg)</label>
                <input type="number" value={actualFertilizer} onChange={e => setActualFertilizer(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Optional" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Notes / Observations</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none h-24" placeholder="Any unusual signs?" />
            </div>
            <button
              onClick={confirmComplete}
              disabled={completeMutation.isPending}
              className="w-full bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {completeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Confirm Completion
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";
import { useRefreshAISummary } from "@/lib/hooks/useAISummary";
import { useUpdateProject, useDeleteProject } from "@/lib/hooks/useProjectMutations";
import FarmingCircle from "@/components/project/FarmingCircle";
import ActivityBlock from "@/components/blocks/ActivityBlock";
import WeatherBlock from "@/components/blocks/WeatherBlock";
import AlertBanner from "@/components/blocks/AlertBanner";
import QuickAskBlock from "@/components/blocks/QuickAskBlock";
import WeatherCardBlock from "@/components/blocks/WeatherCardBlock";
import FertilizerLogBlock from "@/components/blocks/FertilizerLogBlock";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatFarmingMethod } from "@/lib/utils/formatters";
import ParallaxBackground from "@/components/dashboard/ParallaxBackground";
import {
  ArrowLeft,
  Settings,
  Bot,
  FlaskConical,
  Calendar,
  Bug,
  TrendingUp,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProjectDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { data, isLoading, error } = useDashboard(params.id);
  const refreshAI = useRefreshAISummary(params.id);
  const updateProject = useUpdateProject(params.id);
  const deleteProject = useDeleteProject(params.id);
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    area: 0,
    area_unit: "acres",
    farming_method: "organic",
  });

  const openEdit = () => {
    const p = data?.project;
    setEditForm({
      name: p?.name || "",
      area: parseFloat(p?.area || "0") || 0,
      area_unit: p?.area_unit || "acres",
      farming_method: p?.farming_method || "organic",
    });
    setEditOpen(true);
  };

  const handleDelete = () => {
    if (confirm(`Delete this project? This cannot be undone.`)) {
      deleteProject.mutate(undefined, { onSuccess: () => router.push("/dashboard") });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-4">
        <div className="glass-card p-6 text-center max-w-sm">
          <p className="text-red-400 font-medium">
            Failed to load project dashboard. Please try again.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 text-primary font-semibold text-sm hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const {
    project,
    farming_circle,
    todays_activities,
    upcoming_activities,
    weather_alerts,
    soil_status,
    market_price,
    ai_summary,
    active_issues,
  } = data;

  const circleStages = farming_circle?.stages?.map((s: any) => ({
    name: s.stage?.stage_name || s.name || "Stage",
    status: s.is_completed ? "done" as const : s.is_current ? "current" as const : "pending" as const,
  })) || [];

  const totalDays = farming_circle?.total_days || 90;
  const currentDay = farming_circle?.current_day || 0;
  const progress = totalDays > 0 ? Math.round((currentDay / totalDays) * 100) : 0;

  const serviceBlocks = [
    {
      href: `/projects/${params.id}/soil`,
      icon: FlaskConical,
      label: "Soil",
      value: soil_status ? `pH ${soil_status.ph}` : "No Test",
      sub: soil_status 
        ? `N:${soil_status.nitrogen_status[0]} | P:${soil_status.phosphorus_status[0]} | K:${soil_status.potassium_status[0]}`
        : "Add Test",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      href: `/projects/${params.id}/plan`,
      icon: Calendar,
      label: "Plan",
      value: todays_activities && todays_activities.length > 0 ? `${todays_activities.length} Task${todays_activities.length > 1 ? "s" : ""}` : "No Tasks",
      sub: todays_activities && todays_activities.length > 0 ? todays_activities[0].title : "All caught up",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      href: `/projects/${params.id}/disease`,
      icon: Bug,
      label: "Disease",
      value: active_issues && active_issues.length > 0 ? `${active_issues.length} Active` : "Healthy",
      sub: active_issues && active_issues.length > 0 ? `Latest: ${active_issues[0].title}` : "No issues found",
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      href: `/projects/${params.id}/market`,
      icon: TrendingUp,
      label: "Market",
      value: market_price
        ? `${formatCurrency(market_price.price_per_kg)}/kg`
        : "No Data",
      sub: market_price 
        ? `Trend: ${market_price.trend} (${market_price.change_pct > 0 ? "+" : ""}${market_price.change_pct}%)`
        : "No market data",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      href: `/projects/${params.id}/fertilizer`,
      icon: Sprout,
      label: "Fertilizer",
      value: "Nutrition",
      sub: "Manage fertilizers",
      color: "text-lime-400",
      bg: "bg-lime-500/10",
    },
  ];

  return (
    <>
      <ParallaxBackground />
      <div className="relative z-10 p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {project.plant?.common_name || "Farm Project"}<span className="text-green-400 text-glow-green">.</span>
            </h1>
            <p className="text-text-muted text-sm flex items-center gap-2">
              <span>{project.area}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="capitalize">{formatFarmingMethod(project.farming_method)} Method</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={deleteProject.isPending}
            title="Delete project"
            className="p-2.5 glass-card rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 disabled:opacity-50"
          >
            {deleteProject.isPending ? <Loader2 className="w-5 h-5 text-red-400 animate-spin" /> : <Trash2 className="w-5 h-5 text-red-400" />}
          </button>
          <button
            onClick={openEdit}
            title="Edit project"
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Farming Circle */}
      <section className="relative glass-card overflow-hidden animate-slide-up shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        {/* Glow blobs inside circle block */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[150px] bg-green-500/5 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/[0.02] to-transparent pointer-events-none" />
        <FarmingCircle stages={circleStages} />
        <div className="text-center pb-6 relative z-10">
          <span className="inline-block px-5 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.15)] uppercase">
            DAY {currentDay} OF {totalDays} · {Math.round(progress)}% Progress
          </span>
        </div>
      </section>

      {/* Alerts */}
      {weather_alerts && weather_alerts.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <AlertBanner projectId={params.id} alerts={weather_alerts} />
        </section>
      )}

      {/* Service Blocks Grid */}
      <section className="animate-slide-up" style={{ animationDelay: "150ms" }}>
        <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
          Services
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <WeatherBlock projectId={params.id} />
          {serviceBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Link
                key={block.label}
                href={block.href}
                className="glass-card-hover p-4 group"
              >
                <div
                  className={`p-2.5 rounded-xl w-fit mb-3 ${block.bg} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                >
                  <Icon className={`w-5 h-5 ${block.color}`} />
                </div>
                <p className="text-xs text-text-muted mb-0.5">{block.label}</p>
                <p className="text-base font-bold text-white group-hover:text-green-400 transition-colors duration-300">{block.value}</p>
                <p className="text-xs text-text-muted capitalize">
                  {block.sub}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Activity Block */}
      <section className="animate-slide-up" style={{ animationDelay: "200ms" }}>
        <ActivityBlock
          projectId={params.id}
          activities={todays_activities}
          upcomingActivities={upcoming_activities}
        />
      </section>

      {/* Weather + Fertilizer Log */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: "225ms" }}>
        <WeatherCardBlock projectId={params.id} />
        <FertilizerLogBlock projectId={params.id} />
      </section>

      {/* AI Summary Card */}
      <section className="animate-slide-up" style={{ animationDelay: "250ms" }}>
        <div className="glass-card hover:border-green-500/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] transition-all duration-500 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2 text-green-400">
              <Sparkles className="w-5 h-5 text-glow-green" />
              <h3 className="font-bold text-base">AI Insight</h3>
            </div>
            <button
              onClick={() => refreshAI.mutate()}
              disabled={refreshAI.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshAI.isPending ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <p className="text-text-secondary leading-relaxed relative z-10 mb-5 text-sm">
            {ai_summary?.text ||
              "Your AI assistant is analyzing your farm data. Generate your first summary now."}
          </p>

          <Link
            href={`/projects/${params.id}/ai`}
            className="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 font-semibold rounded-xl transition-all duration-300 relative z-10 text-sm gap-2"
          >
            <Bot className="w-4 h-4" />
            Chat with Assistant
          </Link>
        </div>
      </section>

      {/* Quick Ask */}
      <section className="animate-slide-up" style={{ animationDelay: "300ms" }}>
        <QuickAskBlock projectId={params.id} />
      </section>

      {/* Edit Project Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Project">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateProject.mutate(editForm, { onSuccess: () => setEditOpen(false) });
          }}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Project Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Area</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={editForm.area}
                onChange={(e) => setEditForm({ ...editForm, area: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Unit</label>
              <select
                value={editForm.area_unit}
                onChange={(e) => setEditForm({ ...editForm, area_unit: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="sqm">Sq Meters</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Farming Method</label>
            <select
              value={editForm.farming_method}
              onChange={(e) => setEditForm({ ...editForm, farming_method: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="organic">Organic</option>
              <option value="inorganic">Conventional</option>
              <option value="integrated">Integrated</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={updateProject.isPending}
            className="w-full bg-primary text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {updateProject.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Save Changes
          </button>
        </form>
      </Modal>
      </div>
    </>
  );
}

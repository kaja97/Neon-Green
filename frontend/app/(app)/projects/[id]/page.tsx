"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";
import { useRefreshAISummary } from "@/lib/hooks/useAISummary";
import FarmingCircle from "@/components/project/FarmingCircle";
import ActivityBlock from "@/components/blocks/ActivityBlock";
import WeatherBlock from "@/components/blocks/WeatherBlock";
import SoilBlock from "@/components/blocks/SoilBlock";
import DiseaseBlock from "@/components/blocks/DiseaseBlock";
import AlertBanner from "@/components/blocks/AlertBanner";
import { formatCurrency } from "@/lib/utils/formatters";
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
} from "lucide-react";
import Link from "next/link";

export default function ProjectDashboard({
  params,
}: {
  params: { id: string };
}) {
  const { data, isLoading, error } = useDashboard(params.id);
  const refreshAI = useRefreshAISummary(params.id);

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
    weather_alerts,
    soil_status,
    market_price,
    ai_summary,
    active_issues,
  } = data;

  const circleStages = farming_circle?.stages?.map((s) => ({
    name: s.name,
    status: s.status === "completed" ? "done" as const : s.status === "current" ? "current" as const : "pending" as const,
  })) || [];

  const progress = farming_circle?.progress_pct || 0;
  const currentDay = farming_circle?.current_day || 0;
  const totalDays = project.days_since_planting
    ? Math.round(project.days_since_planting / (progress / 100 || 1))
    : 90;

  const serviceBlocks = [
    {
      href: `/projects/${params.id}/soil`,
      icon: FlaskConical,
      label: "Soil",
      value: soil_status ? `pH ${soil_status.ph}` : "No Test",
      sub: soil_status?.nitrogen_status || "Add Test",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      href: `/projects/${params.id}/plan`,
      icon: Calendar,
      label: "Plan",
      value: `${todays_activities?.length || 0} Tasks`,
      sub: "Today",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      href: `/projects/${params.id}/disease`,
      icon: Bug,
      label: "Disease",
      value: `${active_issues?.length || 0}`,
      sub: "Issues",
      color: "text-red-400",
      bg: "bg-red-500/10",
    },
    {
      href: `/projects/${params.id}/market`,
      icon: TrendingUp,
      label: "Market",
      value: market_price
        ? `${formatCurrency(market_price.price_per_kg)}/kg`
        : "N/A",
      sub: market_price?.trend || "—",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 glass-card rounded-xl hover:bg-surface-tertiary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white capitalize">
              {project.crop || project.plant?.common_name || "Farm"}
            </h1>
            <p className="text-text-muted text-sm">
              {project.area} · {project.farming_method || "Farming"}
            </p>
          </div>
        </div>
        <Link
          href="/profile"
          className="p-2.5 glass-card rounded-xl hover:bg-surface-tertiary transition-colors"
        >
          <Settings className="w-5 h-5 text-text-secondary" />
        </Link>
      </header>

      {/* Farming Circle */}
      <section className="glass-card relative overflow-hidden animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <FarmingCircle stages={circleStages} />
        <div className="text-center pb-6 relative z-10">
          <span className="inline-block px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm tracking-wide">
            DAY {currentDay} OF {totalDays} · {Math.round(progress)}%
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                  className={`p-2 rounded-xl w-fit mb-3 ${block.bg} group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${block.color}`} />
                </div>
                <p className="text-xs text-text-muted mb-0.5">{block.label}</p>
                <p className="text-base font-bold text-white">{block.value}</p>
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
        />
      </section>

      {/* AI Summary Card */}
      <section className="animate-slide-up" style={{ animationDelay: "250ms" }}>
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-base">AI Insight</h3>
            </div>
            <button
              onClick={() => refreshAI.mutate()}
              disabled={refreshAI.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
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
            className="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors relative z-10 text-sm gap-2"
          >
            <Bot className="w-4 h-4" />
            Chat with Assistant
          </Link>
        </div>
      </section>
    </div>
  );
}

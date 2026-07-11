"use client";

import FarmingCircle from "@/components/project/FarmingCircle";
import ActivityBlock from "@/components/blocks/ActivityBlock";
import WeatherBlock from "@/components/blocks/WeatherBlock";
import AlertBanner from "@/components/blocks/AlertBanner";
import { ArrowLeft, Settings, AlertTriangle, Bot, CloudRain, FlaskConical, Calendar, Bug, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function ProjectDashboard({ params }: { params: { id: string } }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  const { project, stages, current_stage_index, day, total_days, active_alerts, market_price, todays_activities, ai_summary } = data;

  const circleStages = stages.map((s: any, idx: number) => ({
    name: s.stage_name,
    status: idx < current_stage_index ? "done" : idx === current_stage_index ? "current" : "pending"
  }));

  const progress = Math.min(100, Math.round((day / total_days) * 100));

  const serviceBlocks = [
    { href: `/projects/${params.id}/soil`, icon: FlaskConical, label: "Soil", value: "Test", sub: "Required", color: "text-amber-600", bg: "bg-amber-100" },
    { href: `/projects/${params.id}/plan`, icon: Calendar, label: "Plan", value: `${todays_activities?.length || 0} Tasks`, sub: "Today", color: "text-violet-600", bg: "bg-violet-100" },
    { href: `/projects/${params.id}/disease`, icon: Bug, label: "Disease", value: `${active_alerts?.length || 0} Alert`, sub: "Risks", color: "text-red-600", bg: "bg-red-100" },
    { href: `/projects/${params.id}/market`, icon: TrendingUp, label: "Market", value: `LKR ${market_price || 0}`, sub: "Today", color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight capitalize">{project.plant?.common_name || "Farm"}</h1>
            <p className="text-slate-500 text-sm">{project.area_acres} Acres · {project.farming_method}</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Farming Circle */}
      <section className="bg-white shadow-sm rounded-3xl border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-transparent pointer-events-none" />
        <FarmingCircle stages={circleStages} />
        <div className="text-center pb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-bold text-sm tracking-wide">
            DAY {day} OF {total_days} · {progress}%
          </span>
        </div>
      </section>

      {/* Alerts */}
      <section>
        {active_alerts?.length > 0 && <AlertBanner projectId={params.id} alerts={active_alerts} />}
      </section>

      {/* Service Blocks Grid */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <WeatherBlock projectId={params.id} />
          {serviceBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Link
                key={block.label}
                href={block.href}
                className="bg-white border rounded-2xl p-4 hover:border-slate-300 transition-all hover:shadow-md group"
              >
                <div className={`p-2 rounded-xl w-fit mb-3 ${block.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${block.color}`} />
                </div>
                <p className="text-xs text-slate-500 mb-0.5">{block.label}</p>
                <p className="text-lg font-bold">{block.value}</p>
                <p className="text-xs text-slate-400">{block.sub}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Activity Block */}
      <section>
        <ActivityBlock projectId={params.id} activities={todays_activities} />
      </section>

      {/* AI Summary Card */}
      <section>
        <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 p-6 rounded-3xl relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2 text-green-700">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold text-lg">AI Insight</h3>
            </div>
          </div>
          
          <p className="text-slate-700 leading-relaxed relative z-10 mb-6">
            {ai_summary || "Your AI assistant is analyzing your farm data to provide actionable insights. Generate your first summary now."}
          </p>

          <Link
            href={`/projects/${params.id}/ai`}
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-green-100 hover:bg-green-200 text-green-800 font-semibold rounded-xl transition-colors relative z-10"
          >
            Chat with Assistant
          </Link>
        </div>
      </section>
    </div>
  );
}

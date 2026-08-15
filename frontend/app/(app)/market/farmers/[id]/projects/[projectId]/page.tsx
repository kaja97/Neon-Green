"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sprout,
  MapPin,
  Calendar,
  Leaf,
  ShieldCheck,
  Target,
  DollarSign,
  Ruler,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  Phone,
  Mail
} from "lucide-react";
import api from "@/lib/api";

export default function FarmerProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [farmer, setFarmer] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/marketplace/farmers/${params.id}`);
        const data = res.data?.data ?? res.data;
        setFarmer(data);
        
        const found = data.projects?.find((p: any) => p.id === params.projectId);
        setProject(found || null);
      } catch (err) {
        console.error("Failed to fetch farmer/project", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id && params.projectId) fetchData();
  }, [params.id, params.projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project || !farmer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Sprout className="w-16 h-16 text-text-muted opacity-20" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Project not found</h2>
        <button onClick={() => router.back()} className="text-neon-gold hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const isActive = project.status === "active";

  const statusColors: Record<string, string> = {
    active: "bg-neon-green/10 text-neon-green border-neon-green/30",
    completed: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
    harvested: "bg-neon-gold/10 text-neon-gold border-neon-gold/30",
  };
  const statusColor = statusColors[project.status] || "bg-surface-tertiary text-text-muted border-border";

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-8 pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Farmer Profile
      </button>

      {/* Project Header */}
      <div className="glass-card p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-neon-green/10 flex items-center justify-center flex-shrink-0">
            <Sprout className="w-8 h-8 text-neon-green" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {project.name || project.plant_name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${statusColor}`}>
                {project.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-neon-green" />
                {project.plant_name}
              </span>
              {project.variety_name && (
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {project.variety_name}
                </span>
              )}
              {project.plant_category && (
                <span className="text-xs px-2 py-0.5 bg-surface-tertiary rounded-full">
                  {project.plant_category}
                  {project.plant_sub_category && ` → ${project.plant_sub_category}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
          <div className="glass-card p-3 space-y-1 bg-surface-tertiary/50">
            <div className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Planted
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{project.planting_date || "—"}</div>
          </div>
          <div className="glass-card p-3 space-y-1 bg-surface-tertiary/50">
            <div className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Ruler className="w-3 h-3" /> Area
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{project.area} {project.area_unit}</div>
          </div>
          <div className="glass-card p-3 space-y-1 bg-surface-tertiary/50">
            <div className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
              <Sprout className="w-3 h-3" /> Method
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{project.farming_method}</div>
          </div>
          <div className="glass-card p-3 space-y-1 bg-surface-tertiary/50">
            <div className="text-[10px] uppercase tracking-wider text-text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {project.location_name || project.location_district || "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Expected vs Actual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expected */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-neon-gold" />
            Expected Outcomes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary/50">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Harvest Date
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{project.expected_harvest_date || "—"}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary/50">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Yield
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {project.expected_yield_kg ? `${project.expected_yield_kg} kg` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary/50">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Revenue
              </span>
              <span className="text-sm font-medium text-neon-gold">
                {project.expected_revenue ? `LKR ${project.expected_revenue.toLocaleString()}` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Actual */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-neon-green" />
            Actual Results
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary/50">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Harvest Date
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {isActive ? (
                  <span className="flex items-center gap-1.5 text-neon-gold">
                    <Clock className="w-3.5 h-3.5" /> In Progress
                  </span>
                ) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary/50">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Yield
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {project.actual_yield_kg ? `${project.actual_yield_kg} kg` : (isActive ? "—" : "Not recorded")}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-tertiary/50">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Revenue
              </span>
              <span className="text-sm font-medium text-neon-gold">
                {project.actual_revenue ? `LKR ${project.actual_revenue.toLocaleString()}` : (isActive ? "—" : "Not recorded")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Card */}
      <div className="glass-card p-6 bg-gradient-to-br from-surface-elevated to-surface-primary">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sprout className="w-5 h-5 text-neon-blue" />
          Farmer Information
        </h3>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center text-xl font-bold shadow-lg">
            {farmer.full_name?.charAt(0) || "F"}
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-900 dark:text-white text-lg">{farmer.full_name}</div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-sm text-text-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-neon-green" /> Verified
              </span>
              <span className="text-sm text-text-muted flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {farmer.experience_years} yrs
              </span>
            </div>
          </div>
        </div>
        {(farmer.phone || farmer.email) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
            {farmer.phone && (
              <a href={`tel:${farmer.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary hover:bg-surface-elevated transition-colors border border-border/50">
                <Phone className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-text-secondary">{farmer.phone}</span>
              </a>
            )}
            {farmer.email && (
              <a href={`mailto:${farmer.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface-tertiary hover:bg-surface-elevated transition-colors border border-border/50">
                <Mail className="w-4 h-4 text-neon-blue" />
                <span className="text-sm text-text-secondary truncate">{farmer.email}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

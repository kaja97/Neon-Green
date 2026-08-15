"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sprout,
  MapPin,
  Mail,
  Phone,
  TrendingUp,
  Calendar,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Package,
  Target,
  DollarSign,
  Ruler
} from "lucide-react";
import api from "@/lib/api";

export default function FarmerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [farmer, setFarmer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFarmer = async () => {
      try {
        const res = await api.get(`/marketplace/farmers/${params.id}`);
        setFarmer(res.data?.data ?? res.data);
      } catch (err) {
        console.error("Failed to fetch farmer", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchFarmer();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Sprout className="w-16 h-16 text-text-muted opacity-20" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Farmer not found</h2>
        <button onClick={() => router.back()} className="text-neon-gold hover:underline">
          Go back to marketplace
        </button>
      </div>
    );
  }

  const activeProjects = farmer.projects?.filter((p: any) => p.status === "active") || [];
  const completedProjects = farmer.projects?.filter((p: any) => p.status !== "active") || [];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-8 pb-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Marketplace
      </button>

      {/* Farmer Profile Header */}
      <div className="glass-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-neon-blue/20 text-neon-blue flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-lg">
            {farmer.full_name?.charAt(0) || "F"}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{farmer.full_name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded-lg bg-surface-tertiary border border-border text-sm flex items-center gap-1.5 text-text-secondary capitalize">
                  <Sprout className="w-4 h-4 text-neon-green" />
                  {farmer.farming_method}
                </span>
                <span className="px-3 py-1 rounded-lg bg-surface-tertiary border border-border text-sm flex items-center gap-1.5 text-text-secondary">
                  <TrendingUp className="w-4 h-4" />
                  {farmer.experience_years} years experience
                </span>
                <span className="px-3 py-1 rounded-lg bg-surface-tertiary border border-border text-sm flex items-center gap-1.5 text-text-secondary">
                  <ShieldCheck className="w-4 h-4 text-neon-green" />
                  Verified
                </span>
              </div>
            </div>

            {farmer.bio && (
              <p className="text-text-secondary text-sm leading-relaxed">{farmer.bio}</p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-3 pt-2">
              {farmer.phone && (
                <a href={`tel:${farmer.phone}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-tertiary hover:bg-surface-elevated transition-colors border border-border/50 text-sm text-text-secondary hover:text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-neon-green" />
                  {farmer.phone}
                </a>
              )}
              {farmer.email && (
                <a href={`mailto:${farmer.email}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-tertiary hover:bg-surface-elevated transition-colors border border-border/50 text-sm text-text-secondary hover:text-slate-900 dark:text-white">
                  <Mail className="w-4 h-4 text-neon-blue" />
                  {farmer.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Locations */}
      {farmer.locations && farmer.locations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neon-gold" />
            Farm Locations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {farmer.locations.map((loc: any) => (
              <div key={loc.id} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-gold/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-neon-gold" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white text-sm">{loc.name}</div>
                  <div className="text-xs text-text-muted">{loc.district}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-neon-green" />
          Active Projects ({activeProjects.length})
        </h2>
        {activeProjects.length === 0 ? (
          <div className="glass-card p-8 text-center text-text-muted">
            <Sprout className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No active projects at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((project: any) => (
              <Link
                key={project.id}
                href={`/market/farmers/${farmer.farmer_profile_id}/projects/${project.id}`}
                className="glass-card p-5 space-y-4 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-neon-green/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-6 h-6 text-neon-green" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-neon-green transition-colors">
                        {project.name || project.plant_name}
                      </h3>
                      <div className="text-xs text-text-muted mt-0.5">
                        {project.plant_name}
                        {project.variety_name && ` • ${project.variety_name}`}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-neon-green transition-colors flex-shrink-0" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" />
                    Planted: {project.planting_date}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Ruler className="w-3.5 h-3.5 text-text-muted" />
                    {project.area} {project.area_unit}
                  </div>
                  {project.location_district && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      {project.location_district}
                    </div>
                  )}
                  {project.expected_harvest_date && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Target className="w-3.5 h-3.5 text-text-muted" />
                      Harvest: {project.expected_harvest_date}
                    </div>
                  )}
                </div>

                {(project.expected_yield_kg || project.expected_revenue) && (
                  <div className="flex gap-3 pt-3 border-t border-border">
                    {project.expected_yield_kg && (
                      <span className="text-xs text-text-muted">
                        Expected: <span className="text-slate-900 dark:text-white font-medium">{project.expected_yield_kg} kg</span>
                      </span>
                    )}
                    {project.expected_revenue && (
                      <span className="text-xs text-text-muted">
                        Revenue: <span className="text-neon-gold font-medium">LKR {project.expected_revenue.toLocaleString()}</span>
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-text-muted" />
            Past Projects ({completedProjects.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedProjects.map((project: any) => (
              <Link
                key={project.id}
                href={`/market/farmers/${farmer.farmer_profile_id}/projects/${project.id}`}
                className="glass-card p-5 opacity-70 hover:opacity-100 transition-opacity group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center">
                      <Sprout className="w-5 h-5 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white text-sm">{project.name || project.plant_name}</h3>
                      <div className="text-xs text-text-muted mt-0.5">
                        {project.plant_name} • {project.status}
                        {project.actual_yield_kg && ` • ${project.actual_yield_kg} kg harvested`}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-white" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

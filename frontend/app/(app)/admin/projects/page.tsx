"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import {
  Loader2,
  FolderGit2,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  Sprout,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";

export default function AdminProjectsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-projects", statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      params.append("page", String(page));
      params.append("per_page", "20");

      const res = await api.get(`/admin/projects?${params.toString()}`);
      return res.data?.data || res.data;
    },
  });

  const { data: projectDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-project-detail", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const res = await api.get(`/admin/projects/${selectedProjectId}`);
      return res.data?.data || res.data;
    },
    enabled: !!selectedProjectId,
  });

  const projects = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

  const filteredProjects = projects.filter((p: any) => {
    return (
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.crop_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const statusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-500/15 text-green-400 border border-green-500/30";
      case "harvested":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      case "failed":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      default:
        return "bg-surface-tertiary text-text-muted border-border";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Global Production Monitor<span className="text-primary text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Real-time telemetry and agronomic monitoring across all active farm projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-tertiary border border-border text-text-secondary">
            Total Projects: <strong className="text-white">{total}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by project name, farmer, crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses (Active, Harvested, Failed)</option>
          <option value="active">Active Projects</option>
          <option value="harvested">Harvested</option>
          <option value="failed">Failed / Terminated</option>
        </select>
      </div>

      {/* Projects Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
          No farm projects found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase font-bold text-text-muted bg-surface-secondary/40">
                  <th className="p-4">Project Name</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Crop</th>
                  <th className="p-4">Method & Land</th>
                  <th className="p-4">Planting Date</th>
                  <th className="p-4">Harvest Target</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredProjects.map((p: any) => (
                  <tr key={p.id} className="hover:bg-surface-tertiary/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-xs text-text-muted">ID: {p.id.slice(0, 8)}...</div>
                    </td>
                    <td className="p-4 font-medium text-text-secondary">{p.farmer_name}</td>
                    <td className="p-4 font-semibold text-primary">{p.crop_name}</td>
                    <td className="p-4 text-xs text-text-secondary">
                      <span className="capitalize font-semibold text-slate-900 dark:text-white">{p.farming_method}</span>
                      <span className="block text-text-muted">
                        {p.area} {p.area_unit || "acres"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-secondary">{p.planting_date || "N/A"}</td>
                    <td className="p-4 text-xs text-text-muted">{p.expected_harvest_date || "Calculated"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${statusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedProjectId(p.id)}
                        className="px-3 py-1.5 rounded-xl bg-surface-tertiary hover:bg-primary/20 hover:text-primary text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-text-muted">
                Showing page {page} of {totalPages} ({total} total projects)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-surface-tertiary text-xs font-semibold text-text-secondary disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-surface-tertiary text-xs font-semibold text-text-secondary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── PROJECT DETAIL DRAWER ─── */}
      {selectedProjectId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl h-full bg-surface-secondary border-l border-border flex flex-col overflow-hidden animate-slide-left">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-primary">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{projectDetail?.name || "Project"}</h2>
                  <p className="text-xs text-text-muted">
                    Farmer: {projectDetail?.farmer_name} • Status: {projectDetail?.status}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProjectId(null)}
                className="p-2 rounded-xl bg-surface-tertiary text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingDetail ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Agronomic Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Crop</span>
                      <strong className="text-white mt-0.5 block">{projectDetail?.crop?.common_name}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Variety</span>
                      <strong className="text-primary mt-0.5 block">
                        {projectDetail?.variety?.variety_name || "Standard"}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Land Area</span>
                      <strong className="text-white mt-0.5 block">
                        {projectDetail?.area} {projectDetail?.area_unit}
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Farming Method</span>
                      <strong className="text-neon-gold capitalize mt-0.5 block">
                        {projectDetail?.farming_method}
                      </strong>
                    </div>
                  </div>

                  {/* Location & Dates */}
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                      Site & Timeline Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-text-muted block">Farm Location</span>
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mt-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {projectDetail?.location?.name || "Field Plot"} ({projectDetail?.location?.district || "General"})
                        </div>
                      </div>
                      <div>
                        <span className="text-text-muted block">Planting Date</span>
                        <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          {projectDetail?.planting_date || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-muted block">Expected Harvest Date</span>
                        <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                          {projectDetail?.expected_harvest_date || "Calculated by agronomy"}
                        </div>
                      </div>
                      <div>
                        <span className="text-text-muted block">Active Field Issues</span>
                        <span className="text-red-400 font-bold mt-1 block">
                          {projectDetail?.issues_count || 0} Reported Issues
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Current Stage */}
                  {projectDetail?.current_stage && (
                    <div className="glass-card rounded-2xl p-5 border border-primary/30 space-y-2 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                          Active Growth Stage
                        </h3>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {projectDetail.current_stage.stage_name} (Stage #{projectDetail.current_stage.stage_order})
                      </h4>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import { Loader2, FileText, AlertTriangle, X, CheckCircle, Activity } from "lucide-react";
import { clsx } from "clsx";
import { formatFarmingMethod } from "@/lib/utils/formatters";

export default function AdminProjectsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-projects", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      const res = await api.get(`/admin/projects?${params.toString()}`);
      return res.data;
    }
  });

  const { data: projectDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["admin-project-detail", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return null;
      const res = await api.get(`/admin/projects/${selectedProject}`);
      return res.data;
    },
    enabled: !!selectedProject
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "harvested": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "failed": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-surface-tertiary text-text-muted border-border";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Global Production Monitor<span className="text-green-400 text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Monitor all active and historical farming projects across the platform.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-tertiary border border-border text-text-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Projects</option>
            <option value="active">Active</option>
            <option value="harvested">Harvested</option>
            <option value="failed">Failed</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </header>

      <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-tertiary/50 border-b border-border text-text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Crop Asset Name</th>
                <th className="px-6 py-4 font-medium">Account Ref</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Stage</th>
                <th className="px-6 py-4 font-medium text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    No projects found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.items?.map((project: any) => (
                  <tr key={project.id} className="hover:bg-surface-tertiary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{project.name}</div>
                      <div className="text-xs text-text-muted font-mono mt-0.5">ID: {project.id.split("-")[0]}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-text-secondary">{project.farmer_id}</div>
                      <div className="text-xs text-text-muted mt-0.5">Started: {new Date(project.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-surface-tertiary text-text-secondary rounded-lg text-xs font-semibold">
                        {formatFarmingMethod(project.farming_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold capitalize border",
                        statusBadge(project.status)
                      )}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedProject(project.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-tertiary hover:bg-surface-elevated text-text-secondary rounded-lg text-xs font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-border bg-surface-tertiary/30 flex items-center justify-between text-sm text-text-muted">
          <div>
            Showing {data?.items?.length || 0} of {data?.total || 0} active projects
          </div>
        </div>
      </div>

      {/* Diagnostic Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-tertiary/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-400 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Instance Diagnostic Details</h3>
                  <p className="text-xs text-text-muted font-mono">Fetch: {selectedProject}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 text-text-muted hover:bg-surface-tertiary rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-sm text-text-secondary font-medium">Loading diagnostic trace...</p>
                </div>
              ) : projectDetails ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={clsx(
                    "p-4 rounded-2xl flex items-start gap-3 border",
                    projectDetails.status === 'active'
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-surface-tertiary/50 border-border text-text-secondary"
                  )}>
                    {projectDetails.status === 'active'
                      ? <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      : <AlertTriangle className="w-5 h-5 text-text-muted mt-0.5" />}
                    <div>
                      <h4 className="font-bold">Project State: {projectDetails.status.toUpperCase()}</h4>
                      <p className="text-sm mt-1 opacity-90">Plan Engine: <span className="font-mono bg-surface-tertiary px-1.5 py-0.5 rounded">{projectDetails.plan_generation_status}</span></p>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-1">Core Telemetry</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-card p-3">
                        <p className="text-xs text-text-muted mb-1">Crop Configuration</p>
                        <p className="font-semibold text-white">{projectDetails.name}</p>
                      </div>
                      <div className="glass-card p-3">
                        <p className="text-xs text-text-muted mb-1">Methodology</p>
                        <p className="font-semibold text-white">{formatFarmingMethod(projectDetails.farming_method)}</p>
                      </div>
                      <div className="glass-card p-3">
                        <p className="text-xs text-text-muted mb-1">Area Footprint</p>
                        <p className="font-semibold text-white font-mono">
                          {projectDetails.area} {projectDetails.area_unit}
                        </p>
                      </div>
                      <div className="glass-card p-3">
                        <p className="text-xs text-text-muted mb-1">Ownership Account</p>
                        <p className="font-semibold text-white font-mono text-xs truncate" title={projectDetails.farmer_id}>
                          {projectDetails.farmer_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Vectors */}
                  <div>
                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 px-1">Timeline Vectors</h4>
                    <div className="space-y-2">
                      {[
                        { label: "Creation Timestamp", value: new Date(projectDetails.created_at).toLocaleString() },
                        { label: "Planting Cycle Start", value: projectDetails.planting_date ? new Date(projectDetails.planting_date).toLocaleDateString() : 'N/A' },
                        { label: "Estimated Harvest", value: projectDetails.expected_harvest_date ? new Date(projectDetails.expected_harvest_date).toLocaleDateString() : 'N/A' },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between p-3 glass-card text-sm">
                          <span className="text-text-secondary">{row.label}</span>
                          <span className="font-mono font-medium text-white">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import { Loader2, Search, FileText, AlertTriangle, X, CheckCircle, Leaf, Activity } from "lucide-react";
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

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Production Overseer Monitor</h1>
          <p className="text-slate-500 text-sm">Monitor all active and historical farming projects across the platform.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">All Projects</option>
            <option value="active">Active</option>
            <option value="harvested">Harvested</option>
            <option value="failed">Failed</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
      </header>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Crop Asset Name</th>
                <th className="px-6 py-4 font-medium">Account Ref</th>
                <th className="px-6 py-4 font-medium">Method</th>
                <th className="px-6 py-4 font-medium">Stage Readout</th>
                <th className="px-6 py-4 font-medium text-right">Diagnostic History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No projects found matching your filters.
                  </td>
                </tr>
              ) : (
                data?.items?.map((project: any) => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{project.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {project.id.split("-")[0]}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-slate-600">{project.farmer_id}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Started: {new Date(project.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                        {formatFarmingMethod(project.farming_method)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold capitalize",
                        project.status === "active" ? "bg-green-100 text-green-700" :
                        project.status === "harvested" ? "bg-amber-100 text-amber-700" :
                        project.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-600"
                      )}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedProject(project.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
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
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing {data?.items?.length || 0} of {data?.total || 0} active projects
          </div>
        </div>
      </div>

      {/* Diagnostic Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 text-green-700 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Instance Diagnostic Details</h3>
                  <p className="text-xs text-slate-500 font-mono">Override Fetch: {selectedProject}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProject(null)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-4" />
                  <p className="text-sm text-slate-500 font-medium">Loading deep diagnostic trace...</p>
                </div>
              ) : projectDetails ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={clsx(
                    "p-4 rounded-2xl flex items-start gap-3",
                    projectDetails.status === 'active' ? "bg-green-50 border border-green-100 text-green-800" : "bg-slate-50 border border-slate-200 text-slate-800"
                  )}>
                    {projectDetails.status === 'active' ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-slate-500 mt-0.5" />}
                    <div>
                      <h4 className="font-bold">Project State: {projectDetails.status.toUpperCase()}</h4>
                      <p className="text-sm mt-1 opacity-90">Plan Generation Engine: <span className="font-mono bg-white/50 px-1.5 py-0.5 rounded">{projectDetails.plan_generation_status}</span></p>
                    </div>
                  </div>

                  {/* Core Metrics Grid */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Core Telemetry</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Crop Configuration</p>
                        <p className="font-semibold text-slate-900">{projectDetails.name}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Methodology</p>
                        <p className="font-semibold text-slate-900">{formatFarmingMethod(projectDetails.farming_method)}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Area Footprint</p>
                        <p className="font-semibold text-slate-900 font-mono">
                          {projectDetails.area} {projectDetails.area_unit}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Ownership Account</p>
                        <p className="font-semibold text-slate-900 font-mono text-xs truncate" title={projectDetails.farmer_id}>
                          {projectDetails.farmer_id}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Vectors */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Timeline Vectors</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                        <span className="text-slate-600">Creation Timestamp</span>
                        <span className="font-mono font-medium">{new Date(projectDetails.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                        <span className="text-slate-600">Planting Cycle Start</span>
                        <span className="font-mono font-medium">{projectDetails.planting_date ? new Date(projectDetails.planting_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                        <span className="text-slate-600">Estimated Harvest</span>
                        <span className="font-mono font-medium">{projectDetails.expected_harvest_date ? new Date(projectDetails.expected_harvest_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
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

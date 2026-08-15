"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import {
  Loader2,
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Bug,
  HelpCircle,
  ImageIcon,
} from "lucide-react";
import { clsx } from "clsx";

export default function AdminIssuesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [inspectingIssueId, setInspectingIssueId] = useState<string | null>(null);

  // Queries
  const { data: issuesData, isLoading: isLoadingIssues } = useQuery({
    queryKey: ["admin-issues", statusFilter, typeFilter, severityFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("issue_type", typeFilter);
      if (severityFilter !== "all") params.append("severity", severityFilter);
      params.append("page", String(page));
      params.append("per_page", "20");

      const res = await api.get(`/admin/issues?${params.toString()}`);
      return res.data?.data || res.data;
    },
  });

  const { data: issueDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-issue-detail", inspectingIssueId],
    queryFn: async () => {
      if (!inspectingIssueId) return null;
      const res = await api.get(`/admin/issues/${inspectingIssueId}`);
      return res.data?.data || res.data;
    },
    enabled: !!inspectingIssueId,
  });

  const { data: diseasesData } = useQuery({
    queryKey: ["admin-diseases-all"],
    queryFn: async () => {
      const res = await api.get("/admin/diseases");
      return res.data?.data || res.data || [];
    },
  });

  const { data: pestsData } = useQuery({
    queryKey: ["admin-pests-all"],
    queryFn: async () => {
      const res = await api.get("/admin/pests");
      return res.data?.data || res.data || [];
    },
  });

  // Mutations
  const updateIssueMutation = useMutation({
    mutationFn: async ({ issueId, payload }: { issueId: string; payload: any }) => {
      return await api.patch(`/admin/issues/${issueId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      queryClient.invalidateQueries({ queryKey: ["admin-issue-detail", inspectingIssueId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      return await api.delete(`/admin/issues/${issueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-issues"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setInspectingIssueId(null);
    },
  });

  const items = issuesData?.items || [];
  const total = issuesData?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

  const filteredItems = items.filter((issue: any) => {
    return (
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.crop_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const severityBadge = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500/15 text-red-400 border border-red-500/30";
      case "high":
        return "bg-orange-500/15 text-orange-400 border border-orange-500/30";
      case "medium":
        return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    }
  };

  const statusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-green-500/15 text-green-400 border border-green-500/30";
      case "in_progress":
        return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
      default:
        return "bg-red-500/15 text-red-400 border border-red-500/30";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Reported Field Issues<span className="text-red-400 text-glow-red">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Triage crop pathology reports, AI diagnoses, and map field observations to master solutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-tertiary border border-border text-text-secondary">
            Total Issues: <strong className="text-white">{total}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by title, crop, farmer, project..."
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
          <option value="all">All Statuses</option>
          <option value="open">🔴 Open</option>
          <option value="in_progress">🟡 In Progress</option>
          <option value="resolved">🟢 Resolved</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Issue Types</option>
          <option value="disease">Disease</option>
          <option value="pest">Pest</option>
          <option value="nutrient_deficiency">Nutrient Deficiency</option>
          <option value="other">Other</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Issues Table */}
      {isLoadingIssues ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
          <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-80" />
          No field issues found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase font-bold text-text-muted bg-surface-secondary/40">
                  <th className="p-4">Crop / Project</th>
                  <th className="p-4">Farmer</th>
                  <th className="p-4">Issue Details</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reported</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredItems.map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-surface-tertiary/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{issue.crop_name}</div>
                      <div className="text-xs text-text-muted">{issue.project_name}</div>
                    </td>
                    <td className="p-4 font-medium text-text-secondary">{issue.farmer_name}</td>
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-white truncate">{issue.title}</div>
                      {issue.description && (
                        <div className="text-xs text-text-muted truncate">{issue.description}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-tertiary text-text-secondary uppercase">
                        {issue.issue_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${severityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${statusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-muted">{issue.reported_date}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setInspectingIssueId(issue.id)}
                        className="px-3 py-1.5 rounded-xl bg-surface-tertiary hover:bg-neon-purple/20 hover:text-neon-purple text-xs font-semibold transition-colors"
                      >
                        Triage
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
                Showing page {page} of {totalPages} ({total} total records)
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

      {/* ─── ISSUE TRIAGE DRAWER ─── */}
      {inspectingIssueId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl h-full bg-surface-secondary border-l border-border flex flex-col overflow-hidden animate-slide-left">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-primary">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{issueDetail?.title || "Field Issue"}</h2>
                  <p className="text-xs text-text-muted">
                    Project: {issueDetail?.project_name} • Farmer: {issueDetail?.farmer_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (confirm("Delete this reported issue?")) {
                      deleteIssueMutation.mutate(inspectingIssueId);
                    }
                  }}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  title="Delete Issue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setInspectingIssueId(null)}
                  className="p-2 rounded-xl bg-surface-tertiary text-text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingDetail ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Issue Meta */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Crop</span>
                      <strong className="text-white mt-0.5 block">{issueDetail?.crop_name}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Severity</span>
                      <strong className="text-red-400 uppercase mt-0.5 block">{issueDetail?.severity}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Issue Type</span>
                      <strong className="text-white uppercase mt-0.5 block">{issueDetail?.issue_type}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-tertiary border border-border">
                      <span className="text-text-muted block">Reported Date</span>
                      <strong className="text-white mt-0.5 block">{issueDetail?.reported_date}</strong>
                    </div>
                  </div>

                  {/* Farmer Description */}
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Farmer Description</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {issueDetail?.description || "No written description provided."}
                    </p>
                  </div>

                  {/* Attached Images */}
                  {issueDetail?.images?.length > 0 && (
                    <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-neon-blue" />
                        Field Photos ({issueDetail.images.length})
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {issueDetail.images.map((imgUrl: string, idx: number) => (
                          <div key={idx} className="relative rounded-xl overflow-hidden border border-border bg-black/40 aspect-video">
                            <img
                              src={imgUrl}
                              alt={`Field image ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Diagnosis */}
                  {issueDetail?.ai_diagnosis && (
                    <div className="glass-card rounded-2xl p-5 border border-neon-purple/30 bg-neon-purple/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-neon-purple" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neon-purple">
                          AI Automated Diagnosis
                        </h3>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {issueDetail.ai_diagnosis}
                      </p>
                    </div>
                  )}

                  {/* Triage & Status Form */}
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-4">
                    <h3 className="text-sm font-bold text-white">Status & Resolution Actions</h3>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-semibold text-text-secondary block mb-1">Status</label>
                        <div className="flex items-center gap-2">
                          {["open", "in_progress", "resolved"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() =>
                                updateIssueMutation.mutate({
                                  issueId: inspectingIssueId,
                                  payload: { status: s },
                                })
                              }
                              className={clsx(
                                "px-3.5 py-2 rounded-xl border text-xs font-bold uppercase transition-all",
                                issueDetail?.status === s
                                  ? s === "resolved"
                                    ? "bg-green-500/20 border-green-500 text-green-400"
                                    : s === "in_progress"
                                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                                    : "bg-red-500/20 border-red-500 text-red-400"
                                  : "bg-surface-tertiary border-border text-text-muted hover:text-white"
                              )}
                            >
                              {s.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border space-y-3">
                        <div>
                          <label className="font-semibold text-text-secondary block mb-1">
                            Link to Master Data Disease
                          </label>
                          <select
                            value={issueDetail?.identified_disease_id || ""}
                            onChange={(e) =>
                              updateIssueMutation.mutate({
                                issueId: inspectingIssueId,
                                payload: { identified_disease_id: e.target.value || null },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
                          >
                            <option value="">-- No specific disease linked --</option>
                            {diseasesData?.map((d: any) => (
                              <option key={d.id} value={d.id}>
                                {d.crop_name}: {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-semibold text-text-secondary block mb-1">
                            Link to Master Data Pest
                          </label>
                          <select
                            value={issueDetail?.identified_pest_id || ""}
                            onChange={(e) =>
                              updateIssueMutation.mutate({
                                issueId: inspectingIssueId,
                                payload: { identified_pest_id: e.target.value || null },
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
                          >
                            <option value="">-- No specific pest linked --</option>
                            {pestsData?.map((p: any) => (
                              <option key={p.id} value={p.id}>
                                {p.crop_name}: {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft, Search, Loader2, AlertTriangle, ShieldCheck, CheckCircle,
  ChevronDown, ChevronUp, FlaskRound, Plus, Beaker,
} from "lucide-react";
import type { DiseaseSearch, DiseaseSolution } from "@/lib/types";

export default function DiseasePage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DiseaseSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedDisease, setExpandedDisease] = useState<string | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);

  // Report-issue form state
  const [report, setReport] = useState({
    title: "",
    issue_type: "disease",
    severity: "medium",
    description: "",
  });

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data.data;
    },
  });
  const farmingMethod = (dashboard?.project?.farming_method || "conventional") as string;

  const { data: issues, isLoading } = useQuery({
    queryKey: ["project_issues", params.id],
    queryFn: async () => {
      const res = await api.get(`/disease/issues/${params.id}`);
      return res.data.data;
    },
  });

  // Fetch solutions for an expanded disease
  const { data: solutions, isLoading: isLoadingSolutions } = useQuery<DiseaseSolution[]>({
    queryKey: ["disease_solutions", expandedDisease, farmingMethod],
    queryFn: async () => {
      const res = await api.get(`/disease/${expandedDisease}/solutions?farming_method=${farmingMethod}`);
      return res.data.data;
    },
    enabled: !!expandedDisease,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/disease/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const reportIssueMutation = useMutation({
    mutationFn: async (payload: { disease?: DiseaseSearch; useForm?: boolean }) => {
      if (payload.useForm) {
        return api.post(`/disease/issues/${params.id}`, {
          issue_type: report.issue_type,
          title: report.title,
          description: report.description,
          severity: report.severity,
        });
      }
      const disease = payload.disease!;
      return api.post(`/disease/issues/${params.id}`, {
        issue_type: "disease",
        title: `Suspected: ${disease.name}`,
        description: `Matched symptoms: ${disease.symptoms?.join(", ")}`,
        severity: disease.severity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_issues", params.id] });
      setSearchQuery("");
      setSearchResults([]);
      setShowReportForm(false);
      setReport({ title: "", issue_type: "disease", severity: "medium", description: "" });
    },
  });

  const resolveIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const res = await api.patch(`/disease/issues/${issueId}/resolve`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_issues", params.id] });
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disease & Pest Management</h1>
          <p className="text-slate-500 text-sm">Identify issues and find solutions</p>
        </div>
      </header>

      {/* Report Issue Form */}
      <section className="bg-white border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Report a Field Issue</h2>
          <button
            onClick={() => setShowReportForm((v) => !v)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            {showReportForm ? "Cancel" : "New Issue"}
          </button>
        </div>

        {showReportForm && (
          <form
            onSubmit={(e) => { e.preventDefault(); reportIssueMutation.mutate({ useForm: true }); }}
            className="space-y-4 mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Title</label>
                <input
                  type="text"
                  required
                  value={report.title}
                  onChange={(e) => setReport({ ...report, title: e.target.value })}
                  placeholder="e.g. Yellow spots on lower leaves"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Type</label>
                  <select
                    value={report.issue_type}
                    onChange={(e) => setReport({ ...report, issue_type: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500"
                  >
                    <option value="disease">Disease</option>
                    <option value="pest">Pest</option>
                    <option value="nutrient_deficiency">Nutrient Deficiency</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">Severity</label>
                  <select
                    value={report.severity}
                    onChange={(e) => setReport({ ...report, severity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600">Description</label>
              <textarea
                value={report.description}
                onChange={(e) => setReport({ ...report, description: e.target.value })}
                placeholder="Describe what you're seeing..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-green-500 resize-none h-20"
              />
            </div>
            <button
              type="submit"
              disabled={reportIssueMutation.isPending || !report.title}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {reportIssueMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Issue
            </button>
          </form>
        )}
      </section>

      {/* Symptom Checker */}
      <section className="bg-white border rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Search className="w-5 h-5 text-green-600" /> Symptom Checker
        </h2>
        <p className="text-slate-500 text-sm mb-4">Search the disease library to identify and view treatments.</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. yellow spots on leaves, wilting"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !searchQuery}
            className="bg-green-600 text-white px-6 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Possible Matches — tap to view treatments</h3>
            {searchResults.map((d) => {
              const isOpen = expandedDisease === d.id;
              return (
                <div key={d.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-slate-800">{d.name}</h4>
                        {d.scientific_name && <span className="text-xs italic text-slate-400">{d.scientific_name}</span>}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">Symptoms: {d.symptoms?.join(", ")}</p>
                      <button
                        onClick={() => setExpandedDisease(isOpen ? null : d.id)}
                        className="text-green-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        {isOpen ? "Hide" : "View"} Treatments
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => reportIssueMutation.mutate({ disease: d })}
                      disabled={reportIssueMutation.isPending}
                      className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                    >
                      Report Issue
                    </button>
                  </div>

                  {/* Solutions Panel */}
                  {isOpen && (
                    <div className="border-t border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Beaker className="w-4 h-4 text-green-600" />
                        <h5 className="font-bold text-slate-700 text-sm">
                          Treatments for <span className="capitalize">{farmingMethod}</span> farming
                        </h5>
                      </div>
                      {isLoadingSolutions ? (
                        <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-green-600" /></div>
                      ) : solutions && solutions.length > 0 ? (
                        <div className="space-y-3">
                          {solutions.map((s) => (
                            <div key={s.id} className="bg-green-50 border border-green-100 rounded-xl p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-slate-800 text-sm">{s.treatment_name}</span>
                                <div className="flex gap-1">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-green-200 text-green-800">{s.solution_type}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium capitalize bg-slate-100 text-slate-600">{s.farming_method}</span>
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 mb-1"><span className="font-semibold">Dosage:</span> {s.dosage}</p>
                              <p className="text-xs text-slate-600">{s.instructions}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 py-2">No treatments available for this disease & method yet.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {searchResults.length === 0 && searchQuery && !isSearching && (
          <p className="mt-4 text-sm text-slate-500 text-center py-4">No matches found. Try different symptoms or report a new issue.</p>
        )}
      </section>

      {/* Reported Issues */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Active Issues</h2>
        {isLoading ? (
          <div className="text-center text-slate-500 py-6">
             <Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" />
          </div>
        ) : issues && issues.length > 0 ? (
          <div className="space-y-4">
            {issues.map((issue: any) => (
              <div key={issue.id} className="bg-white border border-red-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                <div className="flex items-start justify-between mb-2 ml-2">
                  <h3 className="text-lg font-bold text-slate-800">{issue.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${issue.status === "resolved" ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                    {issue.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4 ml-2">{issue.description}</p>
                <div className="flex items-center justify-between ml-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Reported: {new Date(issue.reported_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="capitalize">Severity: {issue.severity}</span>
                  </div>
                  {issue.status !== "resolved" && (
                    <button
                      onClick={() => resolveIssueMutation.mutate(issue.id)}
                      disabled={resolveIssueMutation.isPending}
                      className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Solved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white border border-green-200 rounded-3xl p-12 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Crop is Healthy</h3>
            <p className="text-slate-500 text-sm">No active diseases or pests reported for this project.</p>
          </div>
        )}
      </section>
    </div>
  );
}

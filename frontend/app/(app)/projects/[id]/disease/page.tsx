"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Bug, Search, Loader2, AlertTriangle, ShieldCheck, CheckCircle } from "lucide-react";

export default function DiseasePage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: issues, isLoading } = useQuery({
    queryKey: ["project_issues", params.id],
    queryFn: async () => {
      const res = await api.get(`/disease/issues/${params.id}`);
      return res.data;
    }
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await api.get(`/disease/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const reportIssueMutation = useMutation({
    mutationFn: async (disease: any) => {
      const res = await api.post(`/disease/issues/${params.id}`, {
        issue_type: "disease",
        title: `Suspected: ${disease.name}`,
        description: `Matched symptoms: ${searchQuery}`,
        severity: disease.severity,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_issues", params.id] });
      setSearchQuery("");
      setSearchResults([]);
    }
  });

  const resolveIssueMutation = useMutation({
    mutationFn: async (issueId: string) => {
      const res = await api.patch(`/disease/issues/${issueId}/resolve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project_issues", params.id] });
    }
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

      {/* Symptom Checker */}
      <section className="bg-white border rounded-3xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Symptom Checker</h2>
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
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Possible Matches</h3>
            {searchResults.map((d) => (
              <div key={d.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h4 className="font-bold text-slate-800">{d.name}</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">Symptoms: {d.symptoms?.join(", ")}</p>
                  <Link href="#" className="text-green-600 text-sm font-medium hover:underline">View Treatments</Link>
                </div>
                <button
                  onClick={() => reportIssueMutation.mutate(d)}
                  disabled={reportIssueMutation.isPending}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  Report Issue
                </button>
              </div>
            ))}
          </div>
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
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 capitalize border border-red-100">
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

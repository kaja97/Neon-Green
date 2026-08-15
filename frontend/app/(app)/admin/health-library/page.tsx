"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  ShieldAlert,
  Bug,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Droplet,
  Pill,
} from "lucide-react";
import { clsx } from "clsx";

export default function AdminHealthLibraryPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"diseases" | "pests">("diseases");
  const [selectedCropId, setSelectedCropId] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Drawers
  const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<any | null>(null);
  const [inspectingDiseaseId, setInspectingDiseaseId] = useState<string | null>(null);

  const [isPestModalOpen, setIsPestModalOpen] = useState(false);
  const [editingPest, setEditingPest] = useState<any | null>(null);
  const [inspectingPestId, setInspectingPestId] = useState<string | null>(null);

  // Queries
  const { data: plantsData } = useQuery({
    queryKey: ["admin-plants"],
    queryFn: async () => {
      const res = await api.get("/admin/plants");
      return res.data?.data || res.data || [];
    },
  });

  const { data: diseasesData, isLoading: isLoadingDiseases } = useQuery({
    queryKey: ["admin-diseases", selectedCropId],
    queryFn: async () => {
      const url = selectedCropId
        ? `/admin/diseases?plant_id=${selectedCropId}`
        : "/admin/diseases";
      const res = await api.get(url);
      return res.data?.data || res.data || [];
    },
    enabled: activeTab === "diseases",
  });

  const { data: pestsData, isLoading: isLoadingPests } = useQuery({
    queryKey: ["admin-pests", selectedCropId],
    queryFn: async () => {
      const url = selectedCropId ? `/admin/pests?plant_id=${selectedCropId}` : "/admin/pests";
      const res = await api.get(url);
      return res.data?.data || res.data || [];
    },
    enabled: activeTab === "pests",
  });

  const { data: diseaseDetail, isLoading: isLoadingDiseaseDetail } = useQuery({
    queryKey: ["admin-disease-detail", inspectingDiseaseId],
    queryFn: async () => {
      if (!inspectingDiseaseId) return null;
      const res = await api.get(`/admin/diseases/${inspectingDiseaseId}`);
      return res.data?.data || res.data;
    },
    enabled: !!inspectingDiseaseId,
  });

  const { data: pestDetail, isLoading: isLoadingPestDetail } = useQuery({
    queryKey: ["admin-pest-detail", inspectingPestId],
    queryFn: async () => {
      if (!inspectingPestId) return null;
      const res = await api.get(`/admin/pests/${inspectingPestId}`);
      return res.data?.data || res.data;
    },
    enabled: !!inspectingPestId,
  });

  // Mutations
  const saveDiseaseMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingDisease?.id) {
        return await api.put(`/admin/diseases/${editingDisease.id}`, payload);
      } else {
        return await api.post("/admin/diseases", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-diseases"] });
      queryClient.invalidateQueries({ queryKey: ["admin-disease-detail"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsDiseaseModalOpen(false);
      setEditingDisease(null);
    },
  });

  const deleteDiseaseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/diseases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-diseases"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      if (inspectingDiseaseId) setInspectingDiseaseId(null);
    },
  });

  const savePestMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingPest?.id) {
        return await api.put(`/admin/pests/${editingPest.id}`, payload);
      } else {
        return await api.post("/admin/pests", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pest-detail"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsPestModalOpen(false);
      setEditingPest(null);
    },
  });

  const deletePestMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/pests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      if (inspectingPestId) setInspectingPestId(null);
    },
  });

  const plants = plantsData || [];
  const diseases = diseasesData || [];
  const pests = pestsData || [];

  const filteredDiseases = diseases.filter((d: any) => {
    const matchesSearch =
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.symptoms?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = !severityFilter || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredPests = pests.filter((p: any) => {
    return (
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.signs?.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Health & Issues Knowledge Base<span className="text-neon-gold text-glow-gold">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Maintain crop pathology, diagnostic symptom indices, and dual-track organic & conventional treatment protocols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "diseases" ? (
            <button
              onClick={() => {
                setEditingDisease(null);
                setIsDiseaseModalOpen(true);
              }}
              className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Disease & Solutions
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingPest(null);
                setIsPestModalOpen(true);
              }}
              className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Pest & Control
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("diseases")}
          className={clsx(
            "flex items-center gap-2 pb-3.5 px-1 font-semibold text-sm border-b-2 transition-all",
            activeTab === "diseases"
              ? "border-neon-gold text-neon-gold"
              : "border-transparent text-text-muted hover:text-white"
          )}
        >
          <ShieldAlert className="w-4 h-4" />
          Plant Diseases ({diseases.length})
        </button>
        <button
          onClick={() => setActiveTab("pests")}
          className={clsx(
            "flex items-center gap-2 pb-3.5 px-1 font-semibold text-sm border-b-2 transition-all",
            activeTab === "pests"
              ? "border-neon-blue text-neon-blue"
              : "border-transparent text-text-muted hover:text-white"
          )}
        >
          <Bug className="w-4 h-4" />
          Plant Pests ({pests.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={
              activeTab === "diseases"
                ? "Search diseases by name, scientific name, or symptoms..."
                : "Search pests by name, signs, or affected parts..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={selectedCropId}
          onChange={(e) => setSelectedCropId(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Crops</option>
          {plants.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.common_name}
            </option>
          ))}
        </select>

        {activeTab === "diseases" && (
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        )}
      </div>

      {/* ─── TAB 1: DISEASES ─── */}
      {activeTab === "diseases" && (
        <div>
          {isLoadingDiseases ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-neon-gold animate-spin" />
            </div>
          ) : filteredDiseases.length === 0 ? (
            <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
              No plant diseases found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDiseases.map((d: any) => (
                <div
                  key={d.id}
                  className="glass-card-hover rounded-2xl p-5 border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            {d.crop_name}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${severityBadge(d.severity)}`}>
                            {d.severity}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-2">{d.name}</h3>
                        {d.scientific_name && (
                          <p className="text-xs text-text-muted italic">{d.scientific_name}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingDisease(d);
                            setIsDiseaseModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-white"
                          title="Edit Disease"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete disease "${d.name}"?`)) {
                              deleteDiseaseMutation.mutate(d.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400"
                          title="Delete Disease"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {d.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mt-3">{d.description}</p>
                    )}

                    {/* Symptoms Tags */}
                    {d.symptoms?.length > 0 && (
                      <div className="mt-3.5 space-y-1">
                        <span className="text-[11px] font-semibold text-text-muted uppercase">Key Symptoms:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {d.symptoms.slice(0, 3).map((s: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-surface-tertiary text-text-secondary"
                            >
                              {s}
                            </span>
                          ))}
                          {d.symptoms.length > 3 && (
                            <span className="text-[11px] px-1.5 py-0.5 text-text-muted">
                              +{d.symptoms.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setInspectingDiseaseId(d.id)}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-surface-tertiary hover:bg-neon-gold/15 hover:text-neon-gold hover:border-neon-gold/30 border border-border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>View Details & Treatment Solutions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: PESTS ─── */}
      {activeTab === "pests" && (
        <div>
          {isLoadingPests ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
            </div>
          ) : filteredPests.length === 0 ? (
            <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
              No plant pests found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPests.map((p: any) => (
                <div
                  key={p.id}
                  className="glass-card-hover rounded-2xl p-5 border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {p.crop_name}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2">{p.name}</h3>
                        {p.scientific_name && (
                          <p className="text-xs text-text-muted italic">{p.scientific_name}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPest(p);
                            setIsPestModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete pest "${p.name}"?`)) {
                              deletePestMutation.mutate(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-xs text-text-secondary line-clamp-2 mt-3">{p.description}</p>
                    )}

                    {p.signs?.length > 0 && (
                      <div className="mt-3.5 space-y-1">
                        <span className="text-[11px] font-semibold text-text-muted uppercase">Damage Signs:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.signs.slice(0, 3).map((s: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-surface-tertiary text-text-secondary"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setInspectingPestId(p.id)}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-surface-tertiary hover:bg-neon-blue/15 hover:text-neon-blue hover:border-neon-blue/30 border border-border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>View Pest Profile & Solutions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── DISEASE DETAIL DRAWER ─── */}
      {inspectingDiseaseId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl h-full bg-surface-secondary border-l border-border flex flex-col overflow-hidden animate-slide-left">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-primary">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-neon-gold/10 text-neon-gold">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{diseaseDetail?.name}</h2>
                  <p className="text-xs text-text-muted">
                    Crop: {diseaseDetail?.crop_name} • Severity: {diseaseDetail?.severity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingDiseaseId(null)}
                className="p-2 rounded-xl bg-surface-tertiary text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingDiseaseDetail ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-neon-gold animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overview */}
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Clinical Description</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {diseaseDetail?.description || "No specific botanical description."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-xs font-semibold text-text-muted">Symptoms:</span>
                        <ul className="list-disc list-inside text-xs text-text-secondary mt-1 space-y-0.5">
                          {diseaseDetail?.symptoms?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-text-muted">Favorable Conditions:</span>
                        <ul className="list-disc list-inside text-xs text-text-secondary mt-1 space-y-0.5">
                          {diseaseDetail?.conditions?.map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Solutions Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Pill className="w-4 h-4 text-primary" />
                      Treatment Protocols ({diseaseDetail?.solutions?.length || 0})
                    </h3>

                    {diseaseDetail?.solutions?.length === 0 ? (
                      <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-xl text-xs">
                        No treatment protocols added yet for this disease. Edit disease to add treatments.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {diseaseDetail?.solutions?.map((sol: any) => (
                          <div
                            key={sol.id}
                            className="glass-card rounded-2xl p-5 border border-border space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className={clsx(
                                    "text-xs font-bold uppercase px-2.5 py-0.5 rounded-full",
                                    sol.farming_method === "organic"
                                      ? "bg-green-500/15 text-green-400 border border-green-500/30"
                                      : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                  )}
                                >
                                  {sol.farming_method}
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-tertiary text-text-secondary uppercase">
                                  {sol.solution_type}
                                </span>
                              </div>
                            </div>

                            <h4 className="text-base font-bold text-white mt-1">{sol.treatment_name}</h4>
                            <div className="text-xs text-primary font-semibold">Dosage: {sol.dosage}</div>
                            <p className="text-xs text-text-secondary leading-relaxed mt-2 pt-2 border-t border-border/50">
                              {sol.instructions}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── PEST DETAIL DRAWER ─── */}
      {inspectingPestId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-3xl h-full bg-surface-secondary border-l border-border flex flex-col overflow-hidden animate-slide-left">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-primary">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-neon-blue/10 text-neon-blue">
                  <Bug className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{pestDetail?.name}</h2>
                  <p className="text-xs text-text-muted">Crop: {pestDetail?.crop_name}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingPestId(null)}
                className="p-2 rounded-xl bg-surface-tertiary text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingPestDetail ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Pest Profile</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {pestDetail?.description || "No specific pest description."}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-xs font-semibold text-text-muted">Signs of Infestation:</span>
                        <ul className="list-disc list-inside text-xs text-text-secondary mt-1 space-y-0.5">
                          {pestDetail?.signs?.map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-text-muted">Affected Parts:</span>
                        <ul className="list-disc list-inside text-xs text-text-secondary mt-1 space-y-0.5">
                          {pestDetail?.affected_parts?.map((a: string, idx: number) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Solutions Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-neon-blue" />
                      Pest Control Treatments ({pestDetail?.solutions?.length || 0})
                    </h3>

                    {pestDetail?.solutions?.length === 0 ? (
                      <div className="p-8 text-center text-text-muted border border-dashed border-border rounded-xl text-xs">
                        No pest control measures configured yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pestDetail?.solutions?.map((sol: any) => (
                          <div
                            key={sol.id}
                            className="glass-card rounded-2xl p-5 border border-border space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={clsx(
                                  "text-xs font-bold uppercase px-2.5 py-0.5 rounded-full",
                                  sol.farming_method === "organic"
                                    ? "bg-green-500/15 text-green-400 border border-green-500/30"
                                    : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                )}
                              >
                                {sol.farming_method}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white mt-1">{sol.treatment_name}</h4>
                            <div className="text-xs text-neon-blue font-semibold">Dosage: {sol.dosage}</div>
                            <p className="text-xs text-text-secondary leading-relaxed mt-2 pt-2 border-t border-border/50">
                              {sol.instructions}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT DISEASE ─── */}
      {isDiseaseModalOpen && (
        <DiseaseModal
          plants={plants}
          disease={editingDisease}
          onClose={() => setIsDiseaseModalOpen(false)}
          onSave={(payload: any) => saveDiseaseMutation.mutate(payload)}
          isLoading={saveDiseaseMutation.isPending}
        />
      )}

      {/* ─── MODAL: CREATE / EDIT PEST ─── */}
      {isPestModalOpen && (
        <PestModal
          plants={plants}
          pest={editingPest}
          onClose={() => setIsPestModalOpen(false)}
          onSave={(payload: any) => savePestMutation.mutate(payload)}
          isLoading={savePestMutation.isPending}
        />
      )}
    </div>
  );
}

// ─── MODAL: DISEASE ─────────────────────────────────────────

function DiseaseModal({ plants, disease, onClose, onSave, isLoading }: { plants: any[]; disease?: any; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [plantId, setPlantId] = useState(disease?.plant_id || plants[0]?.id || "");
  const [name, setName] = useState(disease?.name || "");
  const [scientificName, setScientificName] = useState(disease?.scientific_name || "");
  const [severity, setSeverity] = useState(disease?.severity || "medium");
  const [symptoms, setSymptoms] = useState(disease?.symptoms?.join(", ") || "");
  const [conditions, setConditions] = useState(disease?.conditions?.join(", ") || "High humidity, temp > 28C");
  const [description, setDescription] = useState(disease?.description || "");
  const [imageUrl, setImageUrl] = useState(disease?.image_url || "");

  // Solutions array
  const [solutions, setSolutions] = useState<any[]>(
    disease?.solutions || [
      {
        farming_method: "organic",
        solution_type: "curative",
        treatment_name: "Neem Oil Extract / Copper Fungicide",
        dosage: "5ml per Liter of water",
        instructions: "Foliar spray in early morning or late evening.",
      },
    ]
  );

  const addSolutionRow = () => {
    setSolutions([
      ...solutions,
      {
        farming_method: "conventional",
        solution_type: "curative",
        treatment_name: "",
        dosage: "",
        instructions: "",
      },
    ]);
  };

  const removeSolutionRow = (idx: number) => {
    setSolutions(solutions.filter((_, i) => i !== idx));
  };

  const updateSolutionField = (idx: number, field: string, value: string) => {
    const updated = [...solutions];
    updated[idx][field] = value;
    setSolutions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      plant_id: plantId,
      name,
      scientific_name: scientificName || undefined,
      severity,
      symptoms: symptoms ? symptoms.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      conditions: conditions ? conditions.split(",").map((c: string) => c.trim()).filter(Boolean) : [],
      description: description || undefined,
      image_url: imageUrl || undefined,
      solutions: solutions.filter((s) => s.treatment_name && s.dosage),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-white">
            {disease ? "Edit Plant Disease" : "Add Plant Disease & Treatment Solutions"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {!disease && (
            <div>
              <label className="text-xs font-semibold text-text-secondary">Host Crop *</label>
              <select
                required
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {plants.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.common_name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Disease Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Early Blight, Anthracnose"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Severity *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Scientific Name / Pathogen</label>
            <input
              type="text"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="e.g. Alternaria solani"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Symptoms (comma-separated)</label>
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Brown concentric rings on lower leaves, yellow halos, leaf drop"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Favorable Weather Conditions</label>
            <input
              type="text"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="e.g. Warm temperature (24-30C), high humidity, prolonged leaf wetness"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Description & Diagnostic Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed pathogen behavior and impact..."
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          {/* Solutions Matrix */}
          <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" /> Treatment Solutions ({solutions.length})
              </span>
              <button
                type="button"
                onClick={addSolutionRow}
                className="text-xs font-semibold text-neon-gold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Solution
              </button>
            </div>

            {solutions.map((sol, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-secondary border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-muted uppercase">Solution #{idx + 1}</span>
                  {solutions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSolutionRow(idx)}
                      className="text-text-muted hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={sol.farming_method}
                    onChange={(e) => updateSolutionField(idx, "farming_method", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                  >
                    <option value="organic">Organic</option>
                    <option value="conventional">Conventional / Chemical</option>
                    <option value="integrated">Integrated</option>
                  </select>

                  <select
                    value={sol.solution_type}
                    onChange={(e) => updateSolutionField(idx, "solution_type", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                  >
                    <option value="curative">Curative Treatment</option>
                    <option value="preventive">Preventive Spray</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Treatment Name (e.g. Copper Hydroxide)"
                    value={sol.treatment_name}
                    onChange={(e) => updateSolutionField(idx, "treatment_name", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 2g / Liter)"
                    value={sol.dosage}
                    onChange={(e) => updateSolutionField(idx, "dosage", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Application instructions..."
                  value={sol.instructions}
                  onChange={(e) => updateSolutionField(idx, "instructions", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-tertiary text-xs font-semibold text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Disease Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MODAL: PEST ────────────────────────────────────────────

function PestModal({ plants, pest, onClose, onSave, isLoading }: { plants: any[]; pest?: any; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [plantId, setPlantId] = useState(pest?.plant_id || plants[0]?.id || "");
  const [name, setName] = useState(pest?.name || "");
  const [scientificName, setScientificName] = useState(pest?.scientific_name || "");
  const [signs, setSigns] = useState(pest?.signs?.join(", ") || "");
  const [affectedParts, setAffectedParts] = useState(pest?.affected_parts?.join(", ") || "Leaves, Stems, Fruits");
  const [description, setDescription] = useState(pest?.description || "");
  const [imageUrl, setImageUrl] = useState(pest?.image_url || "");

  const [solutions, setSolutions] = useState<any[]>(
    pest?.solutions || [
      {
        farming_method: "organic",
        treatment_name: "Sticky yellow traps & Neem oil spray",
        dosage: "5ml per Liter",
        instructions: "Install 15 traps per acre and spray neem oil weekly.",
      },
    ]
  );

  const addSolutionRow = () => {
    setSolutions([
      ...solutions,
      {
        farming_method: "conventional",
        treatment_name: "",
        dosage: "",
        instructions: "",
      },
    ]);
  };

  const removeSolutionRow = (idx: number) => {
    setSolutions(solutions.filter((_, i) => i !== idx));
  };

  const updateSolutionField = (idx: number, field: string, value: string) => {
    const updated = [...solutions];
    updated[idx][field] = value;
    setSolutions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      plant_id: plantId,
      name,
      scientific_name: scientificName || undefined,
      signs: signs ? signs.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
      affected_parts: affectedParts
        ? affectedParts.split(",").map((a: string) => a.trim()).filter(Boolean)
        : [],
      description: description || undefined,
      image_url: imageUrl || undefined,
      solutions: solutions.filter((s) => s.treatment_name && s.dosage),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-white">
            {pest ? "Edit Pest Profile" : "Add Plant Pest & Control Measures"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {!pest && (
            <div>
              <label className="text-xs font-semibold text-text-secondary">Host Crop *</label>
              <select
                required
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {plants.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.common_name} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Pest Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Whitefly, Fruit Borer, Aphids"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Scientific Name</label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="e.g. Bemisia tabaci"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Damage Signs (comma-separated)</label>
            <input
              type="text"
              value={signs}
              onChange={(e) => setSigns(e.target.value)}
              placeholder="e.g. Silvering of leaves, sooty mold, punctured fruit"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Affected Plant Parts</label>
            <input
              type="text"
              value={affectedParts}
              onChange={(e) => setAffectedParts(e.target.value)}
              placeholder="e.g. Tender shoots, leaves, flowers, fruit"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Life cycle, attack pattern, and economic threshold..."
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          {/* Pest Control Solutions */}
          <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neon-blue flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5" /> Pest Control Protocols ({solutions.length})
              </span>
              <button
                type="button"
                onClick={addSolutionRow}
                className="text-xs font-semibold text-neon-blue hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Control Action
              </button>
            </div>

            {solutions.map((sol, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-surface-secondary border border-border/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-text-muted uppercase">Protocol #{idx + 1}</span>
                  {solutions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSolutionRow(idx)}
                      className="text-text-muted hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={sol.farming_method}
                    onChange={(e) => updateSolutionField(idx, "farming_method", e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                  >
                    <option value="organic">Organic</option>
                    <option value="conventional">Conventional</option>
                    <option value="integrated">Integrated</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Treatment Name / Chemical"
                    value={sol.treatment_name}
                    onChange={(e) => updateSolutionField(idx, "treatment_name", e.target.value)}
                    className="col-span-2 px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Dosage (e.g. 1.5ml / Liter)"
                  value={sol.dosage}
                  onChange={(e) => updateSolutionField(idx, "dosage", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                />

                <textarea
                  rows={2}
                  placeholder="Instructions for application..."
                  value={sol.instructions}
                  onChange={(e) => updateSolutionField(idx, "instructions", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface-tertiary border border-border text-white text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-tertiary text-xs font-semibold text-text-secondary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Pest Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Sprout,
  Search,
  ChevronRight,
  X,
  Droplets,
  Layers,
  Scissors,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Thermometer,
  CloudRain,
  Info,
} from "lucide-react";
import { clsx } from "clsx";

export default function AdminMasterDataPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"plants" | "varieties">("plants");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedCropIdForVarieties, setSelectedCropIdForVarieties] = useState("");

  // Modals & Drawers state
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<any | null>(null);

  const [inspectingPlantId, setInspectingPlantId] = useState<string | null>(null);

  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<any | null>(null);

  const [isFertilizerModalOpen, setIsFertilizerModalOpen] = useState(false);
  const [targetStageIdForFertilizer, setTargetStageIdForFertilizer] = useState<string | null>(null);

  const [isPruningModalOpen, setIsPruningModalOpen] = useState(false);
  const [targetStageIdForPruning, setTargetStageIdForPruning] = useState<string | null>(null);

  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [editingVariety, setEditingVariety] = useState<any | null>(null);

  // Queries
  const { data: plantsData, isLoading: isLoadingPlants } = useQuery({
    queryKey: ["admin-plants"],
    queryFn: async () => {
      const res = await api.get("/admin/plants");
      return res.data?.data || res.data || [];
    },
  });

  const { data: varietiesData, isLoading: isLoadingVarieties } = useQuery({
    queryKey: ["admin-varieties", selectedCropIdForVarieties],
    queryFn: async () => {
      const url = selectedCropIdForVarieties
        ? `/admin/varieties?plant_id=${selectedCropIdForVarieties}`
        : "/admin/varieties";
      const res = await api.get(url);
      return res.data?.data || res.data || [];
    },
  });

  const { data: plantDetail, isLoading: isLoadingPlantDetail } = useQuery({
    queryKey: ["admin-plant-detail", inspectingPlantId],
    queryFn: async () => {
      if (!inspectingPlantId) return null;
      const res = await api.get(`/admin/plants/${inspectingPlantId}`);
      return res.data?.data || res.data;
    },
    enabled: !!inspectingPlantId,
  });

  // Mutations
  const savePlantMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingPlant?.id) {
        return await api.put(`/admin/plants/${editingPlant.id}`, payload);
      } else {
        return await api.post("/admin/plants", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setIsPlantModalOpen(false);
      setEditingPlant(null);
    },
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/plants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      if (inspectingPlantId) setInspectingPlantId(null);
    },
  });

  const saveStageMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingStage?.id) {
        return await api.put(`/admin/stages/${editingStage.id}`, payload);
      } else {
        return await api.post(`/admin/plants/${inspectingPlantId}/stages`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail", inspectingPlantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      setIsStageModalOpen(false);
      setEditingStage(null);
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      return await api.delete(`/admin/stages/${stageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail", inspectingPlantId] });
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
    },
  });

  const addFertilizerMutation = useMutation({
    mutationFn: async ({ stageId, payload }: { stageId: string; payload: any }) => {
      return await api.post(`/admin/stages/${stageId}/fertilizers`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail", inspectingPlantId] });
      setIsFertilizerModalOpen(false);
    },
  });

  const deleteFertilizerMutation = useMutation({
    mutationFn: async (recId: string) => {
      return await api.delete(`/admin/fertilizers/${recId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail", inspectingPlantId] });
    },
  });

  const addPruningMutation = useMutation({
    mutationFn: async ({ stageId, payload }: { stageId: string; payload: any }) => {
      return await api.post(`/admin/stages/${stageId}/pruning`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail", inspectingPlantId] });
      setIsPruningModalOpen(false);
    },
  });

  const deletePruningMutation = useMutation({
    mutationFn: async (guideId: string) => {
      return await api.delete(`/admin/pruning/${guideId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail", inspectingPlantId] });
    },
  });

  const saveVarietyMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingVariety?.id) {
        return await api.put(`/admin/varieties/${editingVariety.id}`, payload);
      } else {
        const plantId = payload.plant_id;
        return await api.post(`/admin/plants/${plantId}/varieties`, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-varieties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail"] });
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      setIsVarietyModalOpen(false);
      setEditingVariety(null);
    },
  });

  const deleteVarietyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/varieties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-varieties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-plant-detail"] });
    },
  });

  const plants = plantsData || [];
  const varieties = varietiesData || [];

  const filteredPlants = plants.filter((p: any) => {
    const matchesSearch =
      p.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.local_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(plants.map((p: any) => p.category).filter(Boolean)));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Crops, Stages & Varieties<span className="text-primary text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Build and manage botanical profiles, growth stage timelines, nutrient curves, and varieties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "plants" ? (
            <button
              onClick={() => {
                setEditingPlant(null);
                setIsPlantModalOpen(true);
              }}
              className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Crop
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingVariety(null);
                setIsVarietyModalOpen(true);
              }}
              className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Crop Variety
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("plants")}
          className={clsx(
            "flex items-center gap-2 pb-3.5 px-1 font-semibold text-sm border-b-2 transition-all",
            activeTab === "plants"
              ? "border-primary text-primary"
              : "border-transparent text-text-muted hover:text-white"
          )}
        >
          <Sprout className="w-4 h-4" />
          Crops & Growth Stages ({plants.length})
        </button>
        <button
          onClick={() => setActiveTab("varieties")}
          className={clsx(
            "flex items-center gap-2 pb-3.5 px-1 font-semibold text-sm border-b-2 transition-all",
            activeTab === "varieties"
              ? "border-neon-gold text-neon-gold"
              : "border-transparent text-text-muted hover:text-white"
          )}
        >
          <Layers className="w-4 h-4" />
          Crop Varieties ({varieties.length})
        </button>
      </div>

      {/* ─── TAB 1: CROPS & GROWTH STAGES ─── */}
      {activeTab === "plants" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search crops by common name, local name, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((c: any) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {isLoadingPlants ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : filteredPlants.length === 0 ? (
            <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
              No crops found matching your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPlants.map((plant: any) => (
                <div
                  key={plant.id}
                  className="glass-card-hover rounded-2xl p-5 border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {plant.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
                          {plant.common_name}
                        </h3>
                        {plant.local_name && (
                          <p className="text-xs text-text-muted italic">{plant.local_name}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPlant(plant);
                            setIsPlantModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-white transition-colors"
                          title="Edit Crop"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete crop "${plant.common_name}"?`)) {
                              deletePlantMutation.mutate(plant.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
                          title="Delete Crop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary line-clamp-2 mt-3">
                      {plant.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border text-xs text-text-muted">
                      <span className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {plant.stages_count} Stages
                      </span>
                      <span className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                        <Layers className="w-3.5 h-3.5 text-neon-gold" />
                        {plant.varieties_count} Varieties
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setInspectingPlantId(plant.id)}
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-surface-tertiary hover:bg-primary/15 hover:text-primary hover:border-primary/30 border border-border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <span>Configure Stages & Requirements</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: CROP VARIETIES ─── */}
      {activeTab === "varieties" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={selectedCropIdForVarieties}
              onChange={(e) => setSelectedCropIdForVarieties(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Parent Crops</option>
              {plants.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.common_name}
                </option>
              ))}
            </select>
          </div>

          {isLoadingVarieties ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="w-8 h-8 text-neon-gold animate-spin" />
            </div>
          ) : varieties.length === 0 ? (
            <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
              No crop varieties found.
            </div>
          ) : (
            <div className="glass-card rounded-2xl border border-border overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase font-bold text-text-muted bg-surface-secondary/40">
                    <th className="p-4">Variety Name</th>
                    <th className="p-4">Crop</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Climatic Envelope</th>
                    <th className="p-4">Expected Yield</th>
                    <th className="p-4">Soil & Season</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {varieties.map((v: any) => (
                    <tr key={v.id} className="hover:bg-surface-tertiary/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{v.variety_name}</div>
                        {v.scientific_name && (
                          <div className="text-xs text-text-muted italic">{v.scientific_name}</div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-primary">{v.crop_name}</td>
                      <td className="p-4 font-medium text-text-secondary">
                        {v.growth_duration_days} days
                      </td>
                      <td className="p-4 text-xs text-text-secondary space-y-0.5">
                        <div>
                          Temp: {v.optimal_temp_min ?? "?"}°C - {v.optimal_temp_max ?? "?"}°C
                        </div>
                        <div>Rainfall: {v.optimal_rainfall_mm ?? "?"} mm</div>
                        <div>pH: {v.optimal_ph_min ?? "?"} - {v.optimal_ph_max ?? "?"}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {v.expected_yield_per_acre_kg ? `${v.expected_yield_per_acre_kg} kg/acre` : "N/A"}
                      </td>
                      <td className="p-4 text-xs text-text-muted">
                        <div>Seasons: {v.planting_season?.join(", ") || "All Year"}</div>
                        <div>Soils: {v.compatible_soil_types?.join(", ") || "General"}</div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingVariety(v);
                              setIsVarietyModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete variety "${v.variety_name}"?`)) {
                                deleteVarietyMutation.mutate(v.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── STAGE BUILDER / CROP INSPECTOR DRAWER ─── */}
      {inspectingPlantId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-4xl h-full bg-surface-secondary border-l border-border flex flex-col overflow-hidden animate-slide-left">
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-primary">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Sprout className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {plantDetail?.common_name || "Crop"} Stages & Agronomic Requirements
                  </h2>
                  <p className="text-xs text-text-muted">
                    {plantDetail?.category} • {plantDetail?.stages?.length || 0} Growth Stages Configured
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setEditingStage(null);
                    setIsStageModalOpen(true);
                  }}
                  className="btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add Stage
                </button>
                <button
                  onClick={() => setInspectingPlantId(null)}
                  className="p-2 rounded-xl bg-surface-tertiary text-text-muted hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingPlantDetail ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : plantDetail?.stages?.length === 0 ? (
                <div className="p-12 text-center text-text-muted border border-dashed border-border rounded-2xl">
                  No stages defined for this crop. Click "Add Stage" to begin timeline configuration.
                </div>
              ) : (
                <div className="space-y-6">
                  {plantDetail?.stages?.map((stage: any, idx: number) => (
                    <div
                      key={stage.id}
                      className="glass-card rounded-2xl p-6 border border-border/80 space-y-5"
                    >
                      {/* Stage Head */}
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
                            {stage.stage_order || idx + 1}
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{stage.stage_name}</h3>
                            <span className="text-xs text-text-muted">
                              Day {stage.start_day} to Day {stage.end_day} (Duration: {stage.end_day - stage.start_day + 1} days)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingStage(stage);
                              setIsStageModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-white"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete stage "${stage.stage_name}"?`)) {
                                deleteStageMutation.mutate(stage.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-text-muted hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stage Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border">
                          <span className="font-bold text-primary flex items-center gap-1 mb-1">
                            <Droplets className="w-3.5 h-3.5" /> Water Requirements
                          </span>
                          {stage.water_req ? (
                            <div className="text-text-secondary space-y-1">
                              <div>Target: <strong>{stage.water_req.water_mm_per_day} mm/day</strong></div>
                              <div>Frequency: Every {stage.water_req.frequency_days} days</div>
                              <div>Drought Tolerance: {stage.water_req.drought_tolerance}</div>
                            </div>
                          ) : (
                            <span className="text-text-muted">Default curve</span>
                          )}
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border">
                          <span className="font-bold text-neon-gold flex items-center gap-1 mb-1">
                            <Layers className="w-3.5 h-3.5" /> Nutrient Curve (kg/acre)
                          </span>
                          {stage.nutrient_req ? (
                            <div className="text-text-secondary grid grid-cols-3 gap-2">
                              <div>N: <strong>{stage.nutrient_req.nitrogen_kg}</strong></div>
                              <div>P: <strong>{stage.nutrient_req.phosphorus_kg}</strong></div>
                              <div>K: <strong>{stage.nutrient_req.potassium_kg}</strong></div>
                            </div>
                          ) : (
                            <span className="text-text-muted">No nutrients assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Fertilizer Recommendations */}
                      <div className="space-y-2.5 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-neon-green" /> Fertilizer Schedule (
                            {stage.fertilizer_recommendations?.length || 0})
                          </span>
                          <button
                            onClick={() => {
                              setTargetStageIdForFertilizer(stage.id);
                              setIsFertilizerModalOpen(true);
                            }}
                            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Fertilizer Rec
                          </button>
                        </div>

                        {stage.fertilizer_recommendations?.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {stage.fertilizer_recommendations.map((rec: any) => (
                              <div
                                key={rec.id}
                                className="p-2.5 rounded-xl bg-surface-tertiary/40 border border-border flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white">{rec.fertilizer_name}</span>
                                  <span className="ml-2 text-text-muted">({rec.farming_method})</span>
                                  <div className="text-[11px] text-text-secondary mt-0.5">
                                    Rate: {rec.application_rate_per_acre_kg} kg/acre
                                  </div>
                                </div>
                                <button
                                  onClick={() => deleteFertilizerMutation.mutate(rec.id)}
                                  className="text-text-muted hover:text-red-400 p-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pruning Guides */}
                      <div className="space-y-2.5 pt-2 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                            <Scissors className="w-3.5 h-3.5 text-neon-purple" /> Pruning Guides (
                            {stage.pruning_guides?.length || 0})
                          </span>
                          <button
                            onClick={() => {
                              setTargetStageIdForPruning(stage.id);
                              setIsPruningModalOpen(true);
                            }}
                            className="text-xs font-semibold text-neon-purple hover:underline flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Pruning Guide
                          </button>
                        </div>

                        {stage.pruning_guides?.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {stage.pruning_guides.map((guide: any) => (
                              <div
                                key={guide.id}
                                className="p-2.5 rounded-xl bg-surface-tertiary/40 border border-border flex items-start justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <span className="font-bold text-neon-purple uppercase text-[11px]">
                                    {guide.pruning_type}
                                  </span>
                                  <p className="text-text-secondary text-[11px] line-clamp-2">
                                    {guide.pruning_method}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deletePruningMutation.mutate(guide.id)}
                                  className="text-text-muted hover:text-red-400 p-1 ml-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CREATE / EDIT PLANT ─── */}
      {isPlantModalOpen && (
        <PlantModal
          plant={editingPlant}
          onClose={() => setIsPlantModalOpen(false)}
          onSave={(payload: any) => savePlantMutation.mutate(payload)}
          isLoading={savePlantMutation.isPending}
        />
      )}

      {/* ─── MODAL: CREATE / EDIT STAGE ─── */}
      {isStageModalOpen && (
        <StageModal
          stage={editingStage}
          onClose={() => setIsStageModalOpen(false)}
          onSave={(payload: any) => saveStageMutation.mutate(payload)}
          isLoading={saveStageMutation.isPending}
        />
      )}

      {/* ─── MODAL: ADD FERTILIZER REC ─── */}
      {isFertilizerModalOpen && targetStageIdForFertilizer && (
        <FertilizerModal
          stageId={targetStageIdForFertilizer}
          onClose={() => setIsFertilizerModalOpen(false)}
          onSave={(payload: any) =>
            addFertilizerMutation.mutate({ stageId: targetStageIdForFertilizer, payload })
          }
          isLoading={addFertilizerMutation.isPending}
        />
      )}

      {/* ─── MODAL: ADD PRUNING GUIDE ─── */}
      {isPruningModalOpen && targetStageIdForPruning && (
        <PruningModal
          stageId={targetStageIdForPruning}
          onClose={() => setIsPruningModalOpen(false)}
          onSave={(payload: any) =>
            addPruningMutation.mutate({ stageId: targetStageIdForPruning, payload })
          }
          isLoading={addPruningMutation.isPending}
        />
      )}

      {/* ─── MODAL: CREATE / EDIT VARIETY ─── */}
      {isVarietyModalOpen && (
        <VarietyModal
          plants={plants}
          variety={editingVariety}
          onClose={() => setIsVarietyModalOpen(false)}
          onSave={(payload: any) => saveVarietyMutation.mutate(payload)}
          isLoading={saveVarietyMutation.isPending}
        />
      )}
    </div>
  );
}

// ─── MODAL SUB-COMPONENTS ───────────────────────────────────

function PlantModal({ plant, onClose, onSave, isLoading }: { plant?: any; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [commonName, setCommonName] = useState(plant?.common_name || "");
  const [localName, setLocalName] = useState(plant?.local_name || "");
  const [category, setCategory] = useState(plant?.category || "Vegetables");
  const [subCategory, setSubCategory] = useState(plant?.sub_category || "");
  const [description, setDescription] = useState(plant?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      common_name: commonName,
      local_name: localName || undefined,
      category,
      sub_category: subCategory || undefined,
      description: description || undefined,
      is_active: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {plant ? "Edit Crop / Plant" : "Add New Crop / Plant"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div>
            <label className="text-xs font-semibold text-text-secondary">Common Name *</label>
            <input
              type="text"
              required
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              placeholder="e.g. Tomato, Paddy Rice, Chilli"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Local / Sinhala / Tamil Name</label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="e.g. තක්කාලි / தக்காளி"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Vegetables, Fruits, Grains..."
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Sub Category</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. Solanaceae, Legumes"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Botanical notes, cultivation conditions..."
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              Save Crop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StageModal({ stage, onClose, onSave, isLoading }: { stage?: any; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [stageName, setStageName] = useState(stage?.stage_name || "");
  const [stageOrder, setStageOrder] = useState(stage?.stage_order || 1);
  const [startDay, setStartDay] = useState(stage?.start_day || 1);
  const [endDay, setEndDay] = useState(stage?.end_day || 15);
  const [description, setDescription] = useState(stage?.description || "");
  const [keyIndicators, setKeyIndicators] = useState(stage?.key_indicators || "");
  const [criticalActions, setCriticalActions] = useState(stage?.critical_actions || "");
  const [watchFor, setWatchFor] = useState(stage?.watch_for || "");

  // Water
  const [waterMm, setWaterMm] = useState(stage?.water_req?.water_mm_per_day || 5);
  const [waterFreq, setWaterFreq] = useState(stage?.water_req?.frequency_days || 1);
  const [droughtTol, setDroughtTol] = useState(stage?.water_req?.drought_tolerance || "moderate");

  // Nutrients
  const [nitro, setNitro] = useState(stage?.nutrient_req?.nitrogen_kg || 10);
  const [phos, setPhos] = useState(stage?.nutrient_req?.phosphorus_kg || 5);
  const [potas, setPotas] = useState(stage?.nutrient_req?.potassium_kg || 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      stage_name: stageName,
      stage_order: Number(stageOrder),
      start_day: Number(startDay),
      end_day: Number(endDay),
      description: description || undefined,
      key_indicators: keyIndicators || undefined,
      critical_actions: criticalActions || undefined,
      watch_for: watchFor || undefined,
      water_req: {
        water_mm_per_day: Number(waterMm),
        frequency_days: Number(waterFreq),
        drought_tolerance: droughtTol,
      },
      nutrient_req: {
        nitrogen_kg: Number(nitro),
        phosphorus_kg: Number(phos),
        potassium_kg: Number(potas),
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {stage ? "Edit Growth Stage" : "Add Growth Stage"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-text-secondary">Stage Name *</label>
              <input
                type="text"
                required
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
                placeholder="e.g. Vegetative Stage, Flowering"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Order *</label>
              <input
                type="number"
                required
                value={stageOrder}
                onChange={(e) => setStageOrder(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Start Day *</label>
              <input
                type="number"
                required
                value={startDay}
                onChange={(e) => setStartDay(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">End Day *</label>
              <input
                type="number"
                required
                value={endDay}
                onChange={(e) => setEndDay(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Water Requirements Fieldset */}
          <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border space-y-2">
            <span className="text-xs font-bold text-primary flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" /> Water Targets
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-text-muted">mm/day</label>
                <input
                  type="number"
                  step="0.1"
                  value={waterMm}
                  onChange={(e) => setWaterMm(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">Freq (days)</label>
                <input
                  type="number"
                  value={waterFreq}
                  onChange={(e) => setWaterFreq(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">Drought Tol.</label>
                <select
                  value={droughtTol}
                  onChange={(e) => setDroughtTol(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1.5 rounded-lg bg-surface-secondary border border-border text-white text-xs"
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nutrients Fieldset */}
          <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border space-y-2">
            <span className="text-xs font-bold text-neon-gold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Nutrient Targets (kg/acre)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-text-muted">N (Nitrogen)</label>
                <input
                  type="number"
                  step="0.1"
                  value={nitro}
                  onChange={(e) => setNitro(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">P (Phosphorus)</label>
                <input
                  type="number"
                  step="0.1"
                  value={phos}
                  onChange={(e) => setPhos(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">K (Potassium)</label>
                <input
                  type="number"
                  step="0.1"
                  value={potas}
                  onChange={(e) => setPotas(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Key Indicators</label>
            <input
              type="text"
              value={keyIndicators}
              onChange={(e) => setKeyIndicators(e.target.value)}
              placeholder="e.g. First 4-6 true leaves appear, root establishment"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Critical Actions</label>
            <textarea
              rows={2}
              value={criticalActions}
              onChange={(e) => setCriticalActions(e.target.value)}
              placeholder="e.g. Apply base fertilizer, weed control"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
              Save Stage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FertilizerModal({ stageId, onClose, onSave, isLoading }: { stageId: string; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [farmingMethod, setFarmingMethod] = useState("organic");
  const [fertilizerName, setFertilizerName] = useState("");
  const [rate, setRate] = useState(15);
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      farming_method: farmingMethod,
      fertilizer_name: fertilizerName,
      application_rate_per_acre_kg: Number(rate),
      instructions: instructions || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Fertilizer Recommendation</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div>
            <label className="text-xs font-semibold text-text-secondary">Farming Method *</label>
            <select
              value={farmingMethod}
              onChange={(e) => setFarmingMethod(e.target.value)}
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            >
              <option value="organic">Organic</option>
              <option value="conventional">Conventional / Inorganic</option>
              <option value="integrated">Integrated</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Fertilizer Name *</label>
            <input
              type="text"
              required
              value={fertilizerName}
              onChange={(e) => setFertilizerName(e.target.value)}
              placeholder="e.g. Compost Tea, Urea, TSP, NPK 15-15-15"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Application Rate (kg / acre) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Instructions</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Apply around drip line, avoid touching stem..."
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
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
              Add Recommendation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PruningModal({ stageId, onClose, onSave, isLoading }: { stageId: string; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [pruningType, setPruningType] = useState("desuckering");
  const [pruningMethod, setPruningMethod] = useState("");
  const [triggerDay, setTriggerDay] = useState(0);
  const [frequencyDays, setFrequencyDays] = useState(7);
  const [toolsNeeded, setToolsNeeded] = useState("Pruning shears / sterilized blade");
  const [importance, setImportance] = useState("recommended");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      pruning_type: pruningType,
      pruning_method: pruningMethod,
      trigger_day: Number(triggerDay),
      frequency_days: Number(frequencyDays),
      tools_needed: toolsNeeded || undefined,
      importance,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Pruning Guide</h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Pruning Type *</label>
              <select
                value={pruningType}
                onChange={(e) => setPruningType(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
              >
                <option value="pinching">Pinching</option>
                <option value="desuckering">Desuckering / Lateral removal</option>
                <option value="topping">Topping / Apical pruning</option>
                <option value="thinning">Thinning</option>
                <option value="leaf_removal">Lower Leaf Removal</option>
                <option value="sanitization">Sanitization</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Importance</label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
              >
                <option value="critical">Critical</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Method & Instructions *</label>
            <textarea
              rows={3}
              required
              value={pruningMethod}
              onChange={(e) => setPruningMethod(e.target.value)}
              placeholder="Step by step pruning actions to execute..."
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Offset Day</label>
              <input
                type="number"
                value={triggerDay}
                onChange={(e) => setTriggerDay(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Repeat every (days)</label>
              <input
                type="number"
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Tools Needed</label>
            <input
              type="text"
              value={toolsNeeded}
              onChange={(e) => setToolsNeeded(e.target.value)}
              placeholder="e.g. Pruning shears, 70% alcohol sterilizer"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
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
              Save Guide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function VarietyModal({ plants, variety, onClose, onSave, isLoading }: { plants: any[]; variety?: any; onClose: () => void; onSave: (payload: any) => void; isLoading?: boolean }) {
  const [plantId, setPlantId] = useState(variety?.plant_id || plants[0]?.id || "");
  const [varietyName, setVarietyName] = useState(variety?.variety_name || "");
  const [scientificName, setScientificName] = useState(variety?.scientific_name || "");
  const [growthDays, setGrowthDays] = useState(variety?.growth_duration_days || 90);
  const [seasons, setSeasons] = useState(variety?.planting_season?.join(", ") || "Maha, Yala");
  const [tempMin, setTempMin] = useState(variety?.optimal_temp_min ?? 22);
  const [tempMax, setTempMax] = useState(variety?.optimal_temp_max ?? 32);
  const [rainfall, setRainfall] = useState(variety?.optimal_rainfall_mm ?? 1200);
  const [phMin, setPhMin] = useState(variety?.optimal_ph_min ?? 6.0);
  const [phMax, setPhMax] = useState(variety?.optimal_ph_max ?? 7.0);
  const [yieldPerAcre, setYieldPerAcre] = useState(variety?.expected_yield_per_acre_kg ?? 5000);
  const [soilTypes, setSoilTypes] = useState(variety?.compatible_soil_types?.join(", ") || "Red Yellow Podzolic, Alluvial");
  const [description, setDescription] = useState(variety?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      plant_id: plantId,
      variety_name: varietyName,
      scientific_name: scientificName || undefined,
      growth_duration_days: Number(growthDays),
      planting_season: seasons ? seasons.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
      optimal_temp_min: tempMin !== "" ? Number(tempMin) : undefined,
      optimal_temp_max: tempMax !== "" ? Number(tempMax) : undefined,
      optimal_rainfall_mm: rainfall !== "" ? Number(rainfall) : undefined,
      optimal_ph_min: phMin !== "" ? Number(phMin) : undefined,
      optimal_ph_max: phMax !== "" ? Number(phMax) : undefined,
      expected_yield_per_acre_kg: yieldPerAcre !== "" ? Number(yieldPerAcre) : undefined,
      compatible_soil_types: soilTypes ? soilTypes.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
      description: description || undefined,
      is_active: true,
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card max-w-2xl w-full p-6 rounded-2xl border border-border animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {variety ? "Edit Crop Variety" : "Add Crop Variety"}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-sm">
          {!variety && (
            <div>
              <label className="text-xs font-semibold text-text-secondary">Parent Crop *</label>
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
              <label className="text-xs font-semibold text-text-secondary">Variety Name *</label>
              <input
                type="text"
                required
                value={varietyName}
                onChange={(e) => setVarietyName(e.target.value)}
                placeholder="e.g. Padma, Thilina, MI-2"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Scientific Name</label>
              <input
                type="text"
                value={scientificName}
                onChange={(e) => setScientificName(e.target.value)}
                placeholder="e.g. Solanum lycopersicum"
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary">Total Growth Duration (Days) *</label>
              <input
                type="number"
                required
                value={growthDays}
                onChange={(e) => setGrowthDays(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary">Expected Yield (kg / acre)</label>
              <input
                type="number"
                value={yieldPerAcre}
                onChange={(e) => setYieldPerAcre(e.target.value)}
                className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Climatic Envelope */}
          <div className="p-3.5 rounded-xl bg-surface-tertiary/60 border border-border space-y-2">
            <span className="text-xs font-bold text-neon-gold flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" /> Optimal Climate & Soil Envelope
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-text-muted">Temp Min (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempMin}
                  onChange={(e) => setTempMin(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">Temp Max (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempMax}
                  onChange={(e) => setTempMax(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">Rainfall (mm)</label>
                <input
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <label className="text-[11px] text-text-muted">Soil pH Min</label>
                <input
                  type="number"
                  step="0.1"
                  value={phMin}
                  onChange={(e) => setPhMin(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted">Soil pH Max</label>
                <input
                  type="number"
                  step="0.1"
                  value={phMax}
                  onChange={(e) => setPhMax(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-surface-secondary border border-border text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Planting Seasons (comma-separated)</label>
            <input
              type="text"
              value={seasons}
              onChange={(e) => setSeasons(e.target.value)}
              placeholder="e.g. Maha, Yala, Intermediate"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary">Compatible Soil Types (comma-separated)</label>
            <input
              type="text"
              value={soilTypes}
              onChange={(e) => setSoilTypes(e.target.value)}
              placeholder="e.g. Sandy Loam, Clay Loam, Reddish Brown Earth"
              className="w-full mt-1 px-3.5 py-2 rounded-xl bg-surface-tertiary border border-border text-white text-xs"
            />
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
              Save Variety
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

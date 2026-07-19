"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import { Loader2, Plus, Edit2, Trash2, Sprout, Bug } from "lucide-react";
import { clsx } from "clsx";

export default function AdminMasterDataPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"plants" | "diseases">("plants");

  const { data: plants, isLoading: isLoadingPlants } = useQuery({
    queryKey: ["admin-plants"],
    queryFn: async () => {
      const res = await api.get("/projects/plants");
      return res.data;
    },
    enabled: activeTab === "plants"
  });

  const { data: diseases, isLoading: isLoadingDiseases } = useQuery({
    queryKey: ["admin-diseases"],
    queryFn: async () => {
      const res = await api.get("/disease/search?q=");
      return res.data;
    },
    enabled: activeTab === "diseases"
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/plants/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-plants"] })
  });

  const deleteDiseaseMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/diseases/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-diseases"] })
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Master Data<span className="text-green-400 text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Manage core agricultural datasets.</p>
        </div>
        <button className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New {activeTab === "plants" ? "Crop" : "Disease"}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("plants")}
          className={clsx(
            "flex items-center gap-2 pb-4 px-2 font-medium border-b-2 transition-colors",
            activeTab === "plants"
              ? "border-green-500 text-green-400"
              : "border-transparent text-text-muted hover:text-text-secondary"
          )}
        >
          <Sprout className="w-4 h-4" />
          Crops &amp; Plants
        </button>
        <button
          onClick={() => setActiveTab("diseases")}
          className={clsx(
            "flex items-center gap-2 pb-4 px-2 font-medium border-b-2 transition-colors",
            activeTab === "diseases"
              ? "border-red-500 text-red-400"
              : "border-transparent text-text-muted hover:text-text-secondary"
          )}
        >
          <Bug className="w-4 h-4" />
          Diseases &amp; Pests
        </button>
      </div>

      {/* Content */}
      <div className="glass-card rounded-3xl p-6 min-h-[400px] animate-slide-up">
        {activeTab === "plants" && (
          isLoadingPlants ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants?.map((plant: any) => (
                <div key={plant.id} className="glass-card-hover rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{plant.common_name}</h3>
                    <div className="flex gap-2">
                      <button className="text-text-muted hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete plant?")) deletePlantMutation.mutate(plant.id); }}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted italic">{plant.scientific_name}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-surface-tertiary rounded text-xs font-medium text-text-secondary">{plant.category}</span>
                    <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-medium">{plant.growth_duration_days} days</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "diseases" && (
          isLoadingDiseases ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diseases?.map((disease: any) => (
                <div key={disease.id} className="glass-card-hover rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white">{disease.name}</h3>
                    <div className="flex gap-2">
                      <button className="text-text-muted hover:text-blue-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete disease?")) deleteDiseaseMutation.mutate(disease.id); }}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">{disease.description}</p>
                  <span className={clsx(
                    "px-2 py-1 rounded text-xs font-bold uppercase border",
                    disease.severity === 'high'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  )}>
                    {disease.severity} Severity
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import { Loader2, Plus, Edit2, Trash2, Sprout, Bug } from "lucide-react";
import Modal from "@/components/ui/Modal";

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
      // Assuming a generic fetch all diseases endpoint exists or search with empty query
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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Master Data</h1>
          <p className="text-slate-500 text-sm">Manage core agricultural datasets.</p>
        </div>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add New {activeTab === "plants" ? "Crop" : "Disease"}
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("plants")}
          className={`flex items-center gap-2 pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === "plants" ? "border-green-600 text-green-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Sprout className="w-4 h-4" />
          Crops & Plants
        </button>
        <button 
          onClick={() => setActiveTab("diseases")}
          className={`flex items-center gap-2 pb-4 px-2 font-medium border-b-2 transition-colors ${activeTab === "diseases" ? "border-green-600 text-green-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Bug className="w-4 h-4" />
          Diseases & Pests
        </button>
      </div>

      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[400px]">
        {activeTab === "plants" && (
          isLoadingPlants ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants?.map((plant: any) => (
                <div key={plant.id} className="border border-slate-200 rounded-2xl p-4 hover:border-green-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{plant.common_name}</h3>
                    <div className="flex gap-2">
                      <button className="text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={() => { if(confirm("Delete plant?")) deletePlantMutation.mutate(plant.id); }} 
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{plant.scientific_name}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{plant.category}</span>
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600">{plant.growth_duration_days} days</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "diseases" && (
          isLoadingDiseases ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diseases?.map((disease: any) => (
                <div key={disease.id} className="border border-slate-200 rounded-2xl p-4 hover:border-red-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800">{disease.name}</h3>
                    <div className="flex gap-2">
                      <button className="text-slate-400 hover:text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={() => { if(confirm("Delete disease?")) deleteDiseaseMutation.mutate(disease.id); }} 
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{disease.description}</p>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${disease.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
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

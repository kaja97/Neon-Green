"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Plus, Edit2, Trash2, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "../ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const landSchema = z.object({
  location_id: z.string().min(1, "Location is required"),
  total_area: z.number().min(0.1, "Area must be greater than 0"),
  area_unit: z.string().min(1, "Unit is required"),
  soil_type: z.string().optional(),
  irrigation_type: z.string().optional(),
});

type LandFormValues = z.infer<typeof landSchema>;

const inputClass =
  "w-full px-4 py-2 bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

export default function LandSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<any>(null);

  const { data: lands, isLoading: landsLoading } = useQuery({
    queryKey: ["farmerLand"],
    queryFn: async () => {
      const res = await api.get("/farmer/land");
      return res.data.data;
    },
  });

  const { data: locations, isLoading: locsLoading } = useQuery({
    queryKey: ["farmerLocations"],
    queryFn: async () => {
      const res = await api.get("/farmer/locations");
      return res.data.data;
    },
  });

  const form = useForm<LandFormValues>({
    resolver: zodResolver(landSchema),
    defaultValues: {
      location_id: "",
      total_area: 1,
      area_unit: "acres",
      soil_type: "",
      irrigation_type: "",
    },
  });

  const handleOpenModal = (land: any = null) => {
    if (land) {
      setEditingLand(land);
      form.reset({
        location_id: land.location_id,
        total_area: land.total_area,
        area_unit: land.area_unit,
        soil_type: land.soil_type || "",
        irrigation_type: land.irrigation_type || "",
      });
    } else {
      setEditingLand(null);
      form.reset({
        location_id: locations?.[0]?.id || "",
        total_area: 1,
        area_unit: "acres",
        soil_type: "",
        irrigation_type: "",
      });
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: LandFormValues) => {
      if (editingLand) {
        await api.put(`/farmer/land/${editingLand.id}`, data);
      } else {
        await api.post("/farmer/land", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerLand"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      alert("Failed to save land details: " + (err as any).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/farmer/land/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerLand"] });
    },
    onError: (err) => {
      alert("Failed to delete. Ensure it has no active projects. " + (err as any).message);
    }
  });

  const onSubmit = (data: LandFormValues) => {
    saveMutation.mutate(data);
  };

  if (landsLoading || locsLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Land & Soil Details</h2>
        <button
          onClick={() => {
            if (!locations || locations.length === 0) {
              alert("Please add a Location first before adding land details.");
              return;
            }
            handleOpenModal();
          }}
          className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl font-semibold hover:bg-green-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Land
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lands?.length === 0 ? (
          <p className="text-text-muted text-sm col-span-full">No land details added yet.</p>
        ) : (
          lands?.map((land: any) => {
            const locName = locations?.find((l: any) => l.id === land.location_id)?.name || "Unknown Location";
            return (
              <div key={land.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-green-500/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sprout className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white">{land.total_area} {land.area_unit}</h3>
                  </div>
                  <p className="text-sm font-medium text-text-secondary mb-2">Location: {locName}</p>
                  <div className="flex gap-2 flex-wrap">
                    {land.soil_type && <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md">Soil: {land.soil_type}</span>}
                    {land.irrigation_type && <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md">Irrigation: {land.irrigation_type}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border justify-end">
                  <button
                    onClick={() => handleOpenModal(land)}
                    className="p-2 text-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this land detail?")) {
                        deleteMutation.mutate(land.id);
                      }
                    }}
                    className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLand ? "Edit Land Details" : "New Land Detail"}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Location</label>
            <select {...form.register("location_id")} className={inputClass}>
              <option value="">Select a location...</option>
              {locations?.map((loc: any) => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
            {form.formState.errors.location_id && <p className="text-red-400 text-xs">{form.formState.errors.location_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Area</label>
              <input type="number" step="any" {...form.register("total_area", { valueAsNumber: true })} className={inputClass} />
              {form.formState.errors.total_area && <p className="text-red-400 text-xs">{form.formState.errors.total_area.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Unit</label>
              <select {...form.register("area_unit")} className={inputClass}>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="perches">Perches</option>
                <option value="sq_meters">Sq Meters</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Soil Type (Optional)</label>
            <select {...form.register("soil_type")} className={inputClass}>
              <option value="">-- Select Soil Type --</option>
              <option value="Loam (Generic)">Loam (Generic / Default)</option>
              <option value="Sandy Loam">Sandy Loam</option>
              <option value="Clay Loam">Clay Loam</option>
              <option value="Silt Loam">Silt Loam</option>
              <option value="Reddish Brown Earths">Reddish Brown Earths (RBE - Dry Zone)</option>
              <option value="Low Humic Gley">Low Humic Gley (LHG - Valleys)</option>
              <option value="Red Yellow Podzolic">Red Yellow Podzolic (RYP - Wet Zone)</option>
              <option value="Non-Calcic Brown">Non-Calcic Brown (Intermediate/Dry Zone)</option>
              <option value="Red Yellow Latosols">Red Yellow Latosols (North/North-West)</option>
              <option value="Alluvial Soils">Alluvial Soils (River Valleys)</option>
              <option value="Sandy Regosols">Sandy Regosols (Coastal Sands)</option>
              <option value="Immature Brown Loams">Immature Brown Loams (Hilly Areas)</option>
              <option value="Bog and Half-Bog Soils">Bog and Half-Bog Soils (Wet Zone Marshes)</option>
              <option value="Grumusols / Clay">Grumusols (Clay / Black Cotton Soil)</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-secondary">Irrigation Type (Optional)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Drip", "Sprinkler", "Surface", "Rain-fed", "Manual", "Center Pivot"].map((type) => {
                const currentValue = form.watch("irrigation_type") || "";
                const selected = currentValue.split(",").map(s => s.trim()).filter(Boolean);
                const isSelected = selected.includes(type);
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        form.setValue("irrigation_type", selected.filter(t => t !== type).join(", "));
                      } else {
                        form.setValue("irrigation_type", [...selected, type].join(", "));
                      }
                    }}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-sm font-semibold transition-all",
                      isSelected
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        : "bg-surface-tertiary border-border text-text-secondary hover:border-blue-500/30"
                    )}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {/* Hidden input to register with form */}
            <input type="hidden" {...form.register("irrigation_type")} />
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Land Details"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

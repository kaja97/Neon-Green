"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Plus, Edit2, Trash2, Sprout } from "lucide-react";
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
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Land & Soil Details</h2>
        <button
          onClick={() => {
            if (!locations || locations.length === 0) {
              alert("Please add a Location first before adding land details.");
              return;
            }
            handleOpenModal();
          }}
          className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-semibold hover:bg-green-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Land
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lands?.length === 0 ? (
          <p className="text-slate-500 text-sm col-span-full">No land details added yet.</p>
        ) : (
          lands?.map((land: any) => {
            const locName = locations?.find((l: any) => l.id === land.location_id)?.name || "Unknown Location";
            return (
              <div key={land.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-green-300 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-800">{land.total_area} {land.area_unit}</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Location: {locName}</p>
                  <div className="flex gap-2">
                    {land.soil_type && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md">Soil: {land.soil_type}</span>}
                    {land.irrigation_type && <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md">Irrigation: {land.irrigation_type}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 justify-end">
                  <button
                    onClick={() => handleOpenModal(land)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this land detail?")) {
                        deleteMutation.mutate(land.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
            <label className="text-sm font-medium text-slate-300">Location</label>
            <select
              {...form.register("location_id")}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" className="bg-slate-800 text-white">Select a location...</option>
              {locations?.map((loc: any) => (
                <option key={loc.id} value={loc.id} className="bg-slate-800 text-white">{loc.name}</option>
              ))}
            </select>
            {form.formState.errors.location_id && <p className="text-red-500 text-xs">{form.formState.errors.location_id.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Area</label>
              <input
                type="number"
                step="any"
                {...form.register("total_area", { valueAsNumber: true })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {form.formState.errors.total_area && <p className="text-red-500 text-xs">{form.formState.errors.total_area.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Unit</label>
              <select
                {...form.register("area_unit")}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="acres" className="bg-slate-800 text-white">Acres</option>
                <option value="hectares" className="bg-slate-800 text-white">Hectares</option>
                <option value="perches" className="bg-slate-800 text-white">Perches</option>
                <option value="sq_meters" className="bg-slate-800 text-white">Sq Meters</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Soil Type (Optional)</label>
            <select
              {...form.register("soil_type")}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="" className="bg-slate-800 text-white">-- Select Soil Type --</option>
              <option value="Loam (Generic)" className="bg-slate-800 text-white">Loam (Generic / Default)</option>
              <option value="Sandy Loam" className="bg-slate-800 text-white">Sandy Loam</option>
              <option value="Clay Loam" className="bg-slate-800 text-white">Clay Loam</option>
              <option value="Silt Loam" className="bg-slate-800 text-white">Silt Loam</option>
              <option value="Reddish Brown Earths" className="bg-slate-800 text-white">Reddish Brown Earths (RBE - Dry Zone)</option>
              <option value="Low Humic Gley" className="bg-slate-800 text-white">Low Humic Gley (LHG - Valleys)</option>
              <option value="Red Yellow Podzolic" className="bg-slate-800 text-white">Red Yellow Podzolic (RYP - Wet Zone)</option>
              <option value="Non-Calcic Brown" className="bg-slate-800 text-white">Non-Calcic Brown (Intermediate/Dry Zone)</option>
              <option value="Red Yellow Latosols" className="bg-slate-800 text-white">Red Yellow Latosols (North/North-West)</option>
              <option value="Alluvial Soils" className="bg-slate-800 text-white">Alluvial Soils (River Valleys)</option>
              <option value="Sandy Regosols" className="bg-slate-800 text-white">Sandy Regosols (Coastal Sands)</option>
              <option value="Immature Brown Loams" className="bg-slate-800 text-white">Immature Brown Loams (Hilly Areas)</option>
              <option value="Bog and Half-Bog Soils" className="bg-slate-800 text-white">Bog and Half-Bog Soils (Wet Zone Marshes)</option>
              <option value="Grumusols / Clay" className="bg-slate-800 text-white">Grumusols (Clay / Black Cotton Soil)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Irrigation Type (Optional)</label>
            <input
              {...form.register("irrigation_type")}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Drip, Sprinkler, Rain-fed"
            />
          </div>
          
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:bg-green-700 transition-all flex justify-center mt-6"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Land Details"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

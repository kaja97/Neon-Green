"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const locationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  district: z.string().min(2, "District is required"),
  address: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  is_primary: z.boolean(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

const inputClass =
  "w-full px-4 py-2 bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

export default function LocationSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  const { data: locations, isLoading } = useQuery({
    queryKey: ["farmerLocations"],
    queryFn: async () => {
      const res = await api.get("/farmer/locations");
      return res.data.data;
    },
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      district: "",
      address: "",
      latitude: 7.8731,
      longitude: 80.7718,
      is_primary: false,
    },
  });

  const handleOpenModal = (loc: any = null) => {
    if (loc) {
      setEditingLocation(loc);
      form.reset({
        name: loc.name,
        district: loc.district,
        address: loc.address || "",
        latitude: loc.latitude,
        longitude: loc.longitude,
        is_primary: loc.is_primary,
      });
    } else {
      setEditingLocation(null);
      form.reset({
        name: "",
        district: "",
        address: "",
        latitude: 7.8731,
        longitude: 80.7718,
        is_primary: false,
      });
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      if (editingLocation) {
        await api.put(`/farmer/locations/${editingLocation.id}`, data);
      } else {
        await api.post("/farmer/locations", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerLocations"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      alert("Failed to save location: " + (err as any).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/farmer/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerLocations"] });
    },
    onError: (err) => {
      alert("Failed to delete. Ensure it has no active projects. " + (err as any).message);
    }
  });

  const onSubmit = (data: LocationFormValues) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Farm Locations</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl font-semibold hover:bg-green-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations?.length === 0 ? (
          <p className="text-text-muted text-sm col-span-full">No locations added yet.</p>
        ) : (
          locations?.map((loc: any) => (
            <div key={loc.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-green-500/20 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold text-white">{loc.name}</h3>
                  {loc.is_primary && (
                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium border border-green-500/20">Primary</span>
                  )}
                </div>
                <p className="text-sm text-text-muted mb-1">{loc.district}</p>
                {loc.address && <p className="text-xs text-text-muted truncate">{loc.address}</p>}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border justify-end">
                <button
                  onClick={() => handleOpenModal(loc)}
                  className="p-2 text-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this location?")) {
                      deleteMutation.mutate(loc.id);
                    }
                  }}
                  className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocation ? "Edit Location" : "New Location"}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Location Name</label>
            <input {...form.register("name")} className={inputClass} placeholder="e.g. North Field" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">District</label>
            <input {...form.register("district")} className={inputClass} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Address (Optional)</label>
            <input {...form.register("address")} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Latitude</label>
              <input type="number" step="any" {...form.register("latitude", { valueAsNumber: true })} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Longitude</label>
              <input type="number" step="any" {...form.register("longitude", { valueAsNumber: true })} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="is_primary" {...form.register("is_primary")} className="w-4 h-4 text-primary rounded border-border bg-surface-tertiary" />
            <label htmlFor="is_primary" className="text-sm font-medium text-text-secondary">Set as primary location</label>
          </div>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Location"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

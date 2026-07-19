"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Plus, CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";

// Leaflet must be loaded client-side only (Next.js SSR incompatible)
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] rounded-xl border border-border bg-surface-tertiary animate-pulse" />
  ),
});

export function InlineAddLocation({ 
  onLocationAdded, 
  forceOpen = false 
}: { 
  onLocationAdded: (id: string) => void;
  forceOpen?: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locData, setLocData] = useState({
    name: "",
    district: "",
    address: "",
    latitude: 7.8731,
    longitude: 80.7718,
    is_primary: false,
  });

  const handleSubmit = async () => {
    if (!locData.name || !locData.district) return;
    setIsSubmitting(true);
    try {
      const res = await api.post("/farmer/locations", locData);
      const newLoc = res.data?.data ?? res.data;
      onLocationAdded(newLoc.id);
      setShowForm(false);
      setLocData({ name: "", district: "", address: "", latitude: 7.8731, longitude: 80.7718, is_primary: false });
    } catch (err) {
      console.error("Failed to create location", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm && !forceOpen) {
    return (
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-blue-500/40 hover:bg-surface-tertiary transition-all flex items-center justify-center gap-2 text-text-muted hover:text-blue-400"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium text-sm">Add New Location</span>
      </button>
    );
  }

  const inputClass = "w-full bg-surface-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all text-sm";

  return (
    <div className="p-5 rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 space-y-4 animate-fade-in">
      <h4 className="font-semibold text-white text-sm flex items-center gap-2">
        <Plus className="w-4 h-4 text-blue-400" />
        Add New Farm Location
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">Location Name *</label>
          <input
            type="text"
            placeholder="e.g. Main Farm"
            value={locData.name}
            onChange={(e) => setLocData({ ...locData, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1">District *</label>
          <input
            type="text"
            placeholder="e.g. Colombo"
            value={locData.district}
            onChange={(e) => setLocData({ ...locData, district: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1">Address (optional)</label>
        <input
          type="text"
          placeholder="Full address..."
          value={locData.address}
          onChange={(e) => setLocData({ ...locData, address: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5">Pin your location on the map</label>
        <LocationPicker
          value={{ lat: locData.latitude, lng: locData.longitude }}
          onChange={(lat, lng) => setLocData({ ...locData, latitude: lat, longitude: lng })}
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!locData.name || !locData.district || isSubmitting}
          className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/20 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {isSubmitting ? "Saving..." : "Save & Select"}
        </button>
        {!forceOpen && (
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2.5 text-text-muted hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

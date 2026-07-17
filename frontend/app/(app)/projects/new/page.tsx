"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Sprout, MapPin, Calendar, LayoutTemplate, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/stores/authStore";

export default function NewProjectWizard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    plant_id: "",
    location_id: "",
    area_acres: "",
    area_unit: "acres",
    farming_method: "",
    planting_date: new Date().toISOString().split('T')[0]
  });

  // Queries
  const { data: plants, isLoading: plantsLoading } = useQuery({
    queryKey: ["plants"],
    queryFn: async () => {
      const res = await api.get("/plants");
      return res.data.data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await api.get("/farmer/profile");
      return res.data.data;
    },
    enabled: !!user,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await api.get("/farmer/locations");
      return res.data.data;
    },
    enabled: !!user,
  });

  // Mutation
  const createProject = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/projects", data);
      return res.data.data;
    },
    onSuccess: (data) => {
      router.push(`/projects/${data.id}`);
    },
    onError: () => {
      // Stay on step 5 to show error state with retry option
    }
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleCreate = () => {
    setStep(5); // Loading step
    createProject.mutate({
      name: `Farm Project - ${new Date().toLocaleDateString()}`,
      plant_id: formData.plant_id,
      location_id: formData.location_id,
      area: parseFloat(formData.area_acres),
      area_unit: formData.area_unit,
      farming_method: formData.farming_method,
      planting_date: formData.planting_date
    });
  };

  const inputClass =
    "w-full bg-surface-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href="/dashboard"
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Create New Project<span className="text-green-400 text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Step {Math.min(step, 4)} of 4</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-2 flex-1 rounded-full transition-all duration-500",
              s <= step ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-surface-tertiary"
            )}
          />
        ))}
      </div>

      {/* Steps Content */}
      <div className="glass-card rounded-3xl p-6 md:p-8 min-h-[400px] relative animate-slide-up">
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <Sprout className="w-6 h-6 text-green-400" />
              What are you planting?
            </h2>
            {plantsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Select Crop / Variety</label>
                  <select
                    value={formData.plant_id}
                    onChange={(e) => setFormData({ ...formData, plant_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">-- Choose a crop --</option>
                    {plants?.map((plant: any) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.common_name} {plant.local_name ? `(${plant.local_name})` : ""} - {plant.scientific_name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.plant_id && (
                  (() => {
                    const selectedPlant = plants?.find((p: any) => p.id === formData.plant_id);
                    if (!selectedPlant) return null;
                    return (
                      <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/[0.05] space-y-2 animate-fade-in">
                        <h3 className="font-bold text-green-400 text-lg">{selectedPlant.common_name}</h3>
                        {selectedPlant.scientific_name && (
                          <p className="text-sm text-text-secondary">
                            <span className="font-semibold">Scientific Name:</span> <i>{selectedPlant.scientific_name}</i>
                          </p>
                        )}
                        <p className="text-sm text-text-secondary">
                          <span className="font-semibold">Growth Duration:</span> {selectedPlant.growth_duration_days} days
                        </p>
                        {selectedPlant.optimal_ph_min && (
                          <p className="text-sm text-text-secondary">
                            <span className="font-semibold">Optimal pH:</span> {selectedPlant.optimal_ph_min} - {selectedPlant.optimal_ph_max}
                          </p>
                        )}
                        {selectedPlant.description && (
                          <p className="text-sm mt-2 italic text-text-muted">{selectedPlant.description}</p>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <MapPin className="w-6 h-6 text-blue-400" />
              Where is this field?
            </h2>
            {locationsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              </div>
            ) : locations?.length > 0 ? (
              <div className="space-y-4">
                {locations.map((loc: any) => (
                  <button
                    key={loc.id}
                    onClick={() => { setFormData({...formData, location_id: loc.id}); nextStep(); }}
                    className={clsx(
                      "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                      formData.location_id === loc.id
                        ? "border-blue-500/60 bg-blue-500/10"
                        : "border-border hover:border-blue-500/40 hover:bg-surface-tertiary"
                    )}
                  >
                    <div>
                      <h3 className="font-semibold text-white">{loc.name}</h3>
                      <p className="text-sm text-text-muted mt-1">{loc.district}</p>
                    </div>
                    {formData.location_id === loc.id && <CheckCircle2 className="w-6 h-6 text-blue-400" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary mb-4">You haven&apos;t added any farm locations yet.</p>
                <Link href="/profile" className="btn-secondary inline-flex px-4 py-2 text-sm">
                  Add Location in Settings
                </Link>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <LayoutTemplate className="w-6 h-6 text-amber-400" />
              Land Details &amp; Method
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Cultivation Area</label>
                  <input
                    type="number"
                    placeholder="e.g. 1.5"
                    value={formData.area_acres}
                    onChange={(e) => setFormData({...formData, area_acres: e.target.value})}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Area Unit</label>
                  <select
                    value={formData.area_unit}
                    onChange={(e) => setFormData({...formData, area_unit: e.target.value})}
                    className={inputClass}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="perches">Perches</option>
                    <option value="sq_meters">Sq Meters</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Farming Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { code: "organic", label: "Organic" },
                    { code: "inorganic", label: "Conventional" },
                    { code: "integrated", label: "Integrated" },
                  ].map((m) => (
                    <button
                      key={m.code}
                      type="button"
                      onClick={() => setFormData({...formData, farming_method: m.code})}
                      className={clsx(
                        "py-3 px-2 rounded-xl border-2 font-semibold text-xs md:text-sm transition-all text-center",
                        formData.farming_method === m.code
                          ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
                          : "border-border text-text-secondary hover:border-amber-500/40"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <Calendar className="w-6 h-6 text-neon-purple" />
              When did you plant?
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Planting Date</label>
                <input
                  type="date"
                  value={formData.planting_date}
                  onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
                  className={clsx(inputClass, "[color-scheme:dark]")}
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in text-center py-12">
            {createProject.isError ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                  Failed to create your farming project. Please check your input and try again.
                </p>
                <button onClick={() => setStep(4)} className="btn-primary px-6 py-3">
                  Go Back &amp; Retry
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-3">Generating Farm Plan...</h2>
                <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                  Our AI is analyzing the weather forecast, soil data, and optimal growth stages to create your personalized daily activity plan.
                </p>
                <div className="w-12 h-12 border-4 border-green-500/20 border-t-primary rounded-full animate-spin mx-auto drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
              </>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 5 && (
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="btn-secondary px-6 py-3 text-sm disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={step === 4 ? handleCreate : nextStep}
            disabled={
              (step === 1 && !formData.plant_id) ||
              (step === 2 && !formData.location_id) ||
              (step === 3 && (!formData.area_acres || !formData.farming_method)) ||
              (step === 4 && !formData.planting_date)
            }
            className="btn-primary px-6 py-3 text-sm disabled:opacity-50"
          >
            {step === 4 ? "Create Plan" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}

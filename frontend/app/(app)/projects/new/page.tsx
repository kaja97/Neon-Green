"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle2, Sprout, MapPin, Calendar, LayoutTemplate, Loader2, Search, ChevronDown, Check, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { InlineAddLocation } from "@/components/forms/InlineAddLocation";
import { useAuthStore } from "@/lib/stores/authStore";

function SearchableSelect({ options, value, onChange, placeholder, disabled = false }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((o: any) => o.value === value);
  const filteredOptions = options.filter((o: any) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={clsx(
          "w-full bg-surface-tertiary border border-border rounded-xl py-3 px-4 flex justify-between items-center transition-all",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-text-muted focus:ring-2 focus:ring-primary",
          value ? "text-text-primary" : "text-text-muted"
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="w-5 h-5 text-text-muted shrink-0" />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-2 bg-surface-elevated border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-2 border-b border-border flex items-center gap-2 bg-surface-primary/50">
              <Search className="w-4 h-4 text-text-muted ml-1 shrink-0" />
              <input 
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm text-text-primary py-1 placeholder:text-text-muted"
                placeholder="Search..."
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-sm text-text-muted text-center">No results found</div>
              ) : (
                filteredOptions.map((opt: any) => (
                  <div 
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={clsx(
                      "px-4 py-3 text-sm cursor-pointer hover:bg-surface-tertiary flex justify-between items-center transition-colors",
                      value === opt.value ? "text-green-400 font-medium bg-green-500/5" : "text-text-primary"
                    )}
                  >
                    <span>{opt.label}</span>
                    {value === opt.value && <Check className="w-4 h-4 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


export default function NewProjectWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    plant_id: "",
    variety_id: "",
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

  const { data: varieties, isLoading: varietiesLoading } = useQuery({
    queryKey: ["varieties", formData.plant_id],
    queryFn: async () => {
      if (!formData.plant_id) return [];
      const res = await api.get(`/plants/${formData.plant_id}/varieties`);
      return res.data.data;
    },
    enabled: !!user && !!formData.plant_id,
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
      variety_id: formData.variety_id,
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
                  <label className="block text-sm font-medium text-text-secondary mb-2">Select Crop</label>
                  <SearchableSelect
                    options={plants?.map((p: any) => ({
                      value: p.id,
                      label: `${p.common_name} ${p.local_name ? `(${p.local_name})` : ""}`
                    })) || []}
                    value={formData.plant_id}
                    onChange={(val: string) => setFormData({ ...formData, plant_id: val, variety_id: "" })}
                    placeholder="-- Choose a crop --"
                  />
                </div>

                {formData.plant_id && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Select Variety</label>
                    <SearchableSelect
                      options={varieties?.map((v: any) => ({
                        value: v.id,
                        label: v.variety_name
                      })) || []}
                      value={formData.variety_id}
                      onChange={(val: string) => setFormData({ ...formData, variety_id: val })}
                      placeholder="-- Choose a variety --"
                      disabled={varietiesLoading}
                    />
                  </div>
                )}

                {formData.variety_id && (
                  (() => {
                    const selectedVariety = varieties?.find((v: any) => v.id === formData.variety_id);
                    if (!selectedVariety) return null;
                    return (
                      <div className="p-5 rounded-2xl border border-green-500/20 bg-green-500/[0.05] space-y-2 animate-fade-in">
                        <h3 className="font-bold text-green-400 text-lg">{selectedVariety.variety_name}</h3>
                        {selectedVariety.scientific_name && (
                          <p className="text-sm text-text-secondary">
                            <span className="font-semibold">Scientific Name:</span> <i>{selectedVariety.scientific_name}</i>
                          </p>
                        )}
                        <p className="text-sm text-text-secondary">
                          <span className="font-semibold">Growth Duration:</span> {selectedVariety.growth_duration_days} days
                        </p>
                        {selectedVariety.optimal_ph_min && (
                          <p className="text-sm text-text-secondary">
                            <span className="font-semibold">Optimal pH:</span> {selectedVariety.optimal_ph_min} - {selectedVariety.optimal_ph_max}
                          </p>
                        )}
                        {selectedVariety.description && (
                          <p className="text-sm mt-2 italic text-text-muted">{selectedVariety.description}</p>
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
            ) : (
              <div className="space-y-4">
                {locations?.length > 0 && locations.map((loc: any) => (
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

                {/* Inline Add Location Form */}
                <InlineAddLocation
                  forceOpen={locations?.length === 0}
                  onLocationAdded={(newLocId: string) => {
                    setFormData({ ...formData, location_id: newLocId });
                    // Refetch locations
                    queryClient.invalidateQueries({ queryKey: ["locations"] });
                    nextStep();
                  }}
                />
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
              (step === 1 && (!formData.plant_id || !formData.variety_id)) ||
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

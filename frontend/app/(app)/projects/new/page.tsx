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
      area_unit: "acres",
      farming_method: formData.farming_method,
      planting_date: formData.planting_date
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-slate-500 text-sm">Step {Math.min(step, 4)} of 4</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-2 flex-1 rounded-full transition-colors duration-500",
              s <= step ? "bg-green-600" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      {/* Steps Content */}
      <div className="bg-white border shadow-sm rounded-3xl p-6 md:p-8 min-h-[400px] relative">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Sprout className="w-6 h-6 text-green-600" />
              What are you planting?
            </h2>
            {plantsLoading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" /></div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {plants?.map((plant: any) => (
                  <button
                    key={plant.id}
                    onClick={() => { setFormData({...formData, plant_id: plant.id}); nextStep(); }}
                    className={clsx(
                      "p-6 rounded-2xl border-2 transition-all text-left group",
                      formData.plant_id === plant.id ? "border-green-600 bg-green-50" : "border-slate-200 hover:border-green-300"
                    )}
                  >
                    <h3 className="font-semibold">{plant.common_name}</h3>
                    <p className="text-xs text-slate-500">{plant.scientific_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-500" />
              Where is this field?
            </h2>
            {locationsLoading ? (
               <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : locations?.length > 0 ? (
              <div className="space-y-4">
                {locations.map((loc: any) => (
                  <button
                    key={loc.id}
                    onClick={() => { setFormData({...formData, location_id: loc.id}); nextStep(); }}
                    className={clsx(
                      "w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center justify-between",
                      formData.location_id === loc.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
                    )}
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">{loc.name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{loc.district}</p>
                    </div>
                    {formData.location_id === loc.id && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-4">You haven't added any farm locations yet.</p>
                <Link href="/profile" className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors">
                  Add Location in Settings
                </Link>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <LayoutTemplate className="w-6 h-6 text-amber-500" />
              Land Details & Method
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cultivation Area (Acres)</label>
                <input
                  type="number"
                  placeholder="e.g. 1.5"
                  value={formData.area_acres}
                  onChange={(e) => setFormData({...formData, area_acres: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Farming Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFormData({...formData, farming_method: "organic"})} 
                    className={clsx(
                      "py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors",
                      formData.farming_method === "organic" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"
                    )}
                  >
                    Organic
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, farming_method: "conventional"})} 
                    className={clsx(
                      "py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-colors",
                      formData.farming_method === "conventional" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600"
                    )}
                  >
                    Conventional
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-500" />
              When did you plant?
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Planting Date</label>
                <input
                  type="date"
                  value={formData.planting_date}
                  onChange={(e) => setFormData({...formData, planting_date: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center py-12">
            {createProject.isError ? (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Something went wrong
                </h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Failed to create your farming project. Please check your input and try again.
                </p>
                <button
                  onClick={() => { setStep(4); }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg"
                >
                  Go Back & Retry
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  Generating Farm Plan...
                </h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  Our AI is analyzing the weather forecast, soil data, and optimal growth stages to create your personalized daily activity plan.
                </p>
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
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
            className="px-6 py-3 rounded-xl font-semibold text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
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
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
          >
            {step === 4 ? "Create Plan" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}

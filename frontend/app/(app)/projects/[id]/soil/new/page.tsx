"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, Sparkles, Save, RotateCcw } from "lucide-react";

const STANDARD_AVERAGES = {
  ph_level: "6.5",
  electrical_conductivity_ec: "0.40",
  organic_carbon_oc: "1.80",
  cation_exchange_capacity_cec: "18.0",
  nitrogen_n: "260",
  phosphorus_p: "25",
  potassium_k: "180",
  calcium_ca: "1200",
  magnesium_mg: "160",
  sulfur_s: "22",
  zinc_zn: "1.80",
  boron_b: "0.80",
  iron_fe: "12.0",
  manganese_mn: "8.0",
  copper_cu: "0.80",
};

const INITIAL_RESULTS = {
  ph_level: "6.5",
  electrical_conductivity_ec: "",
  organic_carbon_oc: "",
  cation_exchange_capacity_cec: "",
  nitrogen_n: "",
  phosphorus_p: "",
  potassium_k: "",
  calcium_ca: "",
  magnesium_mg: "",
  sulfur_s: "",
  zinc_zn: "",
  boron_b: "",
  iron_fe: "",
  manganese_mn: "",
  copper_cu: "",
};

interface NutrientField {
  key: string;
  label: string;
  placeholder: string;
  step: string;
  min: number;
  max: number;
}

const PHYSICAL_FIELDS: NutrientField[] = [
  { key: "electrical_conductivity_ec", label: "EC (Electrical Conductivity)", placeholder: "0.40", step: "0.01", min: 0, max: 10 },
  { key: "organic_carbon_oc", label: "Organic Carbon OC (%)", placeholder: "1.80", step: "0.01", min: 0, max: 10 },
  { key: "cation_exchange_capacity_cec", label: "CEC (meq/100g)", placeholder: "18.0", step: "0.1", min: 0, max: 50 },
];

const PRIMARY_FIELDS: NutrientField[] = [
  { key: "nitrogen_n", label: "Nitrogen (N)", placeholder: "260", step: "1", min: 0, max: 1000 },
  { key: "phosphorus_p", label: "Phosphorus (P)", placeholder: "25", step: "1", min: 0, max: 200 },
  { key: "potassium_k", label: "Potassium (K)", placeholder: "180", step: "1", min: 0, max: 1000 },
];

const SECONDARY_FIELDS: NutrientField[] = [
  { key: "calcium_ca", label: "Calcium (Ca)", placeholder: "1200", step: "1", min: 0, max: 5000 },
  { key: "magnesium_mg", label: "Magnesium (Mg)", placeholder: "160", step: "1", min: 0, max: 1000 },
  { key: "sulfur_s", label: "Sulfur (S)", placeholder: "22", step: "1", min: 0, max: 100 },
];

const MICRO_FIELDS: NutrientField[] = [
  { key: "zinc_zn", label: "Zinc (Zn)", placeholder: "1.80", step: "0.01", min: 0, max: 50 },
  { key: "boron_b", label: "Boron (B)", placeholder: "0.80", step: "0.01", min: 0, max: 10 },
  { key: "iron_fe", label: "Iron (Fe)", placeholder: "12.0", step: "0.1", min: 0, max: 200 },
  { key: "manganese_mn", label: "Manganese (Mn)", placeholder: "8.0", step: "0.1", min: 0, max: 200 },
  { key: "copper_cu", label: "Copper (Cu)", placeholder: "0.80", step: "0.01", min: 0, max: 20 },
];

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface-tertiary/50 hover:bg-surface-tertiary transition-colors"
      >
        <div>
          <span className="text-sm font-semibold text-white">{title}</span>
          {subtitle && (
            <span className="text-xs text-text-muted ml-2">{subtitle}</span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
}

export default function NewSoilTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    test_date: new Date().toISOString().split("T")[0],
    tested_by: "",
    notes: "",
    results: INITIAL_RESULTS,
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post(`/soil/tests/${params.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soil_tests", params.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", params.id] });
      router.push(`/projects/${params.id}/soil`);
    },
  });

  const parseNum = (val: string) => {
    if (!val || val.trim() === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const prefillAverages = () => {
    setFormData((prev) => ({
      ...prev,
      tested_by: prev.tested_by || "Department of Agriculture / Regional Soil Lab",
      notes: prev.notes || "Comprehensive soil chemistry & nutrient assessment",
      results: STANDARD_AVERAGES,
    }));
  };

  const clearForm = () => {
    setFormData((prev) => ({
      ...prev,
      results: INITIAL_RESULTS,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      test_date: formData.test_date,
      tested_by: formData.tested_by.trim() || null,
      notes: formData.notes.trim() || null,
      results: {
        ph_level: isNaN(Number(formData.results.ph_level)) ? 6.5 : Number(formData.results.ph_level),
        electrical_conductivity_ec: parseNum(formData.results.electrical_conductivity_ec),
        organic_carbon_oc: parseNum(formData.results.organic_carbon_oc),
        cation_exchange_capacity_cec: parseNum(formData.results.cation_exchange_capacity_cec),
        nitrogen_n: parseNum(formData.results.nitrogen_n),
        phosphorus_p: parseNum(formData.results.phosphorus_p),
        potassium_k: parseNum(formData.results.potassium_k),
        calcium_ca: parseNum(formData.results.calcium_ca),
        magnesium_mg: parseNum(formData.results.magnesium_mg),
        sulfur_s: parseNum(formData.results.sulfur_s),
        zinc_zn: parseNum(formData.results.zinc_zn),
        boron_b: parseNum(formData.results.boron_b),
        iron_fe: parseNum(formData.results.iron_fe),
        manganese_mn: parseNum(formData.results.manganese_mn),
        copper_cu: parseNum(formData.results.copper_cu),
      },
    };
    mutation.mutate(payload);
  };

  const inputClass =
    "w-full bg-surface-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

  const updateResult = (key: string, value: string) => {
    setFormData({
      ...formData,
      results: { ...formData.results, [key]: value },
    });
  };

  const renderNutrientGrid = (fields: NutrientField[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {fields.map((f) => (
        <div key={f.key} className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            {f.label} <span className="text-text-muted">(ppm)</span>
          </label>
          <input
            type="number"
            step={f.step}
            min={f.min}
            max={f.max}
            title={`Typical range: ${f.min} to ${f.max}`}
            placeholder={f.placeholder}
            value={formData.results[f.key as keyof typeof INITIAL_RESULTS]}
            onChange={(e) => updateResult(f.key, e.target.value)}
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${params.id}/soil`}
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Log Soil Test<span className="text-amber-400">.</span>
            </h1>
            <p className="text-text-muted text-sm mt-0.5">Record laboratory results to generate AI recommendations</p>
          </div>
        </div>

        <button
          type="button"
          onClick={prefillAverages}
          className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          title="Fill realistic agronomic average test values"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Pre-fill Standard Averages</span>
        </button>
      </header>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 md:p-8 space-y-6 animate-slide-up">
        {/* Test Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Test Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Test Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={formData.test_date}
                onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                className={`${inputClass} [color-scheme:dark]`}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Tested By (Lab / Method)</label>
              <input
                type="text"
                placeholder="e.g., Regional Agriculture Soil Testing Lab"
                value={formData.tested_by}
                onChange={(e) => setFormData({ ...formData, tested_by: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Notes & Crop Phase</label>
            <textarea
              placeholder="e.g., Pre-sowing sample / Follow-up test after fertilizer amendment..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Physical & Chemical Properties */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Physical & Chemical Properties</h2>
            <span className="text-xs font-mono text-emerald-400">Target pH: 6.0–7.2</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                pH Level <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="6.5"
                value={formData.results.ph_level}
                onChange={(e) => updateResult("ph_level", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            {PHYSICAL_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">
                  {f.label}
                </label>
                <input
                  type="number"
                  step={f.step}
                  placeholder={f.placeholder}
                  value={formData.results[f.key as keyof typeof INITIAL_RESULTS]}
                  onChange={(e) => updateResult(f.key, e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Primary Macronutrients */}
        <CollapsibleSection
          title="Primary Macronutrients"
          subtitle="N, P, K — Essential yield drivers (ppm)"
          defaultOpen={true}
        >
          {renderNutrientGrid(PRIMARY_FIELDS)}
        </CollapsibleSection>

        {/* Secondary Macronutrients */}
        <CollapsibleSection
          title="Secondary Macronutrients"
          subtitle="Ca, Mg, S — Soil structure & enzyme activators (ppm)"
          defaultOpen={true}
        >
          {renderNutrientGrid(SECONDARY_FIELDS)}
        </CollapsibleSection>

        {/* Micronutrients / Trace Elements */}
        <CollapsibleSection
          title="Micronutrients / Trace Elements"
          subtitle="Zn, B, Fe, Mn, Cu — Trace elements (ppm)"
          defaultOpen={false}
        >
          {renderNutrientGrid(MICRO_FIELDS)}
        </CollapsibleSection>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={clearForm}
            className="h-11 px-4 rounded-xl bg-surface-secondary border border-border hover:bg-surface-tertiary text-text-secondary text-sm font-semibold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 btn-primary py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Computing AI Recommendations & Sending Report...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Soil Test & Generate Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

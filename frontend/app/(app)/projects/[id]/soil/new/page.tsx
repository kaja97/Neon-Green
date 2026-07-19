"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react";

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
}

const PHYSICAL_FIELDS: NutrientField[] = [
  { key: "electrical_conductivity_ec", label: "EC (Electrical Conductivity)", placeholder: "e.g. 1.2", step: "0.01" },
  { key: "organic_carbon_oc", label: "Organic Carbon OC (%)", placeholder: "e.g. 2.5", step: "0.01" },
  { key: "cation_exchange_capacity_cec", label: "CEC (meq/100g)", placeholder: "e.g. 15.0", step: "0.1" },
];

const PRIMARY_FIELDS: NutrientField[] = [
  { key: "nitrogen_n", label: "Nitrogen (N)", placeholder: "e.g. 280", step: "1" },
  { key: "phosphorus_p", label: "Phosphorus (P)", placeholder: "e.g. 25", step: "1" },
  { key: "potassium_k", label: "Potassium (K)", placeholder: "e.g. 180", step: "1" },
];

const SECONDARY_FIELDS: NutrientField[] = [
  { key: "calcium_ca", label: "Calcium (Ca)", placeholder: "e.g. 1200", step: "1" },
  { key: "magnesium_mg", label: "Magnesium (Mg)", placeholder: "e.g. 150", step: "1" },
  { key: "sulfur_s", label: "Sulfur (S)", placeholder: "e.g. 15", step: "1" },
];

const MICRO_FIELDS: NutrientField[] = [
  { key: "zinc_zn", label: "Zinc (Zn)", placeholder: "e.g. 2.5", step: "0.01" },
  { key: "boron_b", label: "Boron (B)", placeholder: "e.g. 1.0", step: "0.01" },
  { key: "iron_fe", label: "Iron (Fe)", placeholder: "e.g. 25", step: "0.1" },
  { key: "manganese_mn", label: "Manganese (Mn)", placeholder: "e.g. 12", step: "0.1" },
  { key: "copper_cu", label: "Copper (Cu)", placeholder: "e.g. 1.5", step: "0.01" },
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
    results: { ...INITIAL_RESULTS },
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/soil/tests/${params.id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["soil_tests", params.id] });
      router.push(`/projects/${params.id}/soil`);
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.message || err.response?.data?.detail || "Failed to save soil test results.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parseNum = (val: string) => {
      if (val === "" || val === undefined || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

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
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href={`/projects/${params.id}/soil`}
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            New Soil Test<span className="text-amber-400">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Record your latest lab results</p>
        </div>
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
              <label className="text-sm font-medium text-text-secondary">Tested By</label>
              <input
                type="text"
                placeholder="Lab or tester name"
                value={formData.tested_by}
                onChange={(e) => setFormData({ ...formData, tested_by: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Notes</label>
            <textarea
              placeholder="Any observations or notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Physical & Chemical Properties */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Physical & Chemical Properties</h2>
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
                value={formData.results.ph_level}
                onChange={(e) => updateResult("ph_level", e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          subtitle="N, P, K — Required for growth"
          defaultOpen={true}
        >
          {renderNutrientGrid(PRIMARY_FIELDS)}
        </CollapsibleSection>

        {/* Secondary Macronutrients */}
        <CollapsibleSection
          title="Secondary Macronutrients"
          subtitle="Ca, Mg, S — Structural & metabolic roles"
          defaultOpen={true}
        >
          {renderNutrientGrid(SECONDARY_FIELDS)}
        </CollapsibleSection>

        {/* Micronutrients / Trace Elements */}
        <CollapsibleSection
          title="Micronutrients / Trace Elements"
          subtitle="Zn, B, Fe, Mn, Cu — Required in small amounts"
          defaultOpen={false}
        >
          {renderNutrientGrid(MICRO_FIELDS)}
        </CollapsibleSection>

        {/* Submit */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full btn-primary py-3 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Soil Test"
          )}
        </button>
      </form>
    </div>
  );
}

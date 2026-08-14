"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { FlaskConical, Save, Loader2, Sparkles, RotateCcw } from "lucide-react";

interface SoilTestFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

export default function SoilTestForm({
  projectId,
  onSuccess,
  onCancel,
}: SoilTestFormProps) {
  const queryClient = useQueryClient();
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [labName, setLabName] = useState("");
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateResult = (key: string, value: string) => {
    setResults((prev) => ({ ...prev, [key]: value }));
  };

  const prefillAverages = () => {
    setResults(STANDARD_AVERAGES);
    if (!labName) setLabName("AgriLab Precision Diagnostic");
    if (!notes) setNotes("Pre-planting soil baseline evaluation");
  };

  const clearForm = () => {
    setResults(INITIAL_RESULTS);
  };

  const parseNum = (val: string) => {
    if (!val || val.trim() === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post(`/soil/tests/${projectId}`, {
        test_date: testDate,
        tested_by: labName.trim() || null,
        notes: notes.trim() || null,
        results: {
          ph_level: Number(results.ph_level) || 6.5,
          electrical_conductivity_ec: parseNum(results.electrical_conductivity_ec),
          organic_carbon_oc: parseNum(results.organic_carbon_oc),
          cation_exchange_capacity_cec: parseNum(results.cation_exchange_capacity_cec),
          nitrogen_n: parseNum(results.nitrogen_n),
          phosphorus_p: parseNum(results.phosphorus_p),
          potassium_k: parseNum(results.potassium_k),
          calcium_ca: parseNum(results.calcium_ca),
          magnesium_mg: parseNum(results.magnesium_mg),
          sulfur_s: parseNum(results.sulfur_s),
          zinc_zn: parseNum(results.zinc_zn),
          boron_b: parseNum(results.boron_b),
          iron_fe: parseNum(results.iron_fe),
          manganese_mn: parseNum(results.manganese_mn),
          copper_cu: parseNum(results.copper_cu),
        },
      });

      queryClient.invalidateQueries({ queryKey: ["soil_tests", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.detail || err.response?.data?.error?.message || "Failed to submit soil test."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50";

  const smallInputClasses =
    "w-full h-10 px-3 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header & Helper Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <FlaskConical className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Record Soil Analysis</h3>
            <p className="text-xs text-text-muted">
              Enter laboratory test results or pre-fill standard field averages
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={prefillAverages}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
          title="Fill realistic agronomic average test values"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pre-fill Standard Averages</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-slide-down">
          {error}
        </div>
      )}

      {/* Lab Name + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">Lab Name</label>
          <input
            type="text"
            placeholder="e.g., AgriLab Diagnostics / Field Kit"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Test Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            required
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-secondary">Notes & Crop Phase</label>
        <input
          type="text"
          placeholder="e.g., Pre-planting sample / Post-fertilizer evaluation"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          className={inputClasses}
        />
      </div>

      {/* pH + Physical Properties */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Physical & Chemical Properties
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Optimal: pH 6.0–7.2</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              pH Level <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="14"
              placeholder="6.5"
              value={results.ph_level}
              onChange={(e) => updateResult("ph_level", e.target.value)}
              required
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">EC (ds/m)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.40"
              value={results.electrical_conductivity_ec}
              onChange={(e) => updateResult("electrical_conductivity_ec", e.target.value)}
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Organic Carbon (%)</label>
            <input
              type="number"
              step="0.01"
              placeholder="1.80"
              value={results.organic_carbon_oc}
              onChange={(e) => updateResult("organic_carbon_oc", e.target.value)}
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">CEC (meq/100g)</label>
            <input
              type="number"
              step="0.1"
              placeholder="18.0"
              value={results.cation_exchange_capacity_cec}
              onChange={(e) => updateResult("cation_exchange_capacity_cec", e.target.value)}
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
        </div>
      </div>

      {/* Primary NPK */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Primary Macronutrients (ppm)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">N: 250-400 | P: 20-40 | K: 150-250</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "nitrogen_n", label: "Nitrogen (N)", placeholder: "260" },
            { key: "phosphorus_p", label: "Phosphorus (P)", placeholder: "25" },
            { key: "potassium_k", label: "Potassium (K)", placeholder: "180" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                {label}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder={placeholder}
                value={results[key as keyof typeof INITIAL_RESULTS]}
                onChange={(e) => updateResult(key, e.target.value)}
                disabled={isLoading}
                className={smallInputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Secondary */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Secondary Macronutrients (ppm)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Ca: 800-1600 | Mg: 100-200 | S: 10-30</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "calcium_ca", label: "Calcium (Ca)", placeholder: "1200" },
            { key: "magnesium_mg", label: "Magnesium (Mg)", placeholder: "160" },
            { key: "sulfur_s", label: "Sulfur (S)", placeholder: "22" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                {label}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder={placeholder}
                value={results[key as keyof typeof INITIAL_RESULTS]}
                onChange={(e) => updateResult(key, e.target.value)}
                disabled={isLoading}
                className={smallInputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Micronutrients */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Micronutrients / Trace Elements (ppm)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Zn, B, Fe, Mn, Cu</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: "zinc_zn", label: "Zn", placeholder: "1.80" },
            { key: "boron_b", label: "B", placeholder: "0.80" },
            { key: "iron_fe", label: "Fe", placeholder: "12.0" },
            { key: "manganese_mn", label: "Mn", placeholder: "8.0" },
            { key: "copper_cu", label: "Cu", placeholder: "0.80" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted text-center block">{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={placeholder}
                value={results[key as keyof typeof INITIAL_RESULTS]}
                onChange={(e) => updateResult(key, e.target.value)}
                disabled={isLoading}
                className={smallInputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 btn-secondary flex items-center justify-center text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={clearForm}
          className="h-11 px-4 rounded-xl bg-surface-secondary border border-border hover:bg-surface-tertiary text-text-secondary text-sm font-semibold transition-all flex items-center gap-1.5"
          title="Reset values to blank"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`${onCancel ? "flex-[2]" : "flex-1"} h-11 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Calculate Recommendations</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

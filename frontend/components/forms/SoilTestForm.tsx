"use client";

import { useState } from "react";
import { Loader2, FlaskConical, Save } from "lucide-react";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface SoilTestFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

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

  const [labName, setLabName] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState({ ...INITIAL_RESULTS });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateResult = (key: string, value: string) => {
    setResults((prev) => ({ ...prev, [key]: value }));
  };

  const parseNum = (val: string) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phVal = parseFloat(results.ph_level);
    if (isNaN(phVal) || phVal < 0.1 || phVal > 14) {
      setError("pH must be between 0.1 and 14.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/soil/tests/${projectId}`, {
        test_date: testDate,
        tested_by: labName || null,
        notes: notes || null,
        results: {
          ph_level: phVal,
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10">
          <FlaskConical className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Submit Soil Test</h3>
          <p className="text-xs text-text-muted">
            Enter lab results to get tailored recommendations
          </p>
        </div>
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
            placeholder="e.g., Agri Lab"
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
        <label className="text-sm font-medium text-text-secondary">Notes</label>
        <input
          type="text"
          placeholder="Any observations..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
          className={inputClasses}
        />
      </div>

      {/* pH + Physical Properties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            pH Level <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            max="14"
            placeholder="e.g., 6.5"
            value={results.ph_level}
            onChange={(e) => updateResult("ph_level", e.target.value)}
            required
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">EC (ds/m)</label>
          <input
            type="number"
            step="0.01"
            placeholder="e.g., 1.2"
            value={results.electrical_conductivity_ec}
            onChange={(e) => updateResult("electrical_conductivity_ec", e.target.value)}
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Primary NPK */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "nitrogen_n", label: "N" },
          { key: "phosphorus_p", label: "P" },
          { key: "potassium_k", label: "K" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              {label} <span className="text-text-muted">(ppm)</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="—"
              value={results[key as keyof typeof INITIAL_RESULTS]}
              onChange={(e) => updateResult(key, e.target.value)}
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
        ))}
      </div>

      {/* Secondary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "calcium_ca", label: "Ca" },
          { key: "magnesium_mg", label: "Mg" },
          { key: "sulfur_s", label: "S" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              {label} <span className="text-text-muted">(ppm)</span>
            </label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="—"
              value={results[key as keyof typeof INITIAL_RESULTS]}
              onChange={(e) => updateResult(key, e.target.value)}
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
        ))}
      </div>

      {/* Micronutrients */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { key: "zinc_zn", label: "Zn" },
          { key: "boron_b", label: "B" },
          { key: "iron_fe", label: "Fe" },
          { key: "manganese_mn", label: "Mn" },
          { key: "copper_cu", label: "Cu" },
        ].map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-medium text-text-muted">{label}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="—"
              value={results[key as keyof typeof INITIAL_RESULTS]}
              onChange={(e) => updateResult(key, e.target.value)}
              disabled={isLoading}
              className={smallInputClasses}
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
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
          type="submit"
          disabled={isLoading}
          className={`${onCancel ? "flex-[2]" : "w-full"} h-11 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Soil Test
            </>
          )}
        </button>
      </div>
    </form>
  );
}

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

export default function SoilTestForm({
  projectId,
  onSuccess,
  onCancel,
}: SoilTestFormProps) {
  const queryClient = useQueryClient();

  const [ph, setPh] = useState("");
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [labName, setLabName] = useState("");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate ranges
    const phVal = parseFloat(ph);
    if (phVal < 0.1 || phVal > 14) {
      setError("pH must be between 0.1 and 14.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/soil/tests", {
        project_id: projectId,
        ph: phVal,
        nitrogen_ppm: nitrogen ? parseFloat(nitrogen) : undefined,
        phosphorus_ppm: phosphorus ? parseFloat(phosphorus) : undefined,
        potassium_ppm: potassium ? parseFloat(potassium) : undefined,
        organic_matter_pct: organicMatter
          ? parseFloat(organicMatter)
          : undefined,
        lab_name: labName || undefined,
        test_date: testDate,
      });

      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ["soil", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to submit soil test."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50";

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

      {/* pH */}
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
          value={ph}
          onChange={(e) => setPh(e.target.value)}
          required
          disabled={isLoading}
          className={inputClasses}
        />
      </div>

      {/* NPK Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            N <span className="text-text-muted">(ppm)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="—"
            value={nitrogen}
            onChange={(e) => setNitrogen(e.target.value)}
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            P <span className="text-text-muted">(ppm)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="—"
            value={phosphorus}
            onChange={(e) => setPhosphorus(e.target.value)}
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            K <span className="text-text-muted">(ppm)</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="—"
            value={potassium}
            onChange={(e) => setPotassium(e.target.value)}
            disabled={isLoading}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Organic Matter */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-secondary">
          Organic Matter (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          placeholder="e.g., 3.2"
          value={organicMatter}
          onChange={(e) => setOrganicMatter(e.target.value)}
          disabled={isLoading}
          className={inputClasses}
        />
      </div>

      {/* Lab Name + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Lab Name
          </label>
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewSoilTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    test_date: new Date().toISOString().split("T")[0],
    tested_by: "",
    notes: "",
    results: {
      ph_level: 6.5,
      nitrogen_level: "Medium",
      phosphorus_level: "Medium",
      potassium_level: "Medium",
      organic_matter_perc: 2.5,
      moisture_level: "Medium",
    },
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
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      test_date: formData.test_date,
      tested_by: formData.tested_by.trim() || null,
      notes: formData.notes.trim() || null,
      results: {
        ph_level: isNaN(Number(formData.results.ph_level)) ? 6.5 : Number(formData.results.ph_level),
        nitrogen_level: formData.results.nitrogen_level,
        phosphorus_level: formData.results.phosphorus_level,
        potassium_level: formData.results.potassium_level,
        organic_matter_perc: Number(formData.results.organic_matter_perc),
        moisture_level: formData.results.moisture_level,
      },
    };
    mutation.mutate(payload);
  };

  const inputClass =
    "w-full bg-surface-tertiary border border-border rounded-xl py-3 px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Test Date</label>
            <input
              type="date"
              value={formData.test_date}
              onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
              className={`${inputClass} [color-scheme:dark]`}
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

        {/* Results */}
        <div className="border-t border-border pt-6">
          <h2 className="text-lg font-bold text-white mb-6">Test Results</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">pH Level</label>
              <input
                type="number"
                step="0.1"
                value={formData.results.ph_level}
                onChange={(e) => setFormData({ ...formData, results: { ...formData.results, ph_level: parseFloat(e.target.value) || 0 } })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Nitrogen</label>
              <select
                value={formData.results.nitrogen_level}
                onChange={(e) => setFormData({ ...formData, results: { ...formData.results, nitrogen_level: e.target.value } })}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Phosphorus</label>
              <select
                value={formData.results.phosphorus_level}
                onChange={(e) => setFormData({ ...formData, results: { ...formData.results, phosphorus_level: e.target.value } })}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Potassium</label>
              <select
                value={formData.results.potassium_level}
                onChange={(e) => setFormData({ ...formData, results: { ...formData.results, potassium_level: e.target.value } })}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Organic Matter %</label>
              <input
                type="number"
                step="0.1"
                value={formData.results.organic_matter_perc}
                onChange={(e) => setFormData({ ...formData, results: { ...formData.results, organic_matter_perc: parseFloat(e.target.value) || 0 } })}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Moisture</label>
              <select
                value={formData.results.moisture_level}
                onChange={(e) => setFormData({ ...formData, results: { ...formData.results, moisture_level: e.target.value } })}
                className={inputClass}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
        </div>

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

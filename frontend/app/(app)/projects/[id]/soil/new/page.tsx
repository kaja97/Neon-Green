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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}/soil`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Log Soil Test</h1>
          <p className="text-slate-400 text-sm">Enter your lab results</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Test Date</label>
              <input
                type="date"
                required
                value={formData.test_date}
                onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Tested By (Lab Name)</label>
              <input
                type="text"
                placeholder="e.g. AgriLab"
                value={formData.tested_by}
                onChange={(e) => setFormData({ ...formData, tested_by: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">Nutrient Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.results.ph_level}
                  onChange={(e) => setFormData({ ...formData, results: { ...formData.results, ph_level: parseFloat(e.target.value) } })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Organic Matter %</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.results.organic_matter_perc}
                  onChange={(e) => setFormData({ ...formData, results: { ...formData.results, organic_matter_perc: parseFloat(e.target.value) } })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {["nitrogen_level", "phosphorus_level", "potassium_level"].map((nutrient) => (
                <div key={nutrient} className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 capitalize">{nutrient.replace("_level", "")} (NPK)</label>
                  <select
                    value={(formData.results as any)[nutrient]}
                    onChange={(e) => setFormData({ ...formData, results: { ...formData.results, [nutrient]: e.target.value } })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href={`/projects/${params.id}/soil`}
            className="px-6 py-3 rounded-xl font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            {mutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            Save & Generate Recommendations
          </button>
        </div>
      </form>
    </div>
  );
}

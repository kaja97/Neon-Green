"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, FlaskConical, Beaker, ChevronRight, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

export default function SoilPage({ params }: { params: { id: string } }) {
  const { data: tests, isLoading } = useQuery({
    queryKey: ["soil_tests", params.id],
    queryFn: async () => {
      const res = await api.get(`/soil/tests/${params.id}`);
      return res.data;
    },
    enabled: !!params.id && params.id !== "1" && params.id !== "2",
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Soil Analysis</h1>
            <p className="text-slate-400 text-sm">Test results and recommendations</p>
          </div>
        </div>
        <Link 
          href={`/projects/${params.id}/soil/new`}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Test</span>
        </Link>
      </header>

      {/* Tests List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center text-slate-500 py-12">Loading tests...</div>
        ) : tests && tests.length > 0 ? (
          tests.map((test: any) => (
            <div key={test.id} className="bg-card border border-slate-800 rounded-3xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Lab Test ({test.test_date})</h3>
                  <p className="text-sm text-slate-400">Tested by: {test.tested_by || "Unknown"}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                  {test.status}
                </span>
              </div>

              {test.results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-800/30 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">pH Level</p>
                    <p className="text-xl font-bold text-white">{test.results.ph_level}</p>
                  </div>
                  <div className="bg-slate-800/30 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Nitrogen (N)</p>
                    <p className={clsx("text-xl font-bold", test.results.nitrogen_level === "Low" ? "text-rose-400" : "text-emerald-400")}>{test.results.nitrogen_level}</p>
                  </div>
                  <div className="bg-slate-800/30 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Phosphorus (P)</p>
                    <p className={clsx("text-xl font-bold", test.results.phosphorus_level === "Low" ? "text-rose-400" : "text-emerald-400")}>{test.results.phosphorus_level}</p>
                  </div>
                  <div className="bg-slate-800/30 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Potassium (K)</p>
                    <p className={clsx("text-xl font-bold", test.results.potassium_level === "Low" ? "text-rose-400" : "text-emerald-400")}>{test.results.potassium_level}</p>
                  </div>
                </div>
              )}

              {test.recommendations && test.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {test.recommendations.map((rec: any) => (
                      <div key={rec.id} className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-medium">{rec.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center bg-card border border-slate-800 rounded-3xl p-12">
            <FlaskConical className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Soil Tests Yet</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Submit your first soil test to get tailored fertilizer recommendations and improve your yield.
            </p>
            <Link 
              href={`/projects/${params.id}/soil/new`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Log Test Results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

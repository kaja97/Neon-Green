"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, FlaskConical, Beaker, CheckCircle2, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export default function SoilPage({ params }: { params: { id: string } }) {
  const { data: tests, isLoading } = useQuery({
    queryKey: ["soil_tests", params.id],
    queryFn: async () => {
      const res = await api.get(`/soil/tests/${params.id}`);
      return res.data.data;
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${params.id}`}
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Soil Analysis<span className="text-green-400 text-glow-green">.</span>
            </h1>
            <p className="text-text-muted text-sm mt-0.5">Test results and recommendations</p>
          </div>
        </div>
        <Link
          href={`/projects/${params.id}/soil/new`}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Test</span>
        </Link>
      </header>

      {/* Tests List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </div>
        ) : tests && tests.length > 0 ? (
          tests.map((test: any, idx: number) => (
            <div
              key={test.id}
              className="glass-card rounded-3xl p-6 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Lab Test ({new Date(test.test_date).toLocaleDateString()})</h3>
                  <p className="text-sm text-text-muted">Tested by: {test.tested_by || "Unknown"}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  {test.status}
                </span>
              </div>

              {test.results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "pH Level", value: test.results.ph_level, color: "text-white" },
                    { label: "Nitrogen (N)", value: test.results.nitrogen_level, isLow: test.results.nitrogen_level === "Low" },
                    { label: "Phosphorus (P)", value: test.results.phosphorus_level, isLow: test.results.phosphorus_level === "Low" },
                    { label: "Potassium (K)", value: test.results.potassium_level, isLow: test.results.potassium_level === "Low" },
                  ].map((metric) => (
                    <div key={metric.label} className="glass-card rounded-2xl p-4">
                      <p className="text-xs text-text-muted mb-1">{metric.label}</p>
                      <p className={clsx(
                        "text-xl font-bold",
                        "isLow" in metric && metric.isLow ? "text-red-400" : metric.color
                      )}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {test.recommendations && test.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {test.recommendations.map((rec: any) => (
                      <div key={rec.id} className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-400" />
                        <span className="text-sm font-medium pt-0.5 leading-snug">{rec.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-card-hover rounded-3xl p-12 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 animate-float">
              <FlaskConical className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Soil Tests Yet</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
              Submit your first soil test to get tailored fertilizer recommendations and improve your yield.
            </p>
            <Link
              href={`/projects/${params.id}/soil/new`}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              Log Test Results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

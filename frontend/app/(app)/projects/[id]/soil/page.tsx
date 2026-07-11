"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, FlaskConical, Beaker, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export default function SoilPage({ params }: { params: { id: string } }) {
  const { data: tests, isLoading } = useQuery({
    queryKey: ["soil_tests", params.id],
    queryFn: async () => {
      const res = await api.get(`/soil/tests/${params.id}`);
      return res.data;
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.id}`} className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Soil Analysis</h1>
            <p className="text-slate-500 text-sm">Test results and recommendations</p>
          </div>
        </div>
        <Link 
          href={`/projects/${params.id}/soil/new`}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Test</span>
        </Link>
      </header>

      {/* Tests List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : tests && tests.length > 0 ? (
          tests.map((test: any) => (
            <div key={test.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Lab Test ({new Date(test.test_date).toLocaleDateString()})</h3>
                  <p className="text-sm text-slate-500">Tested by: {test.tested_by || "Unknown"}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                  {test.status}
                </span>
              </div>

              {test.results && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">pH Level</p>
                    <p className="text-xl font-bold text-slate-800">{test.results.ph_level}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Nitrogen (N)</p>
                    <p className={clsx("text-xl font-bold", test.results.nitrogen_level === "Low" ? "text-red-500" : "text-green-600")}>{test.results.nitrogen_level}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Phosphorus (P)</p>
                    <p className={clsx("text-xl font-bold", test.results.phosphorus_level === "Low" ? "text-red-500" : "text-green-600")}>{test.results.phosphorus_level}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <p className="text-xs text-slate-500 mb-1">Potassium (K)</p>
                    <p className={clsx("text-xl font-bold", test.results.potassium_level === "Low" ? "text-red-500" : "text-green-600")}>{test.results.potassium_level}</p>
                  </div>
                </div>
              )}

              {test.recommendations && test.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {test.recommendations.map((rec: any) => (
                      <div key={rec.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-600" />
                        <span className="text-sm font-medium pt-0.5 leading-snug">{rec.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
            <FlaskConical className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">No Soil Tests Yet</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              Submit your first soil test to get tailored fertilizer recommendations and improve your yield.
            </p>
            <Link 
              href={`/projects/${params.id}/soil/new`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm"
            >
              Log Test Results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

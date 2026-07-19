"use client";

import { FlaskConical, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { clsx } from "clsx";

export default function SoilBlock({ projectId }: { projectId: string }) {
  const { data: tests, isLoading } = useQuery({
    queryKey: ["soil_tests", projectId],
    queryFn: async () => {
      const res = await api.get(`/soil/tests/${projectId}`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="glass-card p-4 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Use the latest test or mock
  const latestTest = tests && tests.length > 0 ? tests[0] : null;

  const value = latestTest?.results ? `pH ${latestTest.results.ph_level}` : "pH --";
  const sub = latestTest?.results
    ? latestTest.results.nitrogen_n != null
      ? `N: ${latestTest.results.nitrogen_n} ppm`
      : "No tests"
    : "No tests";
  const isLow = latestTest?.results?.nitrogen_n != null && latestTest.results.nitrogen_n < 250;

  return (
    <Link
      href={`/projects/${projectId}/soil`}
      className="glass-card-hover p-4 group block"
    >
      <div className="p-2 rounded-xl w-fit mb-3 bg-amber-500/10 group-hover:scale-110 transition-transform">
        <FlaskConical className="w-5 h-5 text-amber-400" />
      </div>
      <p className="text-xs text-text-muted mb-0.5">Soil</p>
      <p className="text-base font-bold text-white">{value}</p>
      <p className={clsx("text-xs", isLow ? "text-red-400" : "text-text-muted")}>{sub}</p>
    </Link>
  );
}

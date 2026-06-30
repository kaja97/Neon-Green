"use client";

import { AlertTriangle, Info, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { clsx } from "clsx";

interface AlertResponse {
  id: string;
  project_id: string;
  alert_type: string;
  severity: string;
  message: string;
  target_date: string;
  is_resolved: boolean;
}

export default function AlertBanner({ projectId }: { projectId: string }) {
  const { data: alerts, isLoading } = useQuery<AlertResponse[]>({
    queryKey: ["weather_alerts", projectId],
    queryFn: async () => {
      const res = await api.get(`/weather/${projectId}/alerts`);
      return res.data;
    },
    enabled: !!projectId && projectId !== "1" && projectId !== "2" && projectId !== "3",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-800/30 border border-slate-700">
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
      </div>
    );
  }

  // Fallback mock if no alerts or using mock ID
  const displayAlerts = alerts && alerts.length > 0 ? alerts : [
    {
      id: "mock",
      project_id: projectId,
      alert_type: "heavy_rain",
      severity: "high",
      message: "Heavy rain tomorrow. Postpone fertilizer application to avoid nutrient runoff.",
      target_date: new Date().toISOString(),
      is_resolved: false,
    }
  ];

  // We'll just show the first (or highest priority) alert
  const alert = displayAlerts[0];
  if (!alert) return null;

  const isHigh = alert.severity === "high";

  return (
    <Link href={`/projects/${projectId}/weather`} className="block">
      <div
        className={clsx(
          "flex items-start gap-3 p-4 rounded-2xl transition-colors border",
          isHigh
            ? "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15"
            : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15"
        )}
      >
        {isHigh ? (
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        )}
        <div>
          <h4
            className={clsx(
              "font-semibold text-sm capitalize",
              isHigh ? "text-rose-500" : "text-amber-500"
            )}
          >
            {alert.alert_type.replace("_", " ")}
          </h4>
          <p
            className={clsx(
              "text-sm mt-1",
              isHigh ? "text-rose-400/80" : "text-amber-400/80"
            )}
          >
            {alert.message}
          </p>
        </div>
      </div>
    </Link>
  );
}

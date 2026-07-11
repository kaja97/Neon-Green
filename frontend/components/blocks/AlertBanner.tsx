"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface Alert {
  id: string;
  project_id: string;
  alert_type: string;
  severity: string;
  message: string;
  target_date: string;
  is_resolved: boolean;
}

export default function AlertBanner({ projectId, alerts }: { projectId: string, alerts: Alert[] }) {
  if (!alerts || alerts.length === 0) return null;

  // We'll just show the first (or highest priority) alert on the dashboard
  const alert = alerts[0];
  const isHigh = alert.severity === "high";

  return (
    <Link href={`/projects/${projectId}/disease`} className="block">
      <div
        className={clsx(
          "flex items-start gap-3 p-4 rounded-2xl transition-colors border shadow-sm",
          isHigh
            ? "bg-red-50 border-red-200 hover:bg-red-100"
            : "bg-amber-50 border-amber-200 hover:bg-amber-100"
        )}
      >
        {isHigh ? (
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div>
          <h4
            className={clsx(
              "font-semibold text-sm capitalize",
              isHigh ? "text-red-800" : "text-amber-800"
            )}
          >
            {alert.alert_type.replace(/_/g, " ")} Risk Detected
          </h4>
          <p
            className={clsx(
              "text-sm mt-1 leading-snug",
              isHigh ? "text-red-700" : "text-amber-700"
            )}
          >
            {alert.message}
          </p>
        </div>
      </div>
    </Link>
  );
}

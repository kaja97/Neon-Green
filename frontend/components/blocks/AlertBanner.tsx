"use client";

import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface Alert {
  type: string;
  severity: string;
  message: string;
  target_date?: string;
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
            ? "bg-red-50/10 border-red-500/20 hover:bg-red-50/15 text-red-200"
            : "bg-amber-50/10 border-amber-500/20 hover:bg-amber-50/15 text-amber-200"
        )}
      >
        {isHigh ? (
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div>
          <h4
            className={clsx(
              "font-semibold text-sm capitalize",
              isHigh ? "text-red-400" : "text-amber-400"
            )}
          >
            {alert.type.replace(/_/g, " ")} Risk Detected
          </h4>
          <p
            className={clsx(
              "text-sm mt-1 leading-snug",
              isHigh ? "text-red-300" : "text-amber-300"
            )}
          >
            {alert.message}
          </p>
        </div>
      </div>
    </Link>
  );
}

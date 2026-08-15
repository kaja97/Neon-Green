"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/formatters";

interface MarketBlockProps {
  projectId: string;
  plantId?: string;
  price?: number;
  trend?: string;
  changePct?: number;
}

export default function MarketBlock({
  projectId,
  price,
  trend,
  changePct,
}: MarketBlockProps) {
  const TrendIcon =
    trend === "rising"
      ? TrendingUp
      : trend === "falling"
        ? TrendingDown
        : Minus;
  const trendColor =
    trend === "rising"
      ? "text-emerald-400"
      : trend === "falling"
        ? "text-red-400"
        : "text-text-muted";

  return (
    <Link
      href={`/projects/${projectId}/market`}
      className="glass-card-hover p-4 group"
    >
      <div className="p-2 rounded-xl bg-emerald-500/10 w-fit mb-3 group-hover:scale-110 transition-transform">
        <TrendingUp className="w-5 h-5 text-emerald-400" />
      </div>
      <p className="text-xs text-text-muted mb-0.5">Market</p>
      <p className="text-base font-bold text-slate-900 dark:text-white">
        {price ? `${formatCurrency(price)}/kg` : "N/A"}
      </p>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span className="text-xs font-semibold">
            {changePct ? `${changePct > 0 ? "+" : ""}${changePct}%` : trend}
          </span>
        </div>
      )}
    </Link>
  );
}

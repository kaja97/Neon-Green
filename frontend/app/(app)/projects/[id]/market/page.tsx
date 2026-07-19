"use client";

import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function MarketPage({ params }: { params: { id: string } }) {
  // 1. Fetch dashboard to get project details (including plant_id)
  const { data: dashboard, isLoading: isLoadingDash } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data.data;
    }
  });

  const plantId = dashboard?.project?.plant_id;

  // 2. Fetch market trend
  const { data: trend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["market_trend", plantId],
    queryFn: async () => {
      const res = await api.get(`/market/trends/${plantId}`);
      return res.data.data;
    },
    enabled: !!plantId,
  });

  // 3. Fetch market prices history
  const { data: prices, isLoading: isLoadingPrices } = useQuery({
    queryKey: ["market_prices", plantId],
    queryFn: async () => {
      const res = await api.get(`/market/prices/${plantId}?days=30`);
      return res.data.data;
    },
    enabled: !!plantId,
  });

  // 4. Fetch revenue estimate
  const { data: estimate, isLoading: isLoadingEstimate } = useQuery({
    queryKey: ["market_estimate", params.id],
    queryFn: async () => {
      const res = await api.get(`/market/estimate/${params.id}`);
      return res.data.data;
    }
  });

  const isLoading = isLoadingDash || isLoadingTrend || isLoadingPrices || isLoadingEstimate;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-primary">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!dashboard || !trend || !estimate) {
    return (
      <div className="p-8 text-center text-red-400">Failed to load market data.</div>
    );
  }

  // Calculate max price for the chart
  const validPrices = (prices || []).filter((p: any) => p.price_per_kg > 0);
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map((h: any) => h.price_per_kg)) : 100;
  const chartData = validPrices.slice(0, 6).reverse();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href={`/projects/${params.id}`}
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Market Prices<span className="text-emerald-400">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">{trend.plant_name} · {trend.region} Market</p>
        </div>
      </header>

      {/* Current Trend Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
        <div className="glass-card-hover rounded-2xl p-5">
          <p className="text-sm text-text-muted mb-2">Current Retail Price (1kg)</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-white">LKR {trend.current_price}</span>
            <span className={clsx(
              "flex items-center gap-1 text-sm font-semibold pb-0.5",
              trend.direction === "up" ? "text-green-400" : trend.direction === "down" ? "text-red-400" : "text-text-muted"
            )}>
              {trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : trend.direction === "down" ? <TrendingDown className="w-4 h-4" /> : null}
              {trend.change_percentage > 0 ? "+" : ""}{trend.change_percentage.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">Compared to 30 days ago (LKR {trend.price_30d_ago})</p>
        </div>

        <div className="glass-card-hover rounded-2xl p-5">
          <p className="text-sm text-text-muted mb-2">30-Day Range</p>
          <div className="flex flex-col gap-2 mt-2">
            {[
              { label: "Min", value: trend.min_price_30d },
              { label: "Max", value: trend.max_price_30d },
              { label: "Average", value: trend.avg_price_30d.toFixed(1), border: true },
            ].map((row) => (
              <div key={row.label} className={clsx("flex justify-between text-sm", row.border && "pt-2 border-t border-border")}>
                <span className="text-text-muted">{row.label}</span>
                <span className="font-bold text-white">LKR {row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Price Trend Chart */}
      {chartData.length > 0 && (
        <section className="glass-card rounded-3xl p-6 animate-slide-up" style={{ animationDelay: "80ms" }}>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Recent Price Trend
          </h2>
          <div className="flex items-end gap-3 h-48">
            {chartData.map((h: any, idx: number) => {
              const height = Math.max(10, (h.price_per_kg / maxPrice) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-text-secondary font-medium">LKR {h.price_per_kg}</span>
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg transition-all hover:opacity-80 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-text-muted">
                    {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Revenue Calculator */}
      <section className="glass-card rounded-3xl p-6 relative overflow-hidden animate-slide-up" style={{ animationDelay: "150ms" }}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <DollarSign className="w-5 h-5 text-green-400" />
          Revenue Estimate
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div>
            <p className="text-xs text-text-muted">Expected Yield</p>
            <p className="text-xl font-bold text-white">{Math.round(estimate.expected_yield_kg).toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Current Price</p>
            <p className="text-xl font-bold text-white">LKR {estimate.current_price_per_kg.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Est. Costs (Mock)</p>
            <p className="text-xl font-bold text-red-400">LKR 85,000</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Gross Revenue</p>
            <p className="text-2xl font-extrabold text-green-400 text-glow-green">LKR {Math.round(estimate.estimated_revenue).toLocaleString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

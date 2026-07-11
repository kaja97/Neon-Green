"use client";

import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format, parseISO } from "date-fns";

export default function MarketPage({ params }: { params: { id: string } }) {
  // 1. Fetch dashboard to get project details (including plant_id)
  const { data: dashboard, isLoading: isLoadingDash } = useQuery({
    queryKey: ["dashboard", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}/dashboard`);
      return res.data;
    }
  });

  const plantId = dashboard?.project?.plant_id;

  // 2. Fetch market trend
  const { data: trend, isLoading: isLoadingTrend } = useQuery({
    queryKey: ["market_trend", plantId],
    queryFn: async () => {
      const res = await api.get(`/market/trends/${plantId}`);
      return res.data;
    },
    enabled: !!plantId,
  });

  // 3. Fetch market prices history
  const { data: prices, isLoading: isLoadingPrices } = useQuery({
    queryKey: ["market_prices", plantId],
    queryFn: async () => {
      const res = await api.get(`/market/prices/${plantId}?days=30`);
      return res.data;
    },
    enabled: !!plantId,
  });

  // 4. Fetch revenue estimate
  const { data: estimate, isLoading: isLoadingEstimate } = useQuery({
    queryKey: ["market_estimate", params.id],
    queryFn: async () => {
      const res = await api.get(`/market/estimate/${params.id}`);
      return res.data;
    }
  });

  const isLoading = isLoadingDash || isLoadingTrend || isLoadingPrices || isLoadingEstimate;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!dashboard || !trend || !estimate) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load market data.
      </div>
    );
  }

  // Calculate max price for the chart
  const validPrices = (prices || []).filter((p: any) => p.price_per_kg > 0);
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map((h: any) => h.price_per_kg)) : 100;

  // We want to sample a few dates for the mini chart
  const chartData = validPrices.slice(0, 6).reverse();

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Market Prices</h1>
          <p className="text-slate-500 text-sm">{trend.plant_name} · {trend.region} Market</p>
        </div>
      </header>

      {/* Current Trend Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Current Retail Price (1kg)</p>
          <div className="flex items-end gap-3">
            <span className="text-2xl font-bold text-slate-800">LKR {trend.current_price}</span>
            <span className={clsx(
              "flex items-center gap-1 text-sm font-semibold pb-0.5",
              trend.direction === "up" ? "text-green-600" : trend.direction === "down" ? "text-red-500" : "text-slate-500"
            )}>
              {trend.direction === "up" ? <TrendingUp className="w-4 h-4" /> : trend.direction === "down" ? <TrendingDown className="w-4 h-4" /> : null}
              {trend.change_percentage > 0 ? "+" : ""}{trend.change_percentage.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Compared to 30 days ago (LKR {trend.price_30d_ago})</p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-colors shadow-sm">
           <p className="text-sm text-slate-500 mb-2">30-Day Range</p>
           <div className="flex flex-col gap-2 mt-2">
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Min</span>
               <span className="font-bold text-slate-700">LKR {trend.min_price_30d}</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Max</span>
               <span className="font-bold text-slate-700">LKR {trend.max_price_30d}</span>
             </div>
             <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
               <span className="text-slate-500">Average</span>
               <span className="font-bold text-slate-700">LKR {trend.avg_price_30d.toFixed(1)}</span>
             </div>
           </div>
        </div>
      </section>

      {/* Price Trend Chart (Simple bar chart) */}
      {chartData.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Recent Price Trend
          </h2>
          <div className="flex items-end gap-3 h-48">
            {chartData.map((h: any, idx: number) => {
              const height = Math.max(10, (h.price_per_kg / maxPrice) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">LKR {h.price_per_kg}</span>
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-green-300 rounded-t-lg transition-all hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-400">
                    {new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Revenue Calculator */}
      <section className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-100 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 relative z-10">
          <DollarSign className="w-5 h-5 text-green-600" />
          Revenue Estimate
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div>
            <p className="text-xs text-slate-500">Expected Yield</p>
            <p className="text-xl font-bold text-slate-800">{Math.round(estimate.expected_yield_kg).toLocaleString()} kg</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Price</p>
            <p className="text-xl font-bold text-slate-800">LKR {estimate.current_price_per_kg.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Est. Costs (Mock)</p>
            <p className="text-xl font-bold text-red-500">LKR 85,000</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Gross Revenue</p>
            <p className="text-2xl font-extrabold text-green-600">LKR {Math.round(estimate.estimated_revenue).toLocaleString()}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

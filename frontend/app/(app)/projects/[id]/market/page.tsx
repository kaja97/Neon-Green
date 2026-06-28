import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function MarketPage({ params }: { params: { id: string } }) {
  const prices = [
    { name: "Tomato (1kg)", price: "LKR 180", change: "+12%", trend: "up" },
    { name: "Tomato (Wholesale)", price: "LKR 140", change: "+8%", trend: "up" },
    { name: "Cherry Tomato (1kg)", price: "LKR 320", change: "-3%", trend: "down" },
  ];

  const history = [
    { week: "Week 1", price: 120 },
    { week: "Week 2", price: 135 },
    { week: "Week 3", price: 150 },
    { week: "Week 4", price: 160 },
    { week: "Week 5", price: 155 },
    { week: "Week 6", price: 180 },
  ];

  const maxPrice = Math.max(...history.map((h) => h.price));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Market Prices</h1>
          <p className="text-slate-400 text-sm">Tomato · Jaffna Market</p>
        </div>
      </header>

      {/* Current Prices */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prices.map((p) => (
          <div key={p.name} className="bg-card border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
            <p className="text-sm text-slate-400 mb-2">{p.name}</p>
            <div className="flex items-end gap-3">
              <span className="text-2xl font-bold text-white">{p.price}</span>
              <span className={clsx(
                "flex items-center gap-1 text-sm font-semibold pb-0.5",
                p.trend === "up" ? "text-emerald-400" : "text-red-400"
              )}>
                {p.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {p.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Price Trend Chart (Simple bar chart) */}
      <section className="bg-card border border-slate-800 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          6-Week Price Trend
        </h2>
        <div className="flex items-end gap-3 h-48">
          {history.map((h) => (
            <div key={h.week} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">LKR {h.price}</span>
              <div
                className="w-full bg-gradient-to-t from-primary to-emerald-300 rounded-t-lg transition-all hover:opacity-80"
                style={{ height: `${(h.price / maxPrice) * 100}%` }}
              />
              <span className="text-xs text-slate-500">{h.week.replace("Week ", "W")}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="bg-gradient-to-br from-card to-background border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 relative z-10">
          <DollarSign className="w-5 h-5 text-primary" />
          Revenue Estimate
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div>
            <p className="text-xs text-slate-500">Expected Yield</p>
            <p className="text-xl font-bold text-white">2,400 kg</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Current Price</p>
            <p className="text-xl font-bold text-white">LKR 180/kg</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Est. Costs</p>
            <p className="text-xl font-bold text-red-400">LKR 85,000</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Est. Profit</p>
            <p className="text-2xl font-extrabold text-primary">LKR 347,000</p>
          </div>
        </div>
      </section>
    </div>
  );
}

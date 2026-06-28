import FarmingCircle from "@/components/project/FarmingCircle";
import { ArrowLeft, Settings, AlertTriangle, Bot, CloudRain, FlaskConical, Calendar, Bug, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function ProjectDashboard({ params }: { params: { id: string } }) {
  const stages: { name: string; status: "done" | "current" | "pending" }[] = [
    { name: "Germ", status: "done" },
    { name: "Seed", status: "done" },
    { name: "Veg", status: "done" },
    { name: "Flower", status: "current" },
    { name: "Fruit", status: "pending" },
    { name: "Harv", status: "pending" },
  ];

  const serviceBlocks = [
    { href: `/projects/${params.id}/weather`, icon: CloudRain, label: "Weather", value: "32°C", sub: "Cloudy", color: "text-blue-400", bg: "bg-blue-500/10" },
    { href: `/projects/${params.id}/soil`, icon: FlaskConical, label: "Soil", value: "pH 6.2", sub: "N: Low", color: "text-amber-400", bg: "bg-amber-500/10" },
    { href: `/projects/${params.id}/plan`, icon: Calendar, label: "Plan", value: "3 Tasks", sub: "Today", color: "text-violet-400", bg: "bg-violet-500/10" },
    { href: `/projects/${params.id}/disease`, icon: Bug, label: "Disease", value: "1 Alert", sub: "Blight", color: "text-red-400", bg: "bg-red-500/10" },
    { href: `/projects/${params.id}/market`, icon: TrendingUp, label: "Market", value: "LKR 180", sub: "↑ 12%", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Tomato Farm</h1>
            <p className="text-slate-400 text-sm">1 Acre · Organic</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Farming Circle */}
      <section className="bg-card/30 rounded-3xl border border-slate-800/50 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <FarmingCircle stages={stages} />
        <div className="text-center pb-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide">
            DAY 45 OF 90 · 50%
          </span>
        </div>
      </section>

      {/* Alerts */}
      <section>
        <Link href={`/projects/${params.id}/weather`} className="block">
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl hover:bg-rose-500/15 transition-colors">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-rose-500 font-semibold text-sm">Heavy rain tomorrow</h4>
              <p className="text-rose-400/80 text-sm mt-1">
                Postpone fertilizer application to avoid nutrient runoff.
              </p>
            </div>
          </div>
        </Link>
      </section>

      {/* Service Blocks Grid */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {serviceBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Link
                key={block.label}
                href={block.href}
                className="bg-card border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all hover:shadow-lg group"
              >
                <div className={`p-2 rounded-xl w-fit mb-3 ${block.bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${block.color}`} />
                </div>
                <p className="text-xs text-slate-500 mb-0.5">{block.label}</p>
                <p className="text-lg font-bold text-white">{block.value}</p>
                <p className="text-xs text-slate-400">{block.sub}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* AI Summary Card */}
      <section>
        <div className="bg-gradient-to-br from-card to-background border border-emerald-500/20 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2 text-emerald-400">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold text-lg">AI Insight</h3>
            </div>
          </div>
          
          <p className="text-slate-300 leading-relaxed relative z-10 mb-6">
            &quot;Your tomatoes are exactly on track. The upcoming high humidity increases the risk of early blight. Ensure you check the lower leaves today and maintain good airflow.&quot;
          </p>

          <Link
            href={`/projects/${params.id}/ai`}
            className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition-colors relative z-10"
          >
            Chat with Assistant
          </Link>
        </div>
      </section>
    </div>
  );
}

import { ArrowLeft, FlaskConical, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function SoilPage({ params }: { params: { id: string } }) {
  const nutrients = [
    { name: "pH Level", value: "6.2", status: "good", ideal: "6.0 – 7.0" },
    { name: "Nitrogen (N)", value: "Low", status: "bad", ideal: "Medium – High" },
    { name: "Phosphorus (P)", value: "Medium", status: "good", ideal: "Medium" },
    { name: "Potassium (K)", value: "Medium", status: "good", ideal: "Medium – High" },
    { name: "Organic Matter", value: "3.2%", status: "good", ideal: "> 3%" },
    { name: "Moisture", value: "42%", status: "good", ideal: "35 – 55%" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Soil Analysis</h1>
          <p className="text-slate-400 text-sm">Last tested: 3 days ago</p>
        </div>
      </header>

      {/* Nutrient Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nutrients.map((n) => (
          <div
            key={n.name}
            className={clsx(
              "bg-card border rounded-2xl p-5 hover:shadow-lg transition-all",
              n.status === "bad" ? "border-red-500/30 bg-red-500/5" : "border-slate-800"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{n.name}</span>
              {n.status === "bad" ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
            </div>
            <div className="text-2xl font-bold text-white">{n.value}</div>
            <p className="text-xs text-slate-500 mt-1">Ideal: {n.ideal}</p>
          </div>
        ))}
      </section>

      {/* Recommendations */}
      <section className="bg-card border border-slate-800 rounded-3xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          Recommendations
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
            <h3 className="font-semibold text-red-400 text-sm">Nitrogen Deficiency</h3>
            <p className="text-sm text-slate-400 mt-1">
              Apply 25kg of organic compost per acre, or use Urea (46-0-0) at 15kg/acre for conventional farming.
            </p>
          </div>
          <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-2xl">
            <h3 className="font-semibold text-emerald-400 text-sm">Potassium Boost (Flowering Stage)</h3>
            <p className="text-sm text-slate-400 mt-1">
              Since you&apos;re entering flowering, apply MOP (Muriate of Potash) at 45kg/acre to support fruit set.
            </p>
          </div>
        </div>
      </section>

      {/* Add Soil Test */}
      <button className="w-full py-4 bg-primary/10 border-2 border-dashed border-primary/30 text-primary font-semibold rounded-2xl hover:bg-primary/20 transition-colors">
        + Submit New Soil Test Results
      </button>
    </div>
  );
}

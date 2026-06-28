import { ArrowLeft, AlertTriangle, Bug, Search, Camera } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function DiseasePage({ params }: { params: { id: string } }) {
  const diseases = [
    {
      id: "1",
      name: "Early Blight",
      risk: "high",
      description: "Dark concentric rings on lower leaves. Caused by Alternaria solani fungus.",
      solution: "Apply copper-based fungicide. Remove affected leaves. Improve air circulation.",
    },
    {
      id: "2",
      name: "Blossom End Rot",
      risk: "medium",
      description: "Dark, sunken spots at the bottom of fruits. Caused by calcium deficiency and uneven watering.",
      solution: "Maintain consistent watering. Apply calcium foliar spray. Mulch to retain moisture.",
    },
    {
      id: "3",
      name: "Whitefly Infestation",
      risk: "low",
      description: "Small white flying insects on leaf undersides. Can transmit viral diseases.",
      solution: "Use yellow sticky traps. Spray neem oil solution weekly. Encourage natural predators.",
    },
  ];

  const riskColors = {
    high: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", badge: "bg-red-500" },
    medium: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", badge: "bg-amber-500" },
    low: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "bg-emerald-500" },
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Disease Watch</h1>
          <p className="text-slate-400 text-sm">Tomato Farm · Current threats</p>
        </div>
      </header>

      {/* Search & Report */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search diseases, pests..."
            className="w-full bg-card border border-slate-800 text-white rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-600"
          />
        </div>
        <button className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-3 rounded-xl font-semibold hover:bg-amber-500/30 transition-colors shrink-0">
          <Camera className="w-5 h-5" />
          <span className="hidden md:inline">Report Issue</span>
        </button>
      </div>

      {/* Disease Cards */}
      <div className="space-y-4">
        {diseases.map((d) => {
          const colors = riskColors[d.risk as keyof typeof riskColors];
          return (
            <div key={d.id} className={clsx("bg-card border rounded-3xl p-6", colors.border)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2 rounded-xl", colors.bg)}>
                    <Bug className={clsx("w-5 h-5", colors.text)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{d.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Current risk for your farm</p>
                  </div>
                </div>
                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold text-white uppercase", colors.badge)}>
                  {d.risk}
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{d.description}</p>
              <div className="bg-slate-800/30 p-4 rounded-2xl">
                <h4 className="text-sm font-semibold text-emerald-400 mb-1">💊 Treatment</h4>
                <p className="text-sm text-slate-400">{d.solution}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

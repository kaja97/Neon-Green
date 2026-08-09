"use client";

import { useDashboard } from "@/lib/hooks/useDashboard";
import { Loader2, Sprout, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function NutrientGuideBlock({ projectId }: { projectId: string }) {
  const { data, isLoading } = useDashboard(projectId);

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-6 h-6 animate-spin text-green-400" />
      </div>
    );
  }

  const soil = data?.soil_status;
  const stage = data?.current_stage;
  const method = data?.project?.farming_method || 'organic';

  // Helper to determine status color
  const getStatusColor = (status: string) => {
    if (!status) return "text-slate-400";
    const s = status.toLowerCase();
    if (s.includes("low")) return "text-red-400";
    if (s.includes("high")) return "text-amber-400";
    return "text-green-400";
  };
  
  const getStatusIcon = (status: string) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s.includes("low") || s.includes("high")) return <AlertTriangle className="w-3.5 h-3.5" />;
    return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  const getRecommendation = () => {
    if (!soil) return "No soil test data available. Add a soil test to get nutrient calculations.";
    
    const needsN = soil.nitrogen_status?.toLowerCase().includes("low");
    const needsP = soil.phosphorus_status?.toLowerCase().includes("low");
    const needsK = soil.potassium_status?.toLowerCase().includes("low");
    
    if (needsN || needsP || needsK) {
       let recs = [];
       if (needsN) recs.push(method === 'organic' ? "Compost/Manure (High N)" : "Urea/Nitrogen-rich");
       if (needsP) recs.push(method === 'organic' ? "Bone meal" : "DAP/Phosphorus");
       if (needsK) recs.push(method === 'organic' ? "Wood ash/Kelp" : "MOP/Potassium");
       return `Soil deficiencies detected. Recommended application: ${recs.join(", ")}.`;
    }
    return "Soil nutrients are optimal for current stage.";
  };

  return (
    <div className="glass-card p-5 relative overflow-hidden flex flex-col h-full hover:border-green-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <Sprout className="w-4 h-4 text-green-400" />
        </div>
        <h3 className="font-bold text-white text-sm">Nutrient Guide</h3>
      </div>

      <div className="space-y-4 relative z-10 flex-1">
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Growth Stage</h4>
          <p className="text-sm text-green-400 font-medium capitalize">{stage?.stage_name || "Active"}</p>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Soil Status</h4>
          {soil ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                <span className="text-xs text-text-muted block mb-0.5">Nitrogen</span>
                <span className={clsx("text-xs font-semibold flex items-center gap-1", getStatusColor(soil.nitrogen_status))}>
                  {getStatusIcon(soil.nitrogen_status)} <span className="capitalize">{soil.nitrogen_status.replace("level_", "")}</span>
                </span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                <span className="text-xs text-text-muted block mb-0.5">Phosphorus</span>
                <span className={clsx("text-xs font-semibold flex items-center gap-1", getStatusColor(soil.phosphorus_status))}>
                  {getStatusIcon(soil.phosphorus_status)} <span className="capitalize">{soil.phosphorus_status.replace("level_", "")}</span>
                </span>
              </div>
              <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                <span className="text-xs text-text-muted block mb-0.5">Potassium</span>
                <span className={clsx("text-xs font-semibold flex items-center gap-1", getStatusColor(soil.potassium_status))}>
                  {getStatusIcon(soil.potassium_status)} <span className="capitalize">{soil.potassium_status.replace("level_", "")}</span>
                </span>
              </div>
            </div>
          ) : (
             <p className="text-xs text-slate-400 italic">No soil data</p>
          )}
        </div>

        <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl mt-auto">
          <p className="text-xs text-slate-300 leading-relaxed">
            {getRecommendation()}
          </p>
        </div>
      </div>
      
      <Link href={`/projects/${projectId}/fertilizer`} className="mt-4 pt-3 border-t border-white/5 text-[11px] text-green-400 hover:text-green-300 font-semibold uppercase tracking-wider flex items-center justify-between group">
        <span>View detailed fertilizer log</span>
        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
      </Link>
    </div>
  );
}

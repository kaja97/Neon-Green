"use client";

import AIChatWindow from "@/components/ai/AIChatWindow";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AIChatPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useDashboard(params.id);

  const cropName = data?.project?.plant?.common_name || "Farm";
  const farmingMethod = data?.project?.farming_method || "";
  const currentStage = data?.farming_circle?.stages?.find((s: any) => s.is_current);
  const stageName = currentStage?.stage?.stage_name || "";

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${params.id}`}
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400 text-glow-green animate-pulse" />
              AI Advisor
            </h1>
            <p className="text-slate-400 text-sm">
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading project...
                </span>
              ) : (
                <>
                  <span className="text-green-400 font-medium">{cropName}</span>
                  {stageName && (
                    <>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span>{stageName}</span>
                    </>
                  )}
                  {farmingMethod && (
                    <>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span className="capitalize">{farmingMethod}</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Project Data Loaded
          </span>
        </div>
      </header>

      {/* Chat Window */}
      <AIChatWindow projectId={params.id} />
    </div>
  );
}

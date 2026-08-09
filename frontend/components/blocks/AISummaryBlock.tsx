"use client";

import { Sparkles, RefreshCw, Zap } from "lucide-react";
import { useAISummary, useRefreshAISummary } from "@/lib/hooks/useAISummary";
import { getRelativeTimeString } from "@/lib/utils/dateUtils";

interface AISummaryBlockProps {
  projectId: string;
}

export default function AISummaryBlock({ projectId }: AISummaryBlockProps) {
  const { data: summary, isLoading } = useAISummary(projectId);
  const refreshMutation = useRefreshAISummary(projectId);

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-white">AI Summary</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            $0.00
          </span>
          <button
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
            className="p-1.5 rounded-lg bg-surface-tertiary text-text-muted hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-50"
            title="Refresh AI Summary"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-3 bg-surface-tertiary rounded-lg animate-shimmer bg-shimmer bg-[length:200%_100%] w-full" />
          <div className="h-3 bg-surface-tertiary rounded-lg animate-shimmer bg-shimmer bg-[length:200%_100%] w-3/4" />
        </div>
      ) : (
        <p className="text-xs text-text-secondary leading-relaxed relative z-10 line-clamp-3">
          {summary?.summary || "No AI summary yet. Tap refresh to generate one."}
        </p>
      )}

      {summary?.generated_at && (
        <p className="text-[10px] text-text-muted mt-2 relative z-10">
          Generated {getRelativeTimeString(summary.generated_at)}
        </p>
      )}
    </div>
  );
}

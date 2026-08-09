interface Stage {
  name: string;
  order: number;
  start_day: number;
  end_day: number;
  status?: string;
}

/**
 * Determine the current growth stage based on days since planting.
 */
export function getCurrentStage(
  stages: Stage[],
  daysSincePlanting: number
): Stage | null {
  if (!stages || stages.length === 0) return null;

  const sorted = [...stages].sort((a, b) => a.order - b.order);

  for (const stage of sorted) {
    if (daysSincePlanting >= stage.start_day && daysSincePlanting <= stage.end_day) {
      return stage;
    }
  }

  // If past all stages, return the last one
  if (daysSincePlanting > sorted[sorted.length - 1].end_day) {
    return sorted[sorted.length - 1];
  }

  return sorted[0];
}

/**
 * Calculate progress percentage within the current stage.
 */
export function getStageProgress(
  stage: Stage,
  daysSincePlanting: number
): number {
  const duration = stage.end_day - stage.start_day;
  if (duration <= 0) return 100;

  const elapsed = daysSincePlanting - stage.start_day;
  return Math.min(100, Math.max(0, Math.round((elapsed / duration) * 100)));
}

/**
 * Calculate overall crop progress percentage.
 */
export function getOverallProgress(
  daysSincePlanting: number,
  totalDays: number
): number {
  if (totalDays <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((daysSincePlanting / totalDays) * 100)));
}

/**
 * Map stages to visual status indicators for the FarmingCircle component.
 */
export function mapStagesToCircle(
  stages: Stage[],
  daysSincePlanting: number
): Array<{ name: string; status: "done" | "current" | "pending" }> {
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  return sorted.map((stage) => {
    if (daysSincePlanting > stage.end_day) {
      return { name: stage.name, status: "done" as const };
    }
    if (daysSincePlanting >= stage.start_day && daysSincePlanting <= stage.end_day) {
      return { name: stage.name, status: "current" as const };
    }
    return { name: stage.name, status: "pending" as const };
  });
}

import { Check, Star, Circle } from "lucide-react";
import { clsx } from "clsx";

interface Stage {
  name: string;
  status: "done" | "current" | "pending";
}

interface FarmingCircleProps {
  stages: Stage[];
}

export default function FarmingCircle({ stages }: FarmingCircleProps) {
  return (
    <div className="flex flex-col items-center py-6 w-full overflow-x-auto hide-scrollbar">
      <div className="flex items-center min-w-max px-4">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.name} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={clsx(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 z-10 transition-colors",
                    stage.status === "done" && "bg-primary border-primary text-white",
                    stage.status === "current" && "bg-card border-primary text-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]",
                    stage.status === "pending" && "bg-card border-slate-700 text-slate-600"
                  )}
                >
                  {stage.status === "done" && <Check className="w-6 h-6" />}
                  {stage.status === "current" && <Star className="w-6 h-6" />}
                  {stage.status === "pending" && <Circle className="w-6 h-6" />}
                </div>
                <span
                  className={clsx(
                    "text-xs font-semibold uppercase tracking-wider",
                    stage.status === "current" ? "text-primary" : "text-slate-500"
                  )}
                >
                  {stage.name}
                </span>
              </div>

              {!isLast && (
                <div
                  className={clsx(
                    "w-16 h-1 -mt-6 rounded-full mx-2 transition-colors",
                    stage.status === "done" ? "bg-primary" : "bg-slate-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

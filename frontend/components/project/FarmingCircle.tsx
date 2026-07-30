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
    <div className="py-8 w-full overflow-x-auto hide-scrollbar">
      <div className="flex items-center min-w-max px-6 relative md:justify-center">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          
          return (
            <div key={stage.name} className="flex items-center">
              <div className="flex flex-col items-center gap-3 group relative">
                <div
                  className={clsx(
                    "flex items-center justify-center w-14 h-14 rounded-full border-2 z-10 transition-all duration-500",
                    stage.status === "done" && "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.35)]",
                    stage.status === "current" && "bg-slate-900 border-green-400 text-green-400 shadow-[0_0_25px_rgba(34,197,94,0.7)] scale-115 animate-pulse",
                    stage.status === "pending" && "bg-slate-950/50 border-slate-800 text-slate-600"
                  )}
                >
                  {stage.status === "done" && <Check className="w-7 h-7 drop-shadow-md" />}
                  {stage.status === "current" && <Star className="w-7 h-7 drop-shadow-md text-glow-green" />}
                  {stage.status === "pending" && <Circle className="w-5 h-5 text-slate-700" />}
                </div>
                <span
                  className={clsx(
                    "text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                    stage.status === "current" ? "text-green-400 text-glow-green" : "text-slate-500 group-hover:text-slate-400"
                  )}
                >
                  {stage.name}
                </span>
              </div>

              {!isLast && (
                <div
                  className={clsx(
                    "w-20 h-1 -mt-7 rounded-full mx-1 transition-all duration-700",
                    stage.status === "done" ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-slate-800/80"
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

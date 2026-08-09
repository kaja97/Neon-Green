import { Sprout, ChevronRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface ProjectCardProps {
  id: string;
  name: string;
  area: string;
  stage: string;
  day: number;
  totalDays: number;
  tasksToday: number;
  color?: "emerald" | "amber" | "blue" | "rose";
}

export default function ProjectCard({
  id,
  name,
  area,
  stage,
  day,
  totalDays,
  tasksToday,
  color = "emerald",
}: ProjectCardProps) {
  const progress = Math.min(100, Math.round((day / totalDays) * 100));

  const colorVariants = {
    emerald: "bg-green-500",
    amber: "bg-amber-400",
    blue: "bg-blue-400",
    rose: "bg-rose-400",
  };

  const textVariants = {
    emerald: "text-green-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    rose: "text-rose-400",
  };

  const bgVariants = {
    emerald: "bg-green-500/20",
    amber: "bg-amber-400/20",
    blue: "bg-blue-400/20",
    rose: "bg-rose-400/20",
  };

  return (
    <Link
      href={`/projects/${id}`}
      className="block group relative p-6 h-full transition-all duration-500"
    >
      {/* Internal ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent blur-3xl rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={clsx("p-3 rounded-2xl flex items-center justify-center border border-white/5 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:border-green-500/30", bgVariants[color])}>
            <Sprout className={clsx("w-7 h-7 drop-shadow-md", textVariants[color])} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-md group-hover:text-green-400 transition-colors duration-300">{name}</h3>
            <p className="text-sm font-medium text-slate-400">{area}</p>
          </div>
        </div>
        <div className="p-2 bg-white/5 rounded-full border border-white/5 group-hover:bg-green-500/20 group-hover:border-green-500/30 group-hover:text-green-400 text-slate-400 transition-all duration-500">
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between text-sm font-medium mb-3">
          <span className="text-slate-300 group-hover:text-white transition-colors">{progress}% Complete</span>
          <span className="text-slate-400">Day {day} of {totalDays}</span>
        </div>
        <div className="w-full h-2.5 bg-black/40 border border-white/5 rounded-full overflow-hidden shadow-inner">
          <div
            className={clsx("h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(34,197,94,0.6)]", colorVariants[color])}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium group-hover:border-green-500/20 transition-colors">
            {stage}
          </span>
        </div>
        {tasksToday > 0 && (
          <span className="font-bold text-green-400 bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)] px-3 py-1 rounded-full animate-pulse">
            {tasksToday} {tasksToday === 1 ? 'task' : 'tasks'} today
          </span>
        )}
      </div>
    </Link>
  );
}

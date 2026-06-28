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
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500",
  };

  const bgVariants = {
    emerald: "bg-emerald-500/10",
    amber: "bg-amber-500/10",
    blue: "bg-blue-500/10",
    rose: "bg-rose-500/10",
  };

  return (
    <Link
      href={`/projects/${id}`}
      className="block group relative overflow-hidden rounded-3xl bg-card border border-slate-800 p-6 transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent blur-3xl rounded-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={clsx("p-3 rounded-2xl flex items-center justify-center", bgVariants[color])}>
            <Sprout className={clsx("w-7 h-7", `text-${color}-500`)} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">{name}</h3>
            <p className="text-sm font-medium text-slate-400">{area}</p>
          </div>
        </div>
        <div className="p-2 bg-slate-800/50 rounded-full group-hover:bg-primary/20 group-hover:text-primary text-slate-500 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between text-sm font-medium mb-3">
          <span className="text-white">{progress}% Complete</span>
          <span className="text-slate-400">Day {day} of {totalDays}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-1000", colorVariants[color])}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
            {stage}
          </span>
        </div>
        {tasksToday > 0 && (
          <span className="font-semibold text-amber-400">
            {tasksToday} {tasksToday === 1 ? 'task' : 'tasks'} today
          </span>
        )}
      </div>
    </Link>
  );
}

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
    emerald: "bg-green-600",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500",
  };

  const textVariants = {
    emerald: "text-green-600",
    amber: "text-amber-500",
    blue: "text-blue-500",
    rose: "text-rose-500",
  };

  const bgVariants = {
    emerald: "bg-green-50",
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    rose: "bg-rose-50",
  };

  return (
    <Link
      href={`/projects/${id}`}
      className="block group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 transition-all hover:border-slate-300 hover:shadow-xl hover:shadow-green-900/5 shadow-sm"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent blur-3xl rounded-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className={clsx("p-3 rounded-2xl flex items-center justify-center", bgVariants[color])}>
            <Sprout className={clsx("w-7 h-7", textVariants[color])} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{name}</h3>
            <p className="text-sm font-medium text-slate-500">{area}</p>
          </div>
        </div>
        <div className="p-2 bg-slate-50 rounded-full group-hover:bg-green-50 group-hover:text-green-600 text-slate-400 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between text-sm font-medium mb-3">
          <span className="text-slate-700">{progress}% Complete</span>
          <span className="text-slate-500">Day {day} of {totalDays}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-1000", colorVariants[color])}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 font-medium">
            {stage}
          </span>
        </div>
        {tasksToday > 0 && (
          <span className="font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
            {tasksToday} {tasksToday === 1 ? 'task' : 'tasks'} today
          </span>
        )}
      </div>
    </Link>
  );
}

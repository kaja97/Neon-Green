import { ArrowLeft, CheckCircle2, Circle, SkipForward, Clock } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function PlanPage({ params }: { params: { id: string } }) {
  const weeks = [
    {
      label: "This Week (Day 43–49)",
      activities: [
        { id: 1, title: "Water plants — 180L", time: "Daily 6:00 AM", status: "done", type: "💧" },
        { id: 2, title: "Check for early blight signs", time: "Mon, Wed, Fri", status: "done", type: "🔍" },
        { id: 3, title: "Apply MOP 45kg/acre", time: "Thursday", status: "current", type: "🧪" },
        { id: 4, title: "Pruning — remove suckers", time: "Saturday", status: "pending", type: "✂️" },
      ],
    },
    {
      label: "Next Week (Day 50–56)",
      activities: [
        { id: 5, title: "Water plants — 200L", time: "Daily 6:00 AM", status: "pending", type: "💧" },
        { id: 6, title: "Foliar spray — micronutrients", time: "Tuesday", status: "pending", type: "🧪" },
        { id: 7, title: "Install staking support", time: "Wednesday", status: "pending", type: "🔧" },
        { id: 8, title: "Pest check — whitefly", time: "Friday", status: "pending", type: "🔍" },
      ],
    },
    {
      label: "Week 8 (Day 57–63)",
      activities: [
        { id: 9, title: "Water plants — 200L", time: "Daily", status: "pending", type: "💧" },
        { id: 10, title: "Harvest first ripe fruits", time: "Mon/Thu", status: "pending", type: "🍅" },
        { id: 11, title: "Apply calcium spray", time: "Wednesday", status: "pending", type: "🧪" },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activity Plan</h1>
          <p className="text-slate-400 text-sm">Full timeline · Tomato Farm</p>
        </div>
      </header>

      {weeks.map((week) => (
        <section key={week.label}>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">{week.label}</h2>
          <div className="space-y-3">
            {week.activities.map((task) => (
              <div
                key={task.id}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
                  task.status === "done" && "bg-card/30 border-slate-800/50",
                  task.status === "current" && "bg-primary/5 border-primary/30",
                  task.status === "pending" && "bg-card border-slate-800 hover:border-slate-700"
                )}
              >
                <span className="text-xl w-8 text-center">{task.type}</span>
                <div className="flex-1">
                  <h3 className={clsx(
                    "font-medium",
                    task.status === "done" ? "text-slate-500 line-through" : "text-white"
                  )}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs text-slate-500">{task.time}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {task.status === "done" && <CheckCircle2 className="w-6 h-6 text-primary" />}
                  {task.status === "current" && (
                    <div className="flex gap-2">
                      <button className="p-1.5 bg-primary/20 rounded-lg text-primary hover:bg-primary/30 transition-colors">
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                      <button className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {task.status === "pending" && <Circle className="w-6 h-6 text-slate-700" />}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { clsx } from "clsx";

export default function ActivityBlock() {
  const activities = [
    { id: 1, title: "Water plants (180L)", type: "irrigation", status: "done", time: "06:00 AM" },
    { id: 2, title: "Apply Potassium", type: "fertilizer", status: "pending", time: "04:30 PM" },
    { id: 3, title: "Check for Blight", type: "disease", status: "pending", time: "Anytime" },
  ];

  return (
    <div className="bg-card border border-slate-800 rounded-3xl p-6 min-w-[320px] md:col-span-2 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-white">Today's Tasks</h3>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
          1/3 Done
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <button className="flex-shrink-0">
              {task.status === "done" ? (
                <CheckCircle2 className="w-7 h-7 text-primary" />
              ) : (
                <Circle className="w-7 h-7 text-slate-600 hover:text-primary transition-colors" />
              )}
            </button>
            <div className="flex-1">
              <h4
                className={clsx(
                  "font-medium",
                  task.status === "done" ? "text-slate-500 line-through" : "text-slate-200"
                )}
              >
                {task.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs text-slate-500">{task.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

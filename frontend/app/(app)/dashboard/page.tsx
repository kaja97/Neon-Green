import ProjectCard from "@/components/dashboard/ProjectCard";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock Data
  const projects = [
    {
      id: "1",
      name: "Tomato Farm",
      area: "1 Acre",
      stage: "Flowering",
      day: 45,
      totalDays: 90,
      tasksToday: 3,
      color: "emerald" as const,
    },
    {
      id: "2",
      name: "Chili Pepper",
      area: "0.5 Acres",
      stage: "Vegetative",
      day: 40,
      totalDays: 115,
      tasksToday: 2,
      color: "rose" as const,
    },
    {
      id: "3",
      name: "Red Onion",
      area: "2 Acres",
      stage: "Germination",
      day: 5,
      totalDays: 60,
      tasksToday: 0,
      color: "amber" as const,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your {projects.length} ongoing crops</p>
        </div>
        <Link
          href="/projects/new"
          className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>

      {/* Mobile Floating Action Button */}
      <Link
        href="/projects/new"
        className="md:hidden fixed bottom-24 right-4 z-40 bg-primary text-white p-4 rounded-full shadow-xl shadow-emerald-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}

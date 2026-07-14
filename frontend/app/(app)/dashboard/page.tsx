"use client";

import { useProjects } from "@/lib/hooks/useProjects";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Plus, Loader2, Sprout, FolderOpen, User, Bell } from "lucide-react";
import Link from "next/link";
import ParallaxBackground from "@/components/dashboard/ParallaxBackground";
import WeatherForecast from "@/components/dashboard/WeatherForecast";

export default function DashboardPage() {
  const { data: projects, isLoading, error } = useProjects("active");

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="p-6 glass-card text-center max-w-sm animate-fade-in">
          <p className="text-red-400 font-medium">
            Failed to load projects. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter((p) => p.is_active || p.status === "active") || [];

  return (
    <>
      <ParallaxBackground />

      <div className="min-h-[150vh] relative z-10 pt-8 pb-32">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="flex items-center justify-between glass-card p-6 animate-slide-up">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
                Command Center
              </h1>
              <p className="text-text-secondary font-medium mt-1.5">
                {activeProjects.length > 0
                  ? `Managing ${activeProjects.length} active crop${activeProjects.length > 1 ? "s" : ""}`
                  : "Ready to start your first project"}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/projects"
                className="flex items-center gap-2 px-4 py-2.5 glass-card-hover text-text-secondary hover:text-white font-semibold text-sm transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                All Projects
              </Link>
              <Link
                href="/projects/new"
                className="flex items-center gap-2 btn-primary px-6 py-3"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Link>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up" style={{ animationDelay: "50ms" }}>
            <Link href="/projects" className="glass-card-hover p-4 group flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Projects</p>
                <p className="text-xs text-text-muted">{(projects?.length || 0)} total</p>
              </div>
            </Link>
            <Link href="/profile" className="glass-card-hover p-4 group flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:scale-110 transition-transform">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Profile</p>
                <p className="text-xs text-text-muted">Settings</p>
              </div>
            </Link>
            <Link href="/notifications" className="glass-card-hover p-4 group flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Alerts</p>
                <p className="text-xs text-text-muted">Notifications</p>
              </div>
            </Link>
            <Link href="/projects/new" className="glass-card-hover p-4 group flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">New</p>
                <p className="text-xs text-text-muted">Start project</p>
              </div>
            </Link>
          </div>

          {/* Project Display Block */}
          {activeProjects.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 px-4 glass-card-hover text-center animate-slide-up">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 animate-float glow-green">
                <Sprout className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                No Active Projects
              </h3>
              <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
                Initialize your first farming project to unlock AI-driven
                insights, activity planning, and hyper-local weather tracking.
              </p>
              <Link
                href="/projects/new"
                className="btn-primary px-8 py-4 text-lg flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Initialize Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {activeProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="relative group animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Glow behind card */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-500" />

                  <div className="relative glass-card-hover rounded-3xl overflow-hidden h-full">
                    <ProjectCard
                      id={project.id}
                      name={project.name || `${project.plant?.common_name || "Farm"} Project`}
                      area={`${project.area} ${project.area_unit}`}
                      stage={project.current_stage || "Active"}
                      day={project.days_since_planting || 1}
                      totalDays={project.plant?.growth_duration_days || 90}
                      tasksToday={project.todays_task_count || 0}
                      color="emerald"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weather Block for first active project */}
          {activeProjects.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
              <WeatherForecast projectId={activeProjects[0].id} />
            </div>
          )}

          {/* Mobile FAB */}
          {activeProjects.length > 0 && (
            <Link
              href="/projects/new"
              className="md:hidden fixed bottom-24 right-5 z-40 btn-primary p-4 rounded-2xl glow-green-lg"
            >
              <Plus className="w-7 h-7" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

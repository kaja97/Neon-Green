"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, Sprout, ChevronRight } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { formatFarmingMethod } from "@/lib/utils/formatters";

type ProjectStatus = "all" | "active" | "harvested" | "failed";

export default function ProjectsListPage() {
  const [filter, setFilter] = useState<ProjectStatus>("all");

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects-all"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data.data;
    },
  });

  const filteredProjects = projects?.filter((p: any) => {
    if (filter === "all") return true;
    return p.status === filter;
  }) || [];

  const statusCounts = {
    all: projects?.length || 0,
    active: projects?.filter((p: any) => p.status === "active").length || 0,
    harvested: projects?.filter((p: any) => p.status === "harvested").length || 0,
    failed: projects?.filter((p: any) => p.status === "failed").length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "harvested":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-surface-tertiary text-text-muted border-border";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              All Projects<span className="text-green-400 text-glow-green">.</span>
            </h1>
            <p className="text-text-muted text-sm mt-0.5">{statusCounts.all} total projects</p>
          </div>
        </div>
        <Link href="/projects/new" className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New
        </Link>
      </header>

      {/* Filter Tabs */}
      <div className="flex space-x-1 glass-card p-1.5 rounded-2xl animate-slide-up">
        {(["all", "active", "harvested", "failed"] as ProjectStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all capitalize",
              filter === status
                ? "bg-green-500/15 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {status}
            <span className={clsx(
              "text-xs px-1.5 py-0.5 rounded-full",
              filter === status ? "bg-green-500/20 text-green-400" : "bg-surface-tertiary text-text-muted"
            )}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
        </div>
      ) : error ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-red-400 font-medium">Failed to load projects. Please try again.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card-hover rounded-3xl p-12 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-float glow-green">
            <Sprout className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {filter === "all" ? "No projects yet" : `No ${filter} projects`}
          </h3>
          <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
            {filter === "all"
              ? "Create your first farming project to get started."
              : `You don't have any ${filter} projects.`}
          </p>
          {filter === "all" && (
            <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project: any, idx) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative flex items-center justify-between glass-card-hover rounded-2xl p-5 animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Sprout className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-text-muted mt-0.5">
                    {project.area} {project.area_unit} · {formatFarmingMethod(project.farming_method)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  "text-xs font-semibold px-3 py-1 rounded-full capitalize border",
                  getStatusBadge(project.status)
                )}>
                  {project.status}
                </span>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

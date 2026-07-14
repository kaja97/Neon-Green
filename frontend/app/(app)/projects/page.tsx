"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2, Sprout, ChevronRight, Filter } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "harvested": return "bg-amber-100 text-amber-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 bg-slate-50 min-h-screen text-slate-900 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Projects</h1>
            <p className="text-slate-500 text-sm mt-0.5">{statusCounts.all} total projects</p>
          </div>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:bg-green-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New
        </Link>
      </header>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
        {(["all", "active", "harvested", "failed"] as ProjectStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all capitalize",
              filter === status ? "bg-green-50 text-green-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {status}
            <span className={clsx(
              "text-xs px-1.5 py-0.5 rounded-full",
              filter === status ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
            )}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
          <p className="text-red-500 font-medium">Failed to load projects. Please try again.</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            {filter === "all" ? "No projects yet" : `No ${filter} projects`}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {filter === "all"
              ? "Create your first farming project to get started."
              : `You don't have any ${filter} projects.`}
          </p>
          {filter === "all" && (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:bg-green-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project: any) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between bg-white border border-slate-200 hover:border-green-300 rounded-2xl p-5 shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <Sprout className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-green-700 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {project.area} {project.area_unit} · {project.farming_method}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  "text-xs font-semibold px-3 py-1 rounded-full capitalize",
                  getStatusColor(project.status)
                )}>
                  {project.status}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

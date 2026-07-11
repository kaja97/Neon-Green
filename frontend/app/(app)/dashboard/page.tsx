"use client"

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load projects. Please try again later.
      </div>
    );
  }

  const activeProjects = projects?.filter((p: any) => p.is_active) || [];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your {activeProjects.length} ongoing crops</p>
        </div>
        <Link
          href="/projects/new"
          className="hidden md:flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-green-700 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {activeProjects.length === 0 ? (
         <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl">
           <h3 className="text-lg font-semibold mb-2">No active projects</h3>
           <p className="text-sm text-slate-500 max-w-sm mb-6">
             You don't have any active farming projects yet. Create a new one to get your personalized AI farming plan.
           </p>
           <Link href="/projects/new" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold">
             Create Project
           </Link>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeProjects.map((project: any) => (
            <ProjectCard 
              key={project.id} 
              id={project.id}
              name={`Farm - ${project.farming_method}`}
              area={`${project.area_acres} Acres`}
              stage="Growing"
              day={1}
              totalDays={90}
              tasksToday={0}
              color="emerald"
            />
          ))}
        </div>
      )}

      {/* Mobile Floating Action Button */}
      <Link
        href="/projects/new"
        className="md:hidden fixed bottom-24 right-4 z-40 bg-green-600 text-white p-4 rounded-full shadow-xl shadow-green-500/30 flex items-center justify-center hover:scale-110 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}

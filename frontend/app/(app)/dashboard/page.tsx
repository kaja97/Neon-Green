"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ProjectCard from "@/components/dashboard/ProjectCard";
import { Plus, Loader2, Sprout } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ParallaxBackground from "@/components/dashboard/ParallaxBackground";
import WeatherForecast from "@/components/dashboard/WeatherForecast";

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
      <div className="flex h-screen items-center justify-center bg-[#0a0f12]">
        <Loader2 className="h-12 w-12 animate-spin text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0f12]">
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-md text-center">
          <p className="text-red-400 font-medium">Failed to load projects. Please try again later.</p>
        </div>
      </div>
    );
  }

  const activeProjects = projects?.filter((p: any) => p.is_active) || [];

  return (
    <>
      <ParallaxBackground />
      
      {/* 
        We add a min-h-[150vh] to ensure there's enough scroll space 
        for the parallax background to trigger its buttery smooth dissolve effect.
      */}
      <div className="min-h-[150vh] relative z-10 pt-24 pb-32">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
          
          {/* Header Section */}
          <div className="flex items-center justify-between bg-black/20 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                Command Center
              </h1>
              <p className="text-slate-300 font-medium mt-2">
                Manage your {activeProjects.length} ongoing crops
              </p>
            </div>
            
            {activeProjects.length > 0 && (
              <Link
                href="/projects/new"
                className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:scale-105 hover:-translate-y-1"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Link>
            )}
          </div>

          {/* Project Display Block */}
          {activeProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl text-center group transition-all duration-500 hover:border-green-500/50 hover:bg-black/50">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <Sprout className="w-12 h-12 text-green-400 drop-shadow-lg" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-md">No Active Projects</h3>
              <p className="text-lg text-slate-300 max-w-md mb-10 leading-relaxed">
                You don't have any active farming projects yet. Initialize your first project to unlock AI-driven insights and hyper-local weather tracking.
              </p>
              <Link 
                href="/projects/new" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all hover:scale-105 hover:-translate-y-1 text-lg flex items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                Initialize Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProjects.map((project: any) => (
                <div key={project.id} className="relative group">
                  {/* Subtle glowing effect behind the card */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                  
                  <div className="relative bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl h-full transition-all duration-300 hover:bg-black/70">
                    <ProjectCard 
                      id={project.id}
                      name={project.name || `Farm - ${project.farming_method}`}
                      area={`${project.area} ${project.area_unit}`}
                      stage="Active"
                      day={1}
                      totalDays={project.plant?.growth_duration_days || 90}
                      tasksToday={0}
                      color="emerald"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Weather Block — renders for the first active project if any */}
          {activeProjects.length > 0 && (
            <div className="pt-12">
              <WeatherForecast projectId={activeProjects[0].id} />
            </div>
          )}

          {/* Mobile Floating Action Button */}
          {activeProjects.length > 0 && (
            <Link
              href="/projects/new"
              className="md:hidden fixed bottom-24 right-6 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <Plus className="w-8 h-8" />
            </Link>
          )}

        </div>
      </div>
    </>
  );
}

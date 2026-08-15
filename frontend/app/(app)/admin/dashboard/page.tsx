"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import {
  Users,
  Sprout,
  ShieldAlert,
  AlertTriangle,
  FolderGit2,
  Plus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  Database,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboardPage() {
  const { data: statsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data?.data || res.data;
    },
  });

  const { data: recentIssuesData } = useQuery({
    queryKey: ["admin-recent-issues"],
    queryFn: async () => {
      const res = await api.get("/admin/issues?per_page=5&status=open");
      return res.data?.data || res.data || [];
    },
  });

  const stats = statsData || {
    users: { total: 0, active: 0, deactivated: 0, farmers: 0, vendors: 0, buyers: 0, admins: 0 },
    projects: { total: 0, active: 0, harvested: 0, failed: 0 },
    master_data: { plants: 0, varieties: 0, diseases: 0, pests: 0 },
    issues: { total: 0, open: 0, in_progress: 0, resolved: 0 },
  };

  const recentIssues = recentIssuesData?.items || recentIssuesData || [];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neon-purple bg-neon-purple/10 px-2.5 py-1 rounded-full border border-neon-purple/20">
              Operations Center
            </span>
            <span className="text-xs text-text-muted">Live Platform State</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Platform Command & Control<span className="text-neon-purple">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage agricultural intelligence data, field issues, and user ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-text-secondary hover:text-white flex items-center gap-2 hover:border-border-hover transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-neon-purple" : ""}`} />
            Refresh Data
          </button>
          <Link
            href="/admin/master-data"
            className="btn-primary px-4 py-2.5 text-xs font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Crop / Data
          </Link>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Master Data Card */}
        <div className="glass-card-hover rounded-2xl p-6 relative overflow-hidden border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Master Data</span>
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.master_data?.plants || 0}
              <span className="text-sm font-medium text-text-muted ml-2">Crops</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-text-secondary">
              <span className="font-semibold text-primary">{stats.master_data?.varieties || 0} Varieties</span>
              <span>•</span>
              <span className="text-neon-gold">{stats.master_data?.diseases || 0} Diseases</span>
              <span>•</span>
              <span className="text-neon-blue">{stats.master_data?.pests || 0} Pests</span>
            </div>
          </div>
          <Link
            href="/admin/master-data"
            className="mt-4 flex items-center justify-between text-xs font-semibold text-primary hover:underline pt-3 border-t border-border/50"
          >
            <span>Manage Master Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Users Card */}
        <div className="glass-card-hover rounded-2xl p-6 relative overflow-hidden border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">User Ecosystem</span>
            <div className="p-2.5 rounded-xl bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.users?.total || 0}
              <span className="text-sm font-medium text-text-muted ml-2">Total</span>
            </div>
            <div className="flex items-center gap-2.5 mt-3 text-xs text-text-secondary">
              <span className="font-semibold text-green-400">{stats.users?.farmers || 0} Farmers</span>
              <span>•</span>
              <span className="text-neon-gold">{stats.users?.vendors || 0} Vendors</span>
              <span>•</span>
              <span className="text-blue-400">{stats.users?.buyers || 0} Buyers</span>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="mt-4 flex items-center justify-between text-xs font-semibold text-neon-blue hover:underline pt-3 border-t border-border/50"
          >
            <span>User Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Global Projects Card */}
        <div className="glass-card-hover rounded-2xl p-6 relative overflow-hidden border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Global Projects</span>
            <div className="p-2.5 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.projects?.total || 0}
              <span className="text-sm font-medium text-text-muted ml-2">Projects</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-text-secondary">
              <span className="font-semibold text-green-400">{stats.projects?.active || 0} Active</span>
              <span>•</span>
              <span className="text-neon-gold">{stats.projects?.harvested || 0} Harvested</span>
            </div>
          </div>
          <Link
            href="/admin/projects"
            className="mt-4 flex items-center justify-between text-xs font-semibold text-neon-purple hover:underline pt-3 border-t border-border/50"
          >
            <span>Production Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Field Issues Card */}
        <div className="glass-card-hover rounded-2xl p-6 relative overflow-hidden border border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Field Issues</span>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.issues?.open || 0}
              <span className="text-sm font-medium text-red-400 ml-2">Open Issues</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs text-text-secondary">
              <span className="text-amber-400 font-semibold">{stats.issues?.in_progress || 0} In Progress</span>
              <span>•</span>
              <span className="text-green-400 font-semibold">{stats.issues?.resolved || 0} Resolved</span>
            </div>
          </div>
          <Link
            href="/admin/issues"
            className="mt-4 flex items-center justify-between text-xs font-semibold text-red-400 hover:underline pt-3 border-t border-border/50"
          >
            <span>Triage Field Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Access Control Matrix */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Management Portals</h2>
          </div>
          <span className="text-xs text-text-muted">Direct Shortcuts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/master-data"
            className="p-5 rounded-xl bg-surface-tertiary/60 hover:bg-surface-tertiary border border-border hover:border-primary/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Sprout className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">Crops, Stages & Varieties</h3>
            <p className="text-xs text-text-muted mt-1">
              Add new crops, configure growth stage timelines, water & nutrient curves, fertilizer recommendations, and pruning guides.
            </p>
          </Link>

          <Link
            href="/admin/health-library"
            className="p-5 rounded-xl bg-surface-tertiary/60 hover:bg-surface-tertiary border border-border hover:border-neon-gold/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-neon-gold/10 text-neon-gold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-neon-gold group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">Health & Issues Knowledge Base</h3>
            <p className="text-xs text-text-muted mt-1">
              Maintain diseases, pests, symptom checklists, and dual treatment plans (Organic & Conventional with precise dosages).
            </p>
          </Link>

          <Link
            href="/admin/issues"
            className="p-5 rounded-xl bg-surface-tertiary/60 hover:bg-surface-tertiary border border-border hover:border-red-400/40 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">Field Issue Triage & Support</h3>
            <p className="text-xs text-text-muted mt-1">
              Review live crop diagnoses reported by farmers, inspect AI diagnostic conclusions, and map issues to master solutions.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Open Field Issues Stream */}
      <div className="glass-card rounded-2xl p-6 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Open Field Issues</h2>
            <p className="text-xs text-text-muted">Farmer issues requiring verification or advisory</p>
          </div>
          <Link href="/admin/issues" className="text-xs font-semibold text-neon-purple hover:underline flex items-center gap-1">
            View All Issues <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="py-8 text-center text-text-muted text-sm border border-dashed border-border rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-80" />
            No open field issues pending triage. All systems healthy!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase font-bold text-text-muted">
                  <th className="pb-3">Crop / Project</th>
                  <th className="pb-3">Farmer</th>
                  <th className="pb-3">Issue Title</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Reported</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentIssues.map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-surface-tertiary/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {issue.crop_name}
                      <span className="block text-xs font-normal text-text-muted">{issue.project_name}</span>
                    </td>
                    <td className="py-3 text-text-secondary">{issue.farmer_name}</td>
                    <td className="py-3 font-medium text-text-primary">{issue.title}</td>
                    <td className="py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-tertiary text-text-secondary uppercase">
                        {issue.issue_type}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                          issue.severity === "critical"
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : issue.severity === "high"
                            ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                            : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-text-muted">{issue.reported_date}</td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/issues`}
                        className="px-3 py-1.5 rounded-lg bg-surface-tertiary hover:bg-neon-purple/20 hover:text-neon-purple text-xs font-medium transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Bug, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";

export default function DiseaseBlock({ projectId }: { projectId: string }) {
  const { data: issues, isLoading } = useQuery({
    queryKey: ["project_issues", projectId],
    queryFn: async () => {
      const res = await api.get(`/disease/issues/${projectId}`);
      return res.data.data;
    },
    enabled: !!projectId && projectId !== "1" && projectId !== "2",
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const openIssuesCount = issues ? issues.filter((i: any) => i.status === "open").length : 0;
  
  const value = openIssuesCount > 0 ? `${openIssuesCount} Active` : "Clear";
  const sub = openIssuesCount > 0 ? "Issues" : "Healthy";
  const bg = openIssuesCount > 0 ? "bg-rose-500/10" : "bg-emerald-500/10";
  const text = openIssuesCount > 0 ? "text-rose-400" : "text-emerald-400";
  const iconColor = openIssuesCount > 0 ? "text-rose-400" : "text-emerald-400";

  return (
    <Link
      href={`/projects/${projectId}/disease`}
      className="bg-card border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all hover:shadow-lg group block"
    >
      <div className={`p-2 rounded-xl w-fit mb-3 ${bg} group-hover:scale-110 transition-transform`}>
        <Bug className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-xs text-slate-500 mb-0.5">Disease</p>
      <p className={`text-lg font-bold ${text}`}>{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </Link>
  );
}

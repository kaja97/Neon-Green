import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Project {
  id: string;
  name: string;
  plant: { common_name: string; image_url?: string; growth_duration_days: number };
  planting_date: string;
  days_since_planting: number;
  current_stage: string;
  progress_pct: number;
  status: string;
  todays_task_count: number;
  active_alerts: number;
  area: number;
  area_unit: string;
  farming_method: string;
  is_active: boolean;
}

interface ProjectsResponse {
  success: boolean;
  data: Project[];
  meta?: { page: number; per_page: number; total: number };
}

export function useProjects(status: string = "active") {
  return useQuery<Project[]>({
    queryKey: ["projects", status],
    queryFn: async () => {
      const res = await api.get<ProjectsResponse>("/projects", {
        params: { status },
      });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

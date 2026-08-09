import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Stage {
  id: string;
  plant_id: string;
  stage_name: string;
  stage_order: number;
  start_day: number;
  end_day: number;
}

interface StageProgress {
  stage: Stage;
  progress_percentage: number;
  is_current: boolean;
  is_completed: boolean;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  priority: number;
  status: string;
  scheduled_date?: string;
  scheduled_time?: string;
}

interface WeatherAlert {
  id?: string;
  type: string;
  severity: string;
  message: string;
  target_date: string;
}

export interface DashboardData {
  project: {
    id: string;
    name: string;
    crop: string;
    area: string;
    area_unit?: string;
    planting_date: string;
    days_since_planting: number;
    expected_harvest_date: string;
    status: string;
    plant?: { common_name: string; image_url?: string };
    area_acres?: number;
    farming_method?: string;
  };
  current_stage: Stage | null;
  farming_circle: {
    stages: StageProgress[];
    current_day: number;
    total_days: number;
  };
  todays_activities: Activity[];
  upcoming_activities: Activity[];
  weather: {
    today: {
      condition: string;
      temp_max: number;
      rain_mm: number;
      humidity: number;
    };
    forecast_5day: any[];
  };
  weather_alerts: WeatherAlert[];
  soil_status: {
    ph: number;
    nitrogen_status: string;
    phosphorus_status: string;
    potassium_status: string;
    last_test: string;
  } | null;
  active_issues: any[];
  market_price: {
    price_per_kg: number;
    trend: string;
    change_pct: number;
  } | null;
  ai_summary: {
    text: string;
    generated_at: string;
    source: string;
  } | null;
}

export function useDashboard(projectId: string) {
  return useQuery<DashboardData>({
    queryKey: ["dashboard", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/dashboard`);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
    enabled: !!projectId,
  });
}

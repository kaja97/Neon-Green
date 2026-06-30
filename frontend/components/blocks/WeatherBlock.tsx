"use client";

import { CloudRain, Sun, Cloud, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";

interface WeatherCondition {
  temp_celsius: number;
  humidity: number;
  rain_mm: number;
  wind_kph: number;
  description: string;
  icon_code: string;
}

interface ForecastDay {
  forecast_date: string;
  condition: WeatherCondition;
}

interface WeatherResponse {
  location_id: string;
  current: WeatherCondition;
  forecast: ForecastDay[];
}

export default function WeatherBlock({ projectId }: { projectId: string }) {
  const { data: weather, isLoading, error } = useQuery<WeatherResponse>({
    queryKey: ["weather", projectId],
    queryFn: async () => {
      const res = await api.get(`/weather/${projectId}`);
      return res.data;
    },
    enabled: !!projectId && projectId !== "1" && projectId !== "2" && projectId !== "3",
  });

  const getIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("rain")) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (desc.includes("cloud")) return <Cloud className="w-6 h-6 text-slate-400" />;
    return <Sun className="w-6 h-6 text-amber-400" />;
  };

  const getBg = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("rain")) return "bg-blue-500/10";
    if (desc.includes("cloud")) return "bg-slate-500/10";
    return "bg-amber-500/10";
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-slate-800 rounded-2xl p-4 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  // Fallback to mock data if no data
  const current = weather?.current || {
    temp_celsius: 32,
    description: "Cloudy",
  };

  const icon = getIcon(current.description);
  const bg = getBg(current.description);

  return (
    <Link
      href={`/projects/${projectId}/weather`}
      className="bg-card border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition-all hover:shadow-lg group block"
    >
      <div className={`p-2 rounded-xl w-fit mb-3 ${bg} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-0.5">Weather</p>
      <p className="text-lg font-bold text-white">{current.temp_celsius}°C</p>
      <p className="text-xs text-slate-400 capitalize">{current.description}</p>
    </Link>
  );
}

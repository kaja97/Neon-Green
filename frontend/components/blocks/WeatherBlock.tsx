"use client";

import { CloudRain, Sun, Cloud, Loader2, CloudLightning, Wind } from "lucide-react";
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
    }
  });

  const getIconInfo = (description: string) => {
    const desc = description?.toLowerCase() || "";
    if (desc.includes("rain") || desc.includes("shower")) {
      return { icon: <CloudRain className="w-5 h-5 text-blue-400" />, bg: "bg-blue-500/10" };
    }
    if (desc.includes("storm") || desc.includes("thunder")) {
      return { icon: <CloudLightning className="w-5 h-5 text-purple-400" />, bg: "bg-purple-500/10" };
    }
    if (desc.includes("cloud")) {
      return { icon: <Cloud className="w-5 h-5 text-slate-400" />, bg: "bg-slate-500/10" };
    }
    if (desc.includes("wind")) {
      return { icon: <Wind className="w-5 h-5 text-cyan-400" />, bg: "bg-cyan-500/10" };
    }
    return { icon: <Sun className="w-5 h-5 text-amber-400" />, bg: "bg-amber-500/10" };
  };

  if (isLoading) {
    return (
      <div className="glass-card p-4 flex items-center justify-center min-h-[120px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin animate-pulse" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-card border border-red-500/20 p-4 flex items-center justify-center min-h-[120px]">
        <p className="text-xs text-red-400 font-medium">Failed to load</p>
      </div>
    );
  }

  const { icon, bg } = getIconInfo(weather.current.description);

  return (
    <Link
      href={`/projects/${projectId}/weather`}
      className="glass-card-hover p-4 group block text-left"
    >
      <div className={`p-2 rounded-xl w-fit mb-3 ${bg} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-xs text-text-muted mb-0.5">Weather</p>
      <p className="text-base font-bold text-white">{Math.round(weather.current.temp_celsius)}°C</p>
      <p className="text-xs text-text-muted capitalize truncate">
        {weather.current.description}
      </p>
    </Link>
  );
}

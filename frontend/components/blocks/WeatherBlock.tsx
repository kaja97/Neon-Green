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
    if (desc.includes("rain") || desc.includes("shower")) return { icon: <CloudRain className="w-6 h-6 text-blue-600" />, bg: "bg-blue-100" };
    if (desc.includes("storm") || desc.includes("thunder")) return { icon: <CloudLightning className="w-6 h-6 text-purple-600" />, bg: "bg-purple-100" };
    if (desc.includes("cloud")) return { icon: <Cloud className="w-6 h-6 text-slate-500" />, bg: "bg-slate-100" };
    if (desc.includes("wind")) return { icon: <Wind className="w-6 h-6 text-cyan-600" />, bg: "bg-cyan-100" };
    return { icon: <Sun className="w-6 h-6 text-amber-500" />, bg: "bg-amber-100" };
  };

  if (isLoading) {
    return (
      <div className="bg-white border rounded-2xl p-4 flex items-center justify-center min-h-[120px] shadow-sm">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-4 flex items-center justify-center min-h-[120px] shadow-sm">
        <p className="text-xs text-red-500">Failed to load</p>
      </div>
    );
  }

  const { icon, bg } = getIconInfo(weather.current.description);

  return (
    <Link
      href={`/projects/${projectId}/weather`}
      className="bg-white border rounded-2xl p-4 hover:border-slate-300 transition-all hover:shadow-md group block"
    >
      <div className={`p-2 rounded-xl w-fit mb-3 ${bg} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 mb-0.5">Weather</p>
      <p className="text-lg font-bold text-slate-900">{Math.round(weather.current.temp_celsius)}°C</p>
      <p className="text-xs text-slate-500 capitalize">{weather.current.description}</p>
    </Link>
  );
}

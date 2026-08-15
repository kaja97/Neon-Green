"use client";

import { CloudRain, Sun, Cloud, Loader2, CloudLightning, Wind, Droplets } from "lucide-react";
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

function getIconForDesc(description: string) {
  const desc = description?.toLowerCase() || "";
  if (desc.includes("rain") || desc.includes("shower")) return <CloudRain className="w-5 h-5 text-blue-400" />;
  if (desc.includes("storm") || desc.includes("thunder")) return <CloudLightning className="w-5 h-5 text-purple-400" />;
  if (desc.includes("cloud")) return <Cloud className="w-5 h-5 text-slate-400" />;
  if (desc.includes("wind")) return <Wind className="w-5 h-5 text-cyan-400" />;
  return <Sun className="w-5 h-5 text-amber-400" />;
}

export default function WeatherCardBlock({ projectId }: { projectId: string }) {
  const { data: weather, isLoading, error } = useQuery<WeatherResponse>({
    queryKey: ["weather", projectId],
    queryFn: async () => {
      const res = await api.get(`/weather/${projectId}`);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[140px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[140px]">
        <p className="text-xs text-text-muted">Weather unavailable</p>
      </div>
    );
  }

  const forecastSlice = (weather.forecast || []).slice(0, 5);

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      {/* Current weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 rounded-xl">
            {getIconForDesc(weather.current.description)}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(weather.current.temp_celsius)}°C</p>
            <p className="text-xs text-text-muted capitalize">{weather.current.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>{weather.current.rain_mm}mm</span>
          </div>
          <div className="text-text-muted">{weather.current.humidity}%</div>
        </div>
      </div>

      {/* 5-day forecast strip */}
      {forecastSlice.length > 0 && (
        <div className="flex items-center justify-between gap-1 pt-4 border-t border-border">
          {forecastSlice.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] text-text-muted font-medium">
                {new Date(day.forecast_date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)}
              </span>
              {getIconForDesc(day.condition.description)}
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {Math.round(day.condition.temp_celsius)}°
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/projects/${projectId}/weather`}
        className="block mt-3 text-xs font-medium text-primary hover:underline"
      >
        Full forecast →
      </Link>
    </div>
  );
}

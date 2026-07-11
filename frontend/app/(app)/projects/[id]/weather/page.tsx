"use client";

import { ArrowLeft, CloudRain, Droplets, Wind, Sun, CloudSun, Cloud, CloudLightning, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format, parseISO } from "date-fns";

export default function WeatherPage({ params }: { params: { id: string } }) {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ["weather", params.id],
    queryFn: async () => {
      const res = await api.get(`/weather/${params.id}`);
      return res.data;
    }
  });

  const getIconInfo = (description: string) => {
    const desc = description?.toLowerCase() || "";
    if (desc.includes("rain") || desc.includes("shower")) return { icon: CloudRain, color: "text-blue-500", bg: "bg-blue-100" };
    if (desc.includes("storm") || desc.includes("thunder")) return { icon: CloudLightning, color: "text-purple-600", bg: "bg-purple-100" };
    if (desc.includes("cloud")) return { icon: Cloud, color: "text-slate-500", bg: "bg-slate-100" };
    if (desc.includes("wind")) return { icon: Wind, color: "text-cyan-600", bg: "bg-cyan-100" };
    return { icon: Sun, color: "text-amber-500", bg: "bg-amber-100" };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load weather data.
      </div>
    );
  }

  const { current, forecast } = weather;
  const CurrentIcon = getIconInfo(current.description).icon;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weather Forecast</h1>
          <p className="text-slate-500 text-sm">Farm Location</p>
        </div>
      </header>

      {/* Current Weather */}
      <section className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-blue-600 text-sm font-medium mb-1">Right Now</p>
            <div className="text-6xl font-bold text-slate-800 tracking-tighter">{Math.round(current.temp_celsius)}°C</div>
            <p className="text-slate-600 text-lg mt-2 capitalize">{current.description}</p>
          </div>
          <CurrentIcon className="w-24 h-24 text-blue-500/80" />
        </div>
        <div className="grid grid-cols-3 gap-6 mt-8 relative z-10">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="text-slate-800 font-semibold">{current.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Wind</p>
              <p className="text-slate-800 font-semibold">{Math.round(current.wind_kph)} km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CloudRain className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">Rainfall</p>
              <p className="text-slate-800 font-semibold">{current.rain_mm} mm</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Day Forecast */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">5-Day Forecast</h2>
        <div className="space-y-3">
          {forecast?.map((day: any, i: number) => {
            const { icon: Icon, color, bg } = getIconInfo(day.condition.description);
            const dateObj = new Date(day.forecast_date);
            const isToday = i === 0;
            const dayName = isToday ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div key={day.forecast_date} className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4 w-28">
                  <span className={clsx("font-semibold text-sm", isToday ? "text-blue-600" : "text-slate-700")}>{dayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className={clsx("w-6 h-6", color)} />
                  <span className="text-sm text-slate-500 w-28 capitalize truncate">{day.condition.description}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-500">{day.condition.rain_mm}mm</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800 w-12 text-right">{Math.round(day.condition.temp_celsius)}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

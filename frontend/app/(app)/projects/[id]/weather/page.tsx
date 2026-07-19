"use client";

import { ArrowLeft, CloudRain, Droplets, Wind, Sun, CloudSun, Cloud, CloudLightning, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";

export default function WeatherPage({ params }: { params: { id: string } }) {
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ["weather", params.id],
    queryFn: async () => {
      const res = await api.get(`/weather/${params.id}`);
      return res.data.data;
    }
  });

  const getIconInfo = (description: string) => {
    const desc = description?.toLowerCase() || "";
    if (desc.includes("rain") || desc.includes("shower")) return { icon: CloudRain, color: "text-blue-400", bg: "bg-blue-500/10" };
    if (desc.includes("storm") || desc.includes("thunder")) return { icon: CloudLightning, color: "text-purple-400", bg: "bg-purple-500/10" };
    if (desc.includes("cloud")) return { icon: Cloud, color: "text-text-muted", bg: "bg-surface-tertiary" };
    if (desc.includes("wind")) return { icon: Wind, color: "text-cyan-400", bg: "bg-cyan-500/10" };
    return { icon: Sun, color: "text-amber-400", bg: "bg-amber-500/10" };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-primary">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="p-8 text-center text-red-400">Failed to load weather data.</div>
    );
  }

  const { current, forecast } = weather;
  const { icon: CurrentIcon, color: currentColor, bg: currentBg } = getIconInfo(current.description);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href={`/projects/${params.id}`}
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Weather Forecast<span className="text-blue-400">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">Farm Location</p>
        </div>
      </header>

      {/* Current Weather */}
      <section className="glass-card rounded-3xl p-8 relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-blue-400 text-sm font-medium mb-1">Right Now</p>
            <div className="text-6xl font-bold text-white tracking-tighter drop-shadow-lg">
              {Math.round(current.temp_celsius)}°C
            </div>
            <p className="text-text-secondary text-lg mt-2 capitalize">{current.description}</p>
          </div>
          <CurrentIcon className="w-24 h-24 text-blue-400/60" />
        </div>
        <div className="grid grid-cols-3 gap-6 mt-8 relative z-10">
          {[
            { icon: Droplets, label: "Humidity", value: `${current.humidity}%`, color: "text-blue-400" },
            { icon: Wind, label: "Wind", value: `${Math.round(current.wind_kph)} km/h`, color: "text-text-secondary" },
            { icon: CloudRain, label: "Rainfall", value: `${current.rain_mm} mm`, color: "text-blue-400" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                  <p className="text-white font-semibold">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5-Day Forecast */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4 animate-slide-up">5-Day Forecast</h2>
        <div className="space-y-3">
          {forecast?.map((day: any, i: number) => {
            const { icon: Icon, color, bg } = getIconInfo(day.condition.description);
            const dateObj = new Date(day.forecast_date);
            const isToday = i === 0;
            const dayName = isToday ? "Today" : dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div
                key={day.forecast_date}
                className={clsx(
                  "flex items-center justify-between glass-card-hover rounded-2xl p-4 animate-slide-up",
                  isToday && "border-blue-500/20"
                )}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-4 w-28">
                  <span className={clsx("font-semibold text-sm", isToday ? "text-blue-400" : "text-text-secondary")}>{dayName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-sm text-text-muted w-28 capitalize truncate">{day.condition.description}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-400/60" />
                    <span className="text-sm text-text-muted">{day.condition.rain_mm}mm</span>
                  </div>
                  <span className="text-lg font-bold text-white w-12 text-right">{Math.round(day.condition.temp_celsius)}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Cloud, Droplets, Wind, Thermometer, Sun, Loader2, CloudRain } from "lucide-react";
import { format } from "date-fns";

interface WeatherProps {
  projectId: string;
}

export default function WeatherForecast({ projectId }: WeatherProps) {
  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ["weather", projectId],
    queryFn: async () => {
      const res = await api.get(`/weather/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
    retry: 1, // Don't keep retrying if no weather service is configured
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }

  if (error || !weatherData) {
    // Graceful fallback if weather data isn't available
    return null;
  }

  const { current, forecast } = weatherData;

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("rain") || desc.includes("shower")) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (desc.includes("cloud")) return <Cloud className="w-6 h-6 text-slate-300" />;
    return <Sun className="w-6 h-6 text-yellow-400" />;
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
          Weather Intelligence
        </h2>
        <span className="text-sm font-medium text-green-400/80 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
          Live Sync
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather (Highlight) */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            {getWeatherIcon(current.description)}
          </div>
          
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-4">Current Conditions</h3>
          
          <div className="flex items-end gap-4 mb-6">
            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">
              {Math.round(current.temp_celsius)}°
            </span>
            <span className="text-xl text-slate-300 font-medium mb-2 capitalize">
              {current.description}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl">
              <Droplets className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Humidity</p>
                <p className="text-sm font-semibold text-white">{current.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl">
              <Wind className="w-5 h-5 text-teal-400" />
              <div>
                <p className="text-xs text-slate-400">Wind</p>
                <p className="text-sm font-semibold text-white">{current.wind_kph} km/h</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-6">5-Day Forecast</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 h-full pb-8">
            {forecast?.slice(0, 5).map((day: any, index: number) => (
              <div 
                key={index} 
                className="flex flex-col items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 group"
              >
                <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {format(new Date(day.forecast_date), 'EEE')}
                </p>
                
                <div className="my-4 transform group-hover:scale-110 transition-transform">
                  {getWeatherIcon(day.condition.description)}
                </div>
                
                <div className="text-center">
                  <p className="text-xl font-bold text-white drop-shadow-md">
                    {Math.round(day.condition.temp_celsius)}°
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {day.condition.rain_mm > 0 ? `${day.condition.rain_mm}mm` : 'Clear'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

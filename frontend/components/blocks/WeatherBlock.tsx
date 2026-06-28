import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";

export default function WeatherBlock() {
  return (
    <div className="bg-card border border-slate-800 rounded-3xl p-6 min-w-[280px] hover:border-blue-500/50 transition-colors cursor-pointer group flex-1">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-400">
          <CloudRain className="w-5 h-5" />
          <h3 className="font-semibold">Weather</h3>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
          Today
        </span>
      </div>

      <div className="flex items-end gap-3 mb-6">
        <span className="text-5xl font-bold text-white tracking-tighter">32°</span>
        <span className="text-lg font-medium text-slate-400 pb-1 border-b border-slate-700">Cloudy</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Humidity</span>
            <span className="text-sm font-semibold text-slate-300">78%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs text-slate-500">Wind</span>
            <span className="text-sm font-semibold text-slate-300">12 km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}

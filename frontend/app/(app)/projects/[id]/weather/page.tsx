import { ArrowLeft, CloudRain, Droplets, Wind, Thermometer, Sun, CloudSun, Cloud, CloudLightning } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function WeatherPage({ params }: { params: { id: string } }) {
  const forecast = [
    { day: "Today", icon: CloudSun, temp: 32, humidity: 78, wind: 12, rain: 10, condition: "Partly Cloudy" },
    { day: "Tomorrow", icon: CloudRain, temp: 28, humidity: 92, wind: 18, rain: 85, condition: "Heavy Rain" },
    { day: "Wed", icon: CloudRain, temp: 27, humidity: 88, wind: 15, rain: 60, condition: "Showers" },
    { day: "Thu", icon: CloudSun, temp: 30, humidity: 72, wind: 10, rain: 20, condition: "Partly Cloudy" },
    { day: "Fri", icon: Sun, temp: 33, humidity: 65, wind: 8, rain: 5, condition: "Sunny" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Weather Forecast</h1>
          <p className="text-slate-400 text-sm">Jaffna, Sri Lanka · Tomato Farm</p>
        </div>
      </header>

      {/* Current Weather */}
      <section className="bg-gradient-to-br from-blue-900/30 to-card border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-blue-400 text-sm font-medium mb-1">Right Now</p>
            <div className="text-6xl font-bold text-white tracking-tighter">32°C</div>
            <p className="text-slate-300 text-lg mt-2">Partly Cloudy</p>
          </div>
          <CloudSun className="w-24 h-24 text-blue-400/50" />
        </div>
        <div className="grid grid-cols-3 gap-6 mt-8 relative z-10">
          <div className="flex items-center gap-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Humidity</p>
              <p className="text-white font-semibold">78%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Wind</p>
              <p className="text-white font-semibold">12 km/h</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CloudRain className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Rain Chance</p>
              <p className="text-white font-semibold">10%</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Day Forecast */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">5-Day Forecast</h2>
        <div className="space-y-3">
          {forecast.map((day, i) => {
            const Icon = day.icon;
            return (
              <div key={day.day} className={clsx(
                "flex items-center justify-between bg-card border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors",
                i === 1 && "border-amber-500/30 bg-amber-500/5"
              )}>
                <div className="flex items-center gap-4 w-28">
                  <span className={clsx("font-semibold text-sm", i === 0 ? "text-primary" : "text-slate-300")}>{day.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon className="w-6 h-6 text-blue-400" />
                  <span className="text-sm text-slate-400 w-28">{day.condition}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-400">{day.rain}%</span>
                  </div>
                  <span className="text-lg font-bold text-white w-12 text-right">{day.temp}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Farm Impact */}
      <section className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
        <h3 className="text-amber-500 font-bold mb-2">⚠️ Weather Impact on Your Farm</h3>
        <ul className="space-y-2 text-sm text-amber-400/80">
          <li>• Tomorrow&apos;s heavy rain — skip fertilizer, postpone spraying</li>
          <li>• High humidity increases blight risk — inspect plants today</li>
          <li>• Friday is ideal for applying potassium supplement</li>
        </ul>
      </section>
    </div>
  );
}

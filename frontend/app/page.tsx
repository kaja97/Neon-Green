import { Sprout, Sun, Droplets, Leaf } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-24 bg-gradient-to-br from-background via-card to-background">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <Sprout className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">AgriFarm AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
              <span>Home</span>
              <span>Dashboard</span>
              <span>Marketplace</span>
            </div>
            <button className="bg-primary text-white px-5 py-2 rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 py-12 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Personal AI <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
              Farming Assistant
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Get personalized advice, track your crops, and increase your yield with hyper-local AI insights tailored exactly to your soil and weather.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button className="bg-primary text-white px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-emerald-500/30">
              Start Free Trial
            </button>
            <button className="bg-card text-white border border-slate-700 px-8 py-3 rounded-full font-bold text-lg hover:bg-slate-800 transition-colors">
              View Demo
            </button>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-card/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:border-primary/50 transition-colors group">
            <div className="bg-emerald-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
              <Sun className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Hyper-Local Weather</h3>
            <p className="text-slate-400 leading-relaxed">
              Real-time weather tracking and micro-climate predictions specific to your exact farm coordinates.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:border-primary/50 transition-colors group">
            <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Droplets className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Irrigation</h3>
            <p className="text-slate-400 leading-relaxed">
              AI calculates exact water needs based on crop stage, recent rainfall, and soil moisture capacity.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl hover:border-primary/50 transition-colors group">
            <div className="bg-amber-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
              <Leaf className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Crop Health AI</h3>
            <p className="text-slate-400 leading-relaxed">
              Take a picture of a diseased leaf and our AI will immediately diagnose it and suggest local treatments.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

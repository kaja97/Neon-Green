import { Sprout, Sun, Droplets, Leaf } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-primary text-text-primary">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-green-500/10 blur-[140px] animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-neon-gold/5 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 md:px-12 lg:px-24 py-10 space-y-16">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 glow-green">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              AgriFarm
              <span className="text-primary text-glow-green"> AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-text-secondary">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <ThemeToggle />
            <Link
              href="/login"
              className="btn-primary px-5 py-2 text-sm"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 py-12 md:py-20 animate-slide-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-xs tracking-wider uppercase shadow-[0_0_15px_rgba(34,197,94,0.15)]">
            Zero-Cost AI · Built for Farmers
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Your Personal AI <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-glow-green">
              Farming Assistant
            </span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Get personalized advice, track your crops, and increase your yield with hyper-local AI insights tailored exactly to your soil and weather.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary px-8 py-3 text-lg"
            >
              View Demo
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6 pb-16">
          {[
            { icon: Sun, color: "text-green-400", bg: "bg-green-500/10", title: "Hyper-Local Weather", desc: "Real-time weather tracking and micro-climate predictions specific to your exact farm coordinates." },
            { icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10", title: "Smart Irrigation", desc: "AI calculates exact water needs based on crop stage, recent rainfall, and soil moisture capacity." },
            { icon: Leaf, color: "text-amber-400", bg: "bg-amber-500/10", title: "Crop Health AI", desc: "Take a picture of a diseased leaf and our AI will immediately diagnose it and suggest local treatments." },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-card-hover p-8 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feat.bg}`}>
                  <Icon className={`w-7 h-7 ${feat.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-text-secondary leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </section>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted pb-8">
          © 2026 AgriFarm AI · Zero-Cost AI for Farmers
        </p>
      </div>
    </main>
  );
}

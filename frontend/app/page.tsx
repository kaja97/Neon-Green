import { Sprout, Sun, Droplets, Leaf } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-24 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Sprout className="w-8 h-8 text-green-700" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-green-700">AgriFarm AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
            </div>
            <Link
              href="/login"
              className="bg-green-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 py-12 md:py-24">
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Your Personal AI <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">
              Farming Assistant
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Get personalized advice, track your crops, and increase your yield with hyper-local AI insights tailored exactly to your soil and weather.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-green-600/30"
            >
              Start Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              View Demo
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:border-green-200 hover:shadow-xl hover:shadow-green-900/5 transition-all group">
            <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
              <Sun className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Hyper-Local Weather</h3>
            <p className="text-slate-500 leading-relaxed">
              Real-time weather tracking and micro-climate predictions specific to your exact farm coordinates.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
            <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
              <Droplets className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Smart Irrigation</h3>
            <p className="text-slate-500 leading-relaxed">
              AI calculates exact water needs based on crop stage, recent rainfall, and soil moisture capacity.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 transition-all group">
            <div className="bg-amber-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-100 transition-colors">
              <Leaf className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Crop Health AI</h3>
            <p className="text-slate-500 leading-relaxed">
              Take a picture of a diseased leaf and our AI will immediately diagnose it and suggest local treatments.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Sprout, MapPin, Calendar, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function NewProjectWizard() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create New Project</h1>
          <p className="text-slate-400 text-sm">Step {step} of 4</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-12">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={clsx(
              "h-2 flex-1 rounded-full transition-colors duration-500",
              s <= step ? "bg-primary" : "bg-slate-800"
            )}
          />
        ))}
      </div>

      {/* Steps Content */}
      <div className="bg-card border border-slate-800 rounded-3xl p-6 md:p-8 min-h-[400px] relative">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Sprout className="w-6 h-6 text-primary" />
              What are you planting?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {["Tomato", "Chili Pepper", "Red Onion", "Cabbage"].map((crop, i) => (
                <button
                  key={crop}
                  onClick={nextStep}
                  className="p-6 rounded-2xl border-2 border-slate-800 bg-slate-800/20 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <span className="text-2xl">{['🍅', '🌶️', '🧅', '🥬'][i]}</span>
                  </div>
                  <h3 className="font-semibold text-slate-200 group-hover:text-white">{crop}</h3>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-500" />
              Where is this field?
            </h2>
            <div className="space-y-4">
              <button
                onClick={nextStep}
                className="w-full p-5 rounded-2xl border-2 border-slate-800 bg-slate-800/20 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-white">North Plot</h3>
                  <p className="text-sm text-slate-400 mt-1">Jaffna, Sri Lanka</p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-slate-600" />
              </button>
              <button className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-colors text-center text-slate-400 font-medium">
                + Add New Location
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <LayoutTemplate className="w-6 h-6 text-amber-500" />
              Land Details & Method
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Cultivation Area (Acres)</label>
                <input
                  type="number"
                  placeholder="e.g. 1.5"
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Farming Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={nextStep} className="py-3 px-4 rounded-xl border-2 border-amber-500 bg-amber-500/10 text-amber-500 font-semibold text-sm">
                    Organic
                  </button>
                  <button onClick={nextStep} className="py-3 px-4 rounded-xl border-2 border-slate-700 bg-slate-800/50 text-slate-300 font-semibold text-sm hover:border-slate-500 transition-colors">
                    Conventional
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Generating Farm Plan...
            </h2>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              Our AI is analyzing the weather forecast, soil data, and optimal growth stages to create your personalized daily activity plan.
            </p>
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            
            {/* Mock auto-redirect button for the sake of the UI demo */}
            <Link
              href="/projects/1"
              className="mt-12 inline-block text-sm font-semibold text-primary hover:text-emerald-400"
            >
              Skip Loading Demo →
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {step < 4 && (
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl font-semibold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            {step === 3 ? "Create Plan" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}

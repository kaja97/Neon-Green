"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import {
  ArrowLeft, Plus, FlaskConical, CheckCircle2, Loader2,
  ChevronDown, ChevronUp, Mail, Send, Sparkles, TrendingUp,
  Calendar, Layers, MapPin, AlertCircle, RefreshCw, ShieldCheck,
  Leaf, Droplets, Info
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

// Optimal ranges matching agronomic standards
const OPTIMAL: Record<string, { min: number; max: number; label: string; unit: string }> = {
  ph_level: { min: 6.0, max: 7.2, label: "pH Level", unit: "" },
  electrical_conductivity_ec: { min: 0.2, max: 1.5, label: "EC", unit: "ds/m" },
  organic_carbon_oc: { min: 1.5, max: 3.5, label: "Organic Carbon", unit: "%" },
  cation_exchange_capacity_cec: { min: 15.0, max: 30.0, label: "CEC", unit: "meq/100g" },
  nitrogen_n: { min: 250, max: 400, label: "Nitrogen (N)", unit: "ppm" },
  phosphorus_p: { min: 20, max: 40, label: "Phosphorus (P)", unit: "ppm" },
  potassium_k: { min: 150, max: 250, label: "Potassium (K)", unit: "ppm" },
  calcium_ca: { min: 800, max: 1600, label: "Calcium (Ca)", unit: "ppm" },
  magnesium_mg: { min: 100, max: 200, label: "Magnesium (Mg)", unit: "ppm" },
  sulfur_s: { min: 10, max: 30, label: "Sulfur (S)", unit: "ppm" },
  zinc_zn: { min: 1.0, max: 5.0, label: "Zinc (Zn)", unit: "ppm" },
  boron_b: { min: 0.5, max: 2.0, label: "Boron (B)", unit: "ppm" },
  iron_fe: { min: 10.0, max: 40.0, label: "Iron (Fe)", unit: "ppm" },
  manganese_mn: { min: 5.0, max: 30.0, label: "Manganese (Mn)", unit: "ppm" },
  copper_cu: { min: 0.5, max: 5.0, label: "Copper (Cu)", unit: "ppm" },
};

interface MetricCard {
  key: string;
  label: string;
  unit?: string;
}

const PHYSICAL_CARDS: MetricCard[] = [
  { key: "ph_level", label: "pH Level", unit: "" },
  { key: "electrical_conductivity_ec", label: "EC (Salinity)", unit: "ds/m" },
  { key: "organic_carbon_oc", label: "Organic Carbon", unit: "%" },
  { key: "cation_exchange_capacity_cec", label: "CEC", unit: "meq/100g" },
];

const PRIMARY_CARDS: MetricCard[] = [
  { key: "nitrogen_n", label: "Nitrogen (N)", unit: "ppm" },
  { key: "phosphorus_p", label: "Phosphorus (P)", unit: "ppm" },
  { key: "potassium_k", label: "Potassium (K)", unit: "ppm" },
];

const SECONDARY_CARDS: MetricCard[] = [
  { key: "calcium_ca", label: "Calcium (Ca)", unit: "ppm" },
  { key: "magnesium_mg", label: "Magnesium (Mg)", unit: "ppm" },
  { key: "sulfur_s", label: "Sulfur (S)", unit: "ppm" },
];

const MICRO_CARDS: MetricCard[] = [
  { key: "zinc_zn", label: "Zinc (Zn)", unit: "ppm" },
  { key: "boron_b", label: "Boron (B)", unit: "ppm" },
  { key: "iron_fe", label: "Iron (Fe)", unit: "ppm" },
  { key: "manganese_mn", label: "Manganese (Mn)", unit: "ppm" },
  { key: "copper_cu", label: "Copper (Cu)", unit: "ppm" },
];

function getStatusColor(key: string, value: number | null): string {
  if (value === null || value === undefined) return "text-text-muted";

  if (key === "ph_level") {
    if (value < 6.0 || value > 7.5) return "text-amber-400";
    return "text-emerald-400";
  }
  if (key === "electrical_conductivity_ec") {
    if (value > 2.0) return "text-amber-400";
    return "text-emerald-400";
  }

  const range = OPTIMAL[key];
  if (!range) return "text-white";
  if (value < range.min) return "text-rose-400";
  if (value > range.max) return "text-blue-400";
  return "text-emerald-400";
}

function getStatusBadge(key: string, value: number | null): React.ReactNode {
  if (value === null || value === undefined) return null;

  if (key === "ph_level") {
    if (value < 6.0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
          Acidic (Deficit)
        </span>
      );
    }
    if (value > 7.5) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Alkaline
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
        Optimal (6.0–7.2)
      </span>
    );
  }

  const range = OPTIMAL[key];
  if (!range) return null;

  if (value < range.min) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
        Low (Supplement)
      </span>
    );
  }
  if (value > range.max) {
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20">
        Abundant Reserve
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
      Optimal Range
    </span>
  );
}

function cleanDescription(desc: string): string {
  if (!desc) return "";
  return desc
    .replace(/^⚠️\s*\[HIGH PRIORITY\]\s*/i, "")
    .replace(/^\[HIGH PRIORITY\]\s*/i, "")
    .replace(/^HIGH PRIORITY:\s*/i, "")
    .trim();
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-1 hover:text-white transition-colors group"
      >
        <span className="text-xs font-bold text-text-muted group-hover:text-emerald-400 uppercase tracking-wider transition-colors">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-text-muted group-hover:text-white" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-white" />
        )}
      </button>
      {isOpen && children}
    </div>
  );
}

export default function SoilPage({ params }: { params: { id: string } }) {
  const [selectedTestIndex, setSelectedTestIndex] = useState(0);

  // Fetch Project context
  const { data: project } = useQuery({
    queryKey: ["project_details", params.id],
    queryFn: async () => {
      const res = await api.get(`/projects/${params.id}`);
      return res.data.data;
    },
  });

  // Fetch Soil Tests history
  const { data: tests, isLoading, refetch } = useQuery({
    queryKey: ["soil_tests", params.id],
    queryFn: async () => {
      const res = await api.get(`/soil/tests/${params.id}`);
      return res.data.data;
    },
  });

  const activeTest = tests && tests.length > 0 ? tests[selectedTestIndex] || tests[0] : null;

  // Email resend mutation
  const emailMutation = useMutation({
    mutationFn: async (testId: string) => {
      const res = await api.post(`/soil/tests/${testId}/resend-email`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("📧 Soil test results and AI recommendations sent to your email!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Failed to dispatch email.");
    },
  });

  const renderMetricCard = (card: MetricCard, results: any) => {
    const value = results?.[card.key];
    const displayValue = value !== null && value !== undefined ? String(value) : "—";
    const color = getStatusColor(card.key, value);

    return (
      <div key={card.key} className="glass-card rounded-2xl p-4 flex flex-col justify-between space-y-2 border-border/80 hover:border-emerald-500/40 transition-all">
        <div>
          <p className="text-xs text-text-muted font-medium">
            {card.label}
            {card.unit && <span className="opacity-60 ml-1">({card.unit})</span>}
          </p>
          <p className={clsx("text-2xl font-black mt-1", color)}>{displayValue}</p>
        </div>
        <div>{getStatusBadge(card.key, value)}</div>
      </div>
    );
  };

  // Group recommendations by type
  const fertilizers = activeTest?.recommendations?.filter((r: any) => r.recommendation_type === "fertilizer") || [];
  const amendments = activeTest?.recommendations?.filter((r: any) => r.recommendation_type === "amendment") || [];
  const practices = activeTest?.recommendations?.filter((r: any) => r.recommendation_type === "practice") || [];

  const areaNumber = project?.area ? parseFloat(project.area) : 1;
  const areaUnit = project?.area_unit || "acres";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-24">
      {/* ── Page Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${params.id}`}
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
            title="Back to project dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Soil Intelligence<span className="text-emerald-400 text-glow-green">.</span>
              </h1>
              {project && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                  {project.crop_name || project.plant_id || "Crop"} · {project.area} {project.area_unit}
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-0.5">
              Laboratory soil test records, nutrient bioavailability & automated fertilizer prescriptions
            </p>
          </div>
        </div>

        <Link
          href={`/projects/${params.id}/soil/new`}
          className="btn-primary px-5 py-2.5 text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,135,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Soil Test</span>
        </Link>
      </header>

      {/* ── Main Soil Body ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          <p className="text-xs font-mono text-text-muted">Loading soil test records & recommendations...</p>
        </div>
      ) : tests && tests.length > 0 ? (
        <div className="space-y-8 animate-slide-up">
          {/* ── 1. Soil Test History Selector Tabs ── */}
          <div className="glass-card p-4 sm:p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Soil Test History ({tests.length} {tests.length === 1 ? "Record" : "Records"})
                </h3>
              </div>
              <span className="text-xs text-text-muted font-mono">
                Select test below to inspect historical soil restoration
              </span>
            </div>

            {/* Test Selection Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {tests.map((t: any, i: number) => {
                const isSelected = i === selectedTestIndex;
                const formattedDate = new Date(t.test_date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTestIndex(i)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shrink-0 ${
                      isSelected
                        ? "bg-emerald-500/20 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_20px_rgba(0,255,135,0.35)] scale-105"
                        : "bg-surface-secondary text-text-secondary border border-border/80 hover:text-white hover:bg-surface-tertiary"
                    }`}
                  >
                    <FlaskConical className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-text-muted"}`} />
                    <span>{formattedDate}</span>
                    {i === 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase">
                        Latest
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Test Metadata Bar */}
            {activeTest && (
              <div className="p-3.5 rounded-2xl bg-surface-secondary/70 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <span className="text-text-muted">Tested Date: </span>
                    <strong className="text-white font-mono">
                      {new Date(activeTest.test_date).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-text-muted">Tested By: </span>
                    <strong className="text-white">{activeTest.tested_by || "Laboratory Specimen"}</strong>
                  </div>
                  {activeTest.notes && (
                    <div className="text-text-secondary italic">
                      &quot;{activeTest.notes}&quot;
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => emailMutation.mutate(activeTest.id)}
                    disabled={emailMutation.isPending}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                    title="Send recommendation report to your registered email"
                  >
                    {emailMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span>Resend Email Report</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. Detailed Nutrient Telemetry Matrix ── */}
          {activeTest?.results && (
            <div className="glass-card rounded-3xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Soil Chemistry & Nutrient Telemetry</h3>
                  <p className="text-xs text-text-muted">
                    Quantitative test values benchmarked against optimal crop thresholds
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Assay</span>
                </div>
              </div>

              {/* Physical & Chemical */}
              <CollapsibleSection title="Physical & Chemical Properties" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PHYSICAL_CARDS.map((card) => renderMetricCard(card, activeTest.results))}
                </div>
              </CollapsibleSection>

              {/* Primary Macronutrients */}
              <CollapsibleSection title="Primary Macronutrients (N-P-K)" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PRIMARY_CARDS.map((card) => renderMetricCard(card, activeTest.results))}
                </div>
              </CollapsibleSection>

              {/* Secondary Macronutrients */}
              <CollapsibleSection title="Secondary Macronutrients (Ca, Mg, S)" defaultOpen={true}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SECONDARY_CARDS.map((card) => renderMetricCard(card, activeTest.results))}
                </div>
              </CollapsibleSection>

              {/* Micronutrients */}
              <CollapsibleSection title="Micronutrients / Trace Minerals" defaultOpen={false}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {MICRO_CARDS.map((card) => renderMetricCard(card, activeTest.results))}
                </div>
              </CollapsibleSection>
            </div>
          )}

          {/* ── 3. Fertilizer & Amendment Recommendations ── */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border-emerald-500/30 space-y-6 shadow-[0_0_30px_rgba(0,255,135,0.1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xl font-black text-white">Fertilizer & Amendment Recommendations</h3>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
                  AI-calculated crop nutrition prescriptions tailored for {project?.crop_name || "your crop"} ({areaNumber} {areaUnit})
                </p>
              </div>

              {/* Email confirmation badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Recommendation Emailed</span>
              </div>
            </div>

            {activeTest?.recommendations && activeTest.recommendations.length > 0 ? (
              <div className="space-y-6">
                {/* ── Category 1: Fertilizer Prescriptions ── */}
                {fertilizers.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Leaf className="w-4 h-4" />
                      <span>Fertilizer Applications ({fertilizers.length})</span>
                    </div>
                    <div className="grid gap-3">
                      {fertilizers.map((rec: any) => (
                        <div
                          key={rec.id}
                          className="p-4 rounded-2xl bg-surface-secondary/90 border border-emerald-500/30 hover:border-emerald-400 transition-all flex items-start gap-3.5"
                        >
                          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0 mt-0.5">
                            <Leaf className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/30">
                              Fertilizer Dosage
                            </span>
                            <p className="text-sm text-slate-100 font-medium leading-relaxed pt-1">
                              {cleanDescription(rec.description)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Category 2: Soil Conditioners & pH Amendments ── */}
                {amendments.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <Droplets className="w-4 h-4" />
                      <span>Soil Conditioners & pH Amendments ({amendments.length})</span>
                    </div>
                    <div className="grid gap-3">
                      {amendments.map((rec: any) => (
                        <div
                          key={rec.id}
                          className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 hover:border-amber-400 transition-all flex items-start gap-3.5"
                        >
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                            <Droplets className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase border border-amber-500/30">
                              Soil Amendment
                            </span>
                            <p className="text-sm text-slate-100 font-medium leading-relaxed pt-1">
                              {cleanDescription(rec.description)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Category 3: Agronomic Best Practices ── */}
                {practices.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                      <Info className="w-4 h-4" />
                      <span>Agronomic Management Guidelines ({practices.length})</span>
                    </div>
                    <div className="grid gap-3">
                      {practices.map((rec: any) => (
                        <div
                          key={rec.id}
                          className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 hover:border-blue-400 transition-all flex items-start gap-3.5"
                        >
                          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 shrink-0 mt-0.5">
                            <Info className="w-4 h-4" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase border border-blue-500/30">
                              Practice Guide
                            </span>
                            <p className="text-sm text-slate-100 font-medium leading-relaxed pt-1">
                              {cleanDescription(rec.description)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-surface-secondary text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Soil Nutrients In Balanced State</h4>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  All primary and secondary macronutrients are currently in optimal agronomic ranges for this growth cycle.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="glass-card-hover rounded-3xl p-12 text-center animate-slide-up space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto animate-float text-emerald-400">
            <FlaskConical className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">No Soil Tests Recorded Yet</h3>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            Log your soil test laboratory results to calculate tailored fertilizer quantities, pH corrections, and receive automated email reports.
          </p>
          <div className="pt-2">
            <Link
              href={`/projects/${params.id}/soil/new`}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm shadow-[0_0_20px_rgba(0,255,135,0.3)]"
            >
              <Plus className="w-4 h-4" />
              <span>Log First Soil Test</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

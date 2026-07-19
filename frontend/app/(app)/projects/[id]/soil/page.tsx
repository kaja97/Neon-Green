"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Plus, FlaskConical, CheckCircle2, Loader2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

// Optimal ranges matching backend calculator
const OPTIMAL: Record<string, { min: number; max: number }> = {
  nitrogen_n: { min: 250, max: 400 },
  phosphorus_p: { min: 20, max: 40 },
  potassium_k: { min: 150, max: 250 },
  calcium_ca: { min: 800, max: 1600 },
  magnesium_mg: { min: 100, max: 200 },
  sulfur_s: { min: 10, max: 30 },
  zinc_zn: { min: 1, max: 5 },
  boron_b: { min: 0.5, max: 2 },
  iron_fe: { min: 10, max: 40 },
  manganese_mn: { min: 5, max: 30 },
  copper_cu: { min: 0.5, max: 5 },
};

interface MetricCard {
  key: string;
  label: string;
  unit?: string;
}

const PHYSICAL_CARDS: MetricCard[] = [
  { key: "ph_level", label: "pH Level", unit: "" },
  { key: "electrical_conductivity_ec", label: "EC", unit: "ds/m" },
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
  if (value === null || value === undefined) return "text-text-muted"; // not tested

  if (key === "ph_level") {
    if (value < 6.0 || value > 7.5) return "text-red-400"; // acidic or alkaline
    return "text-green-400"; // optimal
  }
  if (key === "electrical_conductivity_ec") {
    if (value > 2.5) return "text-red-400";
    return "text-green-400";
  }

  const range = OPTIMAL[key];
  if (!range) return "text-white";
  if (value < range.min) return "text-red-400"; // deficient
  if (value > range.max) return "text-orange-400"; // excess
  return "text-green-400"; // optimal
}

function getStatusBadge(key: string, value: number | null): React.ReactNode {
  if (value === null || value === undefined) return null;

  if (key === "ph_level") {
    if (value < 6.0) return <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Acidic</span>;
    if (value > 7.5) return <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Alkaline</span>;
    return <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Optimal</span>;
  }
  if (key === "electrical_conductivity_ec") {
    if (value > 2.5) return <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">High</span>;
    return <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Normal</span>;
  }

  const range = OPTIMAL[key];
  if (!range) return null;
  if (value < range.min) return <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Low</span>;
  if (value > range.max) return <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Excess</span>;
  return <span className="text-[10px] font-bold uppercase tracking-wider text-green-400">Optimal</span>;
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
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mb-3 hover:text-white transition-colors"
      >
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
        <span className="text-sm font-bold text-text-muted uppercase tracking-wider">{title}</span>
      </button>
      {isOpen && children}
    </div>
  );
}

export default function SoilPage({ params }: { params: { id: string } }) {
  const { data: tests, isLoading } = useQuery({
    queryKey: ["soil_tests", params.id],
    queryFn: async () => {
      const res = await api.get(`/soil/tests/${params.id}`);
      return res.data.data;
    },
  });

  const renderMetricCard = (card: MetricCard, results: any) => {
    const value = results?.[card.key];
    const displayValue = value !== null && value !== undefined ? String(value) : "—";
    const color = getStatusColor(card.key, value);

    return (
      <div key={card.key} className="glass-card rounded-2xl p-4">
        <p className="text-xs text-text-muted mb-1">
          {card.label}
          {card.unit && <span className="opacity-60 ml-1">({card.unit})</span>}
        </p>
        <p className={clsx("text-xl font-bold", color)}>{displayValue}</p>
        {getStatusBadge(card.key, value)}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${params.id}`}
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Soil Analysis<span className="text-green-400 text-glow-green">.</span>
            </h1>
            <p className="text-text-muted text-sm mt-0.5">Test results and recommendations</p>
          </div>
        </div>
        <Link
          href={`/projects/${params.id}/soil/new`}
          className="btn-primary px-4 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Test</span>
        </Link>
      </header>

      {/* Tests List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          </div>
        ) : tests && tests.length > 0 ? (
          tests.map((test: any, idx: number) => (
            <div
              key={test.id}
              className="glass-card rounded-3xl p-6 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Lab Test ({new Date(test.test_date).toLocaleDateString()})</h3>
                  <p className="text-sm text-text-muted">Tested by: {test.tested_by || "Unknown"}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                  {test.status}
                </span>
              </div>

              {test.results && (
                <div className="space-y-4 mb-6">
                  {/* Physical & Chemical */}
                  <CollapsibleSection title="Physical & Chemical Properties" defaultOpen={true}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PHYSICAL_CARDS.map((card) => renderMetricCard(card, test.results))}
                    </div>
                  </CollapsibleSection>

                  {/* Primary Macronutrients */}
                  <CollapsibleSection title="Primary Macronutrients" defaultOpen={true}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PRIMARY_CARDS.map((card) => renderMetricCard(card, test.results))}
                    </div>
                  </CollapsibleSection>

                  {/* Secondary Macronutrients */}
                  <CollapsibleSection title="Secondary Macronutrients" defaultOpen={false}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SECONDARY_CARDS.map((card) => renderMetricCard(card, test.results))}
                    </div>
                  </CollapsibleSection>

                  {/* Micronutrients */}
                  <CollapsibleSection title="Micronutrients / Trace Elements" defaultOpen={false}>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {MICRO_CARDS.map((card) => renderMetricCard(card, test.results))}
                    </div>
                  </CollapsibleSection>
                </div>
              )}

              {test.recommendations && test.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
                    Fertilizer & Amendment Recommendations
                  </h4>
                  <div className="space-y-3">
                    {test.recommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className={clsx(
                          "flex items-start gap-3 p-3 rounded-xl border",
                          rec.recommendation_type === "fertilizer"
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : rec.recommendation_type === "amendment"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : "bg-orange-500/10 border-orange-500/20 text-orange-400"
                        )}
                      >
                        {rec.recommendation_type === "practice" ? (
                          <AlertTriangle className="w-5 h-5 shrink-0 text-orange-400" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                        )}
                        <span className="text-sm font-medium pt-0.5 leading-snug">{rec.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="glass-card-hover rounded-3xl p-12 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 animate-float">
              <FlaskConical className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Soil Tests Yet</h3>
            <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
              Submit your first soil test to get tailored fertilizer recommendations and improve your yield.
            </p>
            <Link
              href={`/projects/${params.id}/soil/new`}
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              Log Test Results
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

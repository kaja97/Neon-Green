"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  FlaskConical, Save, Loader2, Sparkles, RotateCcw,
  Upload, FileText, CheckCircle2, AlertCircle, FileSpreadsheet,
  Image as ImageIcon, X, ShieldCheck, Zap, ArrowRight
} from "lucide-react";

interface SoilTestFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STANDARD_AVERAGES = {
  ph_level: "6.5",
  electrical_conductivity_ec: "0.40",
  organic_carbon_oc: "1.80",
  cation_exchange_capacity_cec: "18.0",
  nitrogen_n: "260",
  phosphorus_p: "25",
  potassium_k: "180",
  calcium_ca: "1200",
  magnesium_mg: "160",
  sulfur_s: "22",
  zinc_zn: "1.80",
  boron_b: "0.80",
  iron_fe: "12.0",
  manganese_mn: "8.0",
  copper_cu: "0.80",
};

const INITIAL_RESULTS = {
  ph_level: "6.5",
  electrical_conductivity_ec: "",
  organic_carbon_oc: "",
  cation_exchange_capacity_cec: "",
  nitrogen_n: "",
  phosphorus_p: "",
  potassium_k: "",
  calcium_ca: "",
  magnesium_mg: "",
  sulfur_s: "",
  zinc_zn: "",
  boron_b: "",
  iron_fe: "",
  manganese_mn: "",
  copper_cu: "",
};

export default function SoilTestForm({
  projectId,
  onSuccess,
  onCancel,
}: SoilTestFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [labName, setLabName] = useState("");
  const [notes, setNotes] = useState("");
  const [results, setResults] = useState(INITIAL_RESULTS);

  // File Upload & AI Extraction State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [highlightFields, setHighlightFields] = useState(false);
  const [extractedRawList, setExtractedRawList] = useState<any[]>([]);

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateResult = (key: string, value: string) => {
    setResults((prev) => ({ ...prev, [key]: value }));
  };

  const prefillAverages = () => {
    setResults(STANDARD_AVERAGES);
    if (!labName) setLabName("Regional Agriculture Soil Testing Lab");
    if (!notes) setNotes("Pre-planting soil baseline evaluation");
    toast.info("Prefilled standard agronomic baseline values");
  };

  const clearForm = () => {
    setResults(INITIAL_RESULTS);
    setSelectedFile(null);
    setExtractSuccess(null);
    setExtractedRawList([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Soil form fields reset");
  };

  const parseNum = (val: string) => {
    if (!val || val.trim() === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractSuccess(null);
      setError(null);
    }
  };

  // ── Method A: Direct Upload, AI Extract & Auto-Create ──
  const handleDirectUploadAndCreate = async () => {
    if (!selectedFile) return;
    setIsAutoCreating(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post(`/soil/upload-and-create/${projectId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      queryClient.invalidateQueries({ queryKey: ["soil_tests", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });

      toast.success("Soil test report extracted and created successfully!");
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.error?.message ||
        "Failed to process and create soil test from report.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsAutoCreating(false);
    }
  };

  // ── Method B: Extract & Auto-Fill Form Fields (Preview & Edit) ──
  const handleExtractToForm = async () => {
    if (!selectedFile) return;
    setIsExtracting(true);
    setError(null);
    setExtractSuccess(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post("/soil/extract-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extracted = res.data?.data || res.data;
      if (extracted) {
        if (extracted.test_date) {
          setTestDate(extracted.test_date);
        }

        if (extracted.tested_by) {
          setLabName(extracted.tested_by);
        } else if (!labName) {
          setLabName(`Report: ${selectedFile.name}`);
        }

        if (extracted.notes) {
          setNotes(extracted.notes);
        }

        if (extracted.results) {
          const r = extracted.results;
          setResults({
            ph_level: r.ph_level !== null && r.ph_level !== undefined ? String(r.ph_level) : "6.5",
            electrical_conductivity_ec: r.electrical_conductivity_ec !== null && r.electrical_conductivity_ec !== undefined ? String(r.electrical_conductivity_ec) : "",
            organic_carbon_oc: r.organic_carbon_oc !== null && r.organic_carbon_oc !== undefined ? String(r.organic_carbon_oc) : "",
            cation_exchange_capacity_cec: r.cation_exchange_capacity_cec !== null && r.cation_exchange_capacity_cec !== undefined ? String(r.cation_exchange_capacity_cec) : "",
            nitrogen_n: r.nitrogen_n !== null && r.nitrogen_n !== undefined ? String(r.nitrogen_n) : "",
            phosphorus_p: r.phosphorus_p !== null && r.phosphorus_p !== undefined ? String(r.phosphorus_p) : "",
            potassium_k: r.potassium_k !== null && r.potassium_k !== undefined ? String(r.potassium_k) : "",
            calcium_ca: r.calcium_ca !== null && r.calcium_ca !== undefined ? String(r.calcium_ca) : "",
            magnesium_mg: r.magnesium_mg !== null && r.magnesium_mg !== undefined ? String(r.magnesium_mg) : "",
            sulfur_s: r.sulfur_s !== null && r.sulfur_s !== undefined ? String(r.sulfur_s) : "",
            zinc_zn: r.zinc_zn !== null && r.zinc_zn !== undefined ? String(r.zinc_zn) : "",
            boron_b: r.boron_b !== null && r.boron_b !== undefined ? String(r.boron_b) : "",
            iron_fe: r.iron_fe !== null && r.iron_fe !== undefined ? String(r.iron_fe) : "",
            manganese_mn: r.manganese_mn !== null && r.manganese_mn !== undefined ? String(r.manganese_mn) : "",
            copper_cu: r.copper_cu !== null && r.copper_cu !== undefined ? String(r.copper_cu) : "",
          });
        }

        if (extracted.raw_extracted_nutrients) {
          setExtractedRawList(extracted.raw_extracted_nutrients);
        }

        setExtractSuccess(
          `AI Report Extracted: Successfully auto-filled values from "${selectedFile.name}"!`
        );
        toast.success("AI extracted soil parameters into form fields!");
        setHighlightFields(true);
        setTimeout(() => setHighlightFields(false), 3000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error?.message || "Failed to extract data from soil report.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const getFileIcon = (fname: string) => {
    const ext = fname.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return <FileText className="w-5 h-5 text-red-400" />;
    if (ext === "xlsx" || ext === "xls" || ext === "csv") return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (ext === "docx" || ext === "doc") return <FileText className="w-5 h-5 text-blue-400" />;
    return <ImageIcon className="w-5 h-5 text-purple-400" />;
  };

  // ── Method C: Standard / Manual Form Submission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post(`/soil/tests/${projectId}`, {
        test_date: testDate,
        tested_by: labName.trim() || null,
        notes: notes.trim() || null,
        results: {
          ph_level: Number(results.ph_level) || 6.5,
          electrical_conductivity_ec: parseNum(results.electrical_conductivity_ec),
          organic_carbon_oc: parseNum(results.organic_carbon_oc),
          cation_exchange_capacity_cec: parseNum(results.cation_exchange_capacity_cec),
          nitrogen_n: parseNum(results.nitrogen_n),
          phosphorus_p: parseNum(results.phosphorus_p),
          potassium_k: parseNum(results.potassium_k),
          calcium_ca: parseNum(results.calcium_ca),
          magnesium_mg: parseNum(results.magnesium_mg),
          sulfur_s: parseNum(results.sulfur_s),
          zinc_zn: parseNum(results.zinc_zn),
          boron_b: parseNum(results.boron_b),
          iron_fe: parseNum(results.iron_fe),
          manganese_mn: parseNum(results.manganese_mn),
          copper_cu: parseNum(results.copper_cu),
        },
      });

      queryClient.invalidateQueries({ queryKey: ["soil_tests", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });

      toast.success("Soil test saved & AI recommendations generated!");
      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error?.message || "Failed to submit soil test.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50";

  const smallInputClasses = `w-full h-10 px-3 rounded-xl bg-surface-tertiary border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 ${
    highlightFields ? "border-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "border-border"
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Header & Helper Buttons ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <FlaskConical className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">
              Soil Test Diagnostic Entry
            </h3>
            <p className="text-xs text-text-muted">
              Upload laboratory report document or type nutrient values manually
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={prefillAverages}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30"
          title="Fill standard optimal baseline values"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Prefill Baseline</span>
        </button>
      </div>

      {/* ── AI Document Upload Dropzone & Extract / Create Actions ── */}
      <div className="p-4 rounded-2xl bg-surface-secondary/70 border border-border space-y-3.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Method 1: AI Document Scanner & Auto-Fill
          </span>
          <span className="text-[11px] font-mono text-text-muted">
            PDF, Images, Excel, Word, CSV
          </span>
        </div>

        {/* File Picker */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.doc,.xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            id="soil-report-upload"
          />
          {selectedFile ? (
            <div className="w-full p-3 rounded-xl bg-surface-tertiary border border-emerald-500/40 flex items-center justify-between gap-3 text-sm text-text-primary">
              <div className="flex items-center gap-2.5 truncate">
                {getFileIcon(selectedFile.name)}
                <span className="truncate font-medium">{selectedFile.name}</span>
                <span className="text-xs text-text-muted font-mono">
                  ({(selectedFile.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1 hover:bg-surface-elevated rounded-lg text-text-muted hover:text-red-400 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="soil-report-upload"
              className="w-full py-4 px-4 rounded-xl bg-surface-tertiary border-2 border-dashed border-border hover:border-emerald-400 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer hover:text-emerald-400 transition-all text-center"
            >
              <Upload className="w-5 h-5 text-emerald-400" />
              <span>Choose or Drop Laboratory Report (PDF, Image, Excel, Word, CSV)</span>
            </label>
          )}
        </div>

        {/* Dual AI Actions when a file is selected */}
        {selectedFile && (
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDirectUploadAndCreate}
              disabled={isAutoCreating || isExtracting || isLoading}
              className="flex-1 h-11 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:opacity-50 transition-all"
            >
              {isAutoCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Creating Soil Test with AI...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>1-Click Upload & Create Soil Test</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleExtractToForm}
              disabled={isExtracting || isAutoCreating || isLoading}
              className="h-11 px-4 rounded-xl btn-secondary flex items-center justify-center gap-2 text-xs font-semibold whitespace-nowrap disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting Metrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Auto-Fill Form (Preview & Edit)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Security & Extraction Status Notice */}
        {extractSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{extractSuccess}</p>
              {extractedRawList.length > 0 && (
                <p className="text-[11px] text-text-muted">
                  Auto-mapped {extractedRawList.length} chemical parameters. You can review and adjust any field below before saving.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Method 2: Manual Fields / AI Form Review ── */}
      <div className="border-t border-border pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Method 2: Manual Entry & Form Review
        </span>
      </div>

      {/* General Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Test Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={testDate}
            onChange={(e) => setTestDate(e.target.value)}
            required
            disabled={isLoading || isAutoCreating}
            className={`${inputClasses} [color-scheme:dark]`}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Testing Laboratory / Agency
          </label>
          <input
            type="text"
            placeholder="e.g. Regional Agriculture Soil Testing Lab"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            disabled={isLoading || isAutoCreating}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Sample Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-secondary">
          Sample Notes & Field Location
        </label>
        <input
          type="text"
          placeholder="e.g. North Sector - 0-15cm topsoil composite sample"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading || isAutoCreating}
          className={inputClasses}
        />
      </div>

      {/* ── pH + Physical Properties ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Physical & Chemical Properties
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Optimal: pH 6.0–7.2</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">
              pH Level <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="14"
              placeholder="6.5"
              value={results.ph_level}
              onChange={(e) => updateResult("ph_level", e.target.value)}
              required
              disabled={isLoading || isAutoCreating}
              className={smallInputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">EC (ds/m)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.40"
              value={results.electrical_conductivity_ec}
              onChange={(e) => updateResult("electrical_conductivity_ec", e.target.value)}
              disabled={isLoading || isAutoCreating}
              className={smallInputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Organic Carbon (%)</label>
            <input
              type="number"
              step="0.01"
              placeholder="1.80"
              value={results.organic_carbon_oc}
              onChange={(e) => updateResult("organic_carbon_oc", e.target.value)}
              disabled={isLoading || isAutoCreating}
              className={smallInputClasses}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">CEC (meq/100g)</label>
            <input
              type="number"
              step="0.1"
              placeholder="18.0"
              value={results.cation_exchange_capacity_cec}
              onChange={(e) => updateResult("cation_exchange_capacity_cec", e.target.value)}
              disabled={isLoading || isAutoCreating}
              className={smallInputClasses}
            />
          </div>
        </div>
      </div>

      {/* ── Primary Macronutrients (NPK) ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Primary Macronutrients (ppm)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">N: 250-400 | P: 20-40 | K: 150-250</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "nitrogen_n", label: "Nitrogen (N)", placeholder: "260" },
            { key: "phosphorus_p", label: "Phosphorus (P)", placeholder: "25" },
            { key: "potassium_k", label: "Potassium (K)", placeholder: "180" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                {label}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder={placeholder}
                value={results[key as keyof typeof INITIAL_RESULTS]}
                onChange={(e) => updateResult(key, e.target.value)}
                disabled={isLoading || isAutoCreating}
                className={smallInputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Secondary Macronutrients (Ca, Mg, S) ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Secondary Macronutrients (ppm)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Ca: 800-1600 | Mg: 100-200 | S: 10-30</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "calcium_ca", label: "Calcium (Ca)", placeholder: "1200" },
            { key: "magnesium_mg", label: "Magnesium (Mg)", placeholder: "160" },
            { key: "sulfur_s", label: "Sulfur (S)", placeholder: "22" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">
                {label}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder={placeholder}
                value={results[key as keyof typeof INITIAL_RESULTS]}
                onChange={(e) => updateResult(key, e.target.value)}
                disabled={isLoading || isAutoCreating}
                className={smallInputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Micronutrients / Trace Elements (Zn, B, Fe, Mn, Cu) ── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Micronutrients / Trace Elements (ppm)
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Zn, B, Fe, Mn, Cu</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: "zinc_zn", label: "Zn", placeholder: "1.80" },
            { key: "boron_b", label: "B", placeholder: "0.80" },
            { key: "iron_fe", label: "Fe", placeholder: "12.0" },
            { key: "manganese_mn", label: "Mn", placeholder: "8.0" },
            { key: "copper_cu", label: "Cu", placeholder: "0.80" },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-muted text-center block">{label}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder={placeholder}
                value={results[key as keyof typeof INITIAL_RESULTS]}
                onChange={(e) => updateResult(key, e.target.value)}
                disabled={isLoading || isAutoCreating}
                className={smallInputClasses}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Form Actions ── */}
      <div className="flex items-center gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 btn-secondary flex items-center justify-center text-sm font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={clearForm}
          className="h-11 px-4 rounded-xl bg-surface-secondary border border-border hover:bg-surface-tertiary text-text-secondary text-sm font-semibold transition-all flex items-center gap-1.5"
          title="Reset values to blank"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
        <button
          type="submit"
          disabled={isLoading || isExtracting || isAutoCreating}
          className={`${onCancel ? "flex-[2]" : "flex-1"} h-11 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-bold`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving & Calculating Recommendations...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Soil Test & Generate Recommendations</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

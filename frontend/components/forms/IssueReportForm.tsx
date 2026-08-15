"use client";

import { useState } from "react";
import { Loader2, Bug, Send, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface IssueReportFormProps {
  projectId: string;
  onSuccess?: (result: any) => void;
  onCancel?: () => void;
}

const AFFECTED_PARTS = [
  { id: "leaves", label: "🍃 Leaves", emoji: "🍃" },
  { id: "fruit", label: "🍎 Fruit / Pods", emoji: "🍎" },
  { id: "stem", label: "🌿 Stem / Trunk", emoji: "🌿" },
  { id: "root", label: "🌱 Roots", emoji: "🌱" },
  { id: "flower", label: "🌸 Flowers", emoji: "🌸" },
  { id: "whole_plant", label: "🌳 Whole Plant", emoji: "🌳" },
];

export default function IssueReportForm({
  projectId,
  onSuccess,
  onCancel,
}: IssueReportFormProps) {
  const queryClient = useQueryClient();

  const [description, setDescription] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePart = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId)
        ? prev.filter((p) => p !== partId)
        : [...prev, partId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (description.trim().length < 10) {
      setError("Please describe the issue in at least 10 characters.");
      return;
    }

    if (selectedParts.length === 0) {
      setError("Please select at least one affected part.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/issues", {
        project_id: projectId,
        description: description.trim(),
        affected_parts: selectedParts,
        severity,
      });

      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
      onSuccess?.(res.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to report issue."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-500/10">
          <Bug className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report Issue</h3>
          <p className="text-xs text-text-muted">
            Describe the problem — AI will match possible diseases
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-slide-down">
          {error}
        </div>
      )}

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-secondary">
          What&apos;s happening? <span className="text-red-400">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Yellowing spots on lower leaves, spreading upward over 3 days..."
          required
          minLength={10}
          rows={4}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
        />
      </div>

      {/* Affected Parts */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          Affected Parts <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AFFECTED_PARTS.map((part) => {
            const isSelected = selectedParts.includes(part.id);
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => togglePart(part.id)}
                disabled={isLoading}
                className={`p-3 rounded-xl border text-left text-sm font-medium transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface-tertiary border-border text-text-secondary hover:border-border-hover"
                }`}
              >
                {isSelected && <CheckCircle className="w-4 h-4 shrink-0" />}
                {part.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          Severity
        </label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSeverity(level)}
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
                severity === level
                  ? level === "high"
                    ? "bg-red-500/10 border-red-500 text-red-400"
                    : level === "medium"
                      ? "bg-neon-gold/10 border-neon-gold text-neon-gold"
                      : "bg-primary/10 border-primary text-primary"
                  : "bg-surface-tertiary border-border text-text-muted hover:border-border-hover"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 btn-secondary flex items-center justify-center text-sm"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`${onCancel ? "flex-[2]" : "w-full"} h-11 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Analyze Issue
            </>
          )}
        </button>
      </div>
    </form>
  );
}

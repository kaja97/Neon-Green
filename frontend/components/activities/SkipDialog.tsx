"use client";

import { useState } from "react";
import { X, SkipForward, Loader2 } from "lucide-react";

interface SkipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  activityTitle?: string;
}

export default function SkipDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  activityTitle,
}: SkipDialogProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) return;
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card p-6 w-full max-w-sm animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-neon-gold/10">
            <SkipForward className="w-5 h-5 text-neon-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skip Activity</h3>
            {activityTitle && (
              <p className="text-xs text-text-muted truncate max-w-[200px]">
                {activityTitle}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Reason for skipping <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Heavy rain this morning..."
              required
              minLength={3}
              rows={3}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neon-gold focus:border-transparent transition-all disabled:opacity-50"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 btn-secondary flex items-center justify-center text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || reason.trim().length < 3}
              className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm disabled:opacity-50 hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <SkipForward className="w-4 h-4" />
                  Skip
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password/request-otp", {
        email_or_phone: identifier,
      });
      setStep(2);
      setCountdown(300); // 5 minutes
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          "Failed to send recovery code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forgot-password/verify", {
        email_or_phone: identifier,
        otp_code: otpCode,
        new_password: newPassword,
      });

      // Redirect to login with success
      router.push("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setError("");
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password/request-otp", {
        email_or_phone: identifier,
      });
      setCountdown(300);
    } catch {
      setError("Failed to resend recovery code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-neon-gold/10 flex items-center justify-center">
          {step === 1 ? (
            <KeyRound className="w-7 h-7 text-neon-gold" />
          ) : (
            <ShieldCheck className="w-7 h-7 text-primary" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-white">
          {step === 1 ? "Reset Password" : "Set New Password"}
        </h2>
        <p className="text-sm text-text-secondary">
          {step === 1
            ? "Enter your email or phone to receive a recovery code"
            : `Enter the code sent to ${identifier}`}
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-slide-down">
          {error}
        </div>
      )}

      {/* Step 1: Enter Email/Phone */}
      {step === 1 && (
        <form onSubmit={handleRequestOTP} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Email or Phone Number
            </label>
            <input
              type="text"
              placeholder="farmer@example.com or +9477..."
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
              className="w-full h-12 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-neon-gold focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Send Recovery Code"
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP + New Password */}
      {step === 2 && (
        <form onSubmit={handleVerifyAndReset} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              6-Digit Recovery Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="• • • • • •"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              disabled={isLoading}
              autoFocus
              className="w-full h-14 px-4 rounded-xl bg-surface-tertiary border border-border text-white text-center text-2xl font-mono tracking-[0.5em] placeholder:text-text-muted placeholder:text-lg placeholder:tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              {countdown > 0
                ? `Code expires in ${formatCountdown(countdown)}`
                : "Code expired"}
            </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="font-semibold text-primary hover:text-primary/80 disabled:text-text-muted transition-colors"
            >
              Resend Code
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-secondary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Password strength */}
            {newPassword.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      newPassword.length >= i * 3
                        ? newPassword.length >= 12
                          ? "bg-primary"
                          : newPassword.length >= 8
                            ? "bg-neon-gold"
                            : "bg-red-400"
                        : "bg-surface-tertiary"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 h-12 btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="flex-[2] h-12 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-text-secondary">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

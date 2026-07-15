"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";

type Step = 1 | 2 | 3;

const STEP_LABELS = ["Account Details", "Verify Identity", "Farm Profile"];

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  // Step control
  const [step, setStep] = useState<Step>(1);

  // Step 1: Basic Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(120);

  // Step 3: Farm Profile
  const [farmingMethod, setFarmingMethod] = useState("organic");
  const [experienceYears, setExperienceYears] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("en");
  const [farmingMethods, setFarmingMethods] = useState<
    Array<{ id: string; code: string; name: string }>
  >([]);

  // UI State
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Fetch farming methods when step 3 is reached
  useEffect(() => {
    if (step === 3 && farmingMethods.length === 0) {
      api
        .get("/farming-methods")
        .then((res) => {
          setFarmingMethods(
            (res.data.data || []).map((method: { id: string; name: string }) => ({
              ...method,
              code: method.id,
            }))
          );
          if (res.data.data?.length > 0) {
            setFarmingMethod(res.data.data[0].id);
          }
        })
        .catch(() => {
          // Fallback if endpoint not ready
          setFarmingMethods([
            { id: "1", code: "organic", name: "Organic Farming" },
            { id: "2", code: "inorganic", name: "Conventional Farming" },
            { id: "3", code: "integrated", name: "Integrated Farming" },
          ]);
        });
    }
  }, [step, farmingMethods.length]);

  // Step 1: Request OTP
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/register/request-otp", {
        email,
        phone: phone || undefined,
      });
      setStep(2);
      setCountdown(120);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Failed to send verification code."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP → proceed to step 3
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    // Just validate the OTP format locally, actual verification happens in step 3
    setStep(3);
  };

  // Step 3: Complete registration
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/register/verify", {
        email,
        phone: phone || undefined,
        otp_code: otpCode,
        password,
        full_name: fullName,
        farming_method: farmingMethod,
        primary_language: primaryLanguage,
      });

      const { access_token } = res.data.data;

      // Fetch user profile
      const meRes = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const userData = meRes.data.data;

      // Auto-login
      login(
        {
          id: userData.id || userData.account_id,
          email: userData.email,
          role: userData.role || "farmer",
          name: userData.farmer_profile?.full_name,
        },
        access_token
      );

      // Redirect to dashboard (NOT login)
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Registration failed. Please try again."
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
      await api.post("/auth/register/request-otp", {
        email,
        phone: phone || undefined,
      });
      setCountdown(120);
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCountdown = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="glass-card p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Create Account</h2>
        <p className="text-sm text-text-secondary">
          {step === 1
            ? "Join Neon Agri"
            : step === 2
              ? `Enter the code sent to ${email}`
              : "Set up your farming profile"}
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as Step;
          const isActive = step === stepNum;
          const isDone = step > stepNum;

          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? "bg-primary text-white glow-green"
                      : isActive
                        ? "bg-primary/20 text-primary ring-2 ring-primary"
                        : "bg-surface-tertiary text-text-muted"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                      isDone ? "bg-primary" : "bg-surface-tertiary"
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 animate-slide-down">
          {error}
        </div>
      )}

      {/* Step 1: Account Details */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Nimal Perera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              placeholder="farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Phone Number{" "}
              <span className="text-text-muted">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="+94771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
                className="w-full h-11 px-4 pr-12 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
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
            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      password.length >= i * 3
                        ? password.length >= 12
                          ? "bg-primary"
                          : password.length >= 8
                            ? "bg-neon-gold"
                            : "bg-red-400"
                        : "bg-surface-tertiary"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              6-Digit Verification Code
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
              disabled={otpCode.length !== 6 || isLoading}
              className="flex-[2] h-12 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              Verify & Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Farm Profile */}
      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Farming Method
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(farmingMethods.length > 0
                ? farmingMethods
                : [
                    { id: "1", code: "organic", name: "🌿 Organic Farming" },
                    {
                      id: "2",
                      code: "inorganic",
                      name: "🧪 Conventional Farming",
                    },
                    {
                      id: "3",
                      code: "integrated",
                      name: "🔄 Integrated Farming",
                    },
                  ]
              ).map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setFarmingMethod(method.code)}
                  className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${
                    farmingMethod === method.code
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface-tertiary border-border text-text-secondary hover:border-border-hover"
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 5"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Preferred Language
            </label>
            <div className="flex gap-2">
              {[
                { code: "en", label: "English" },
                { code: "si", label: "සිංහල" },
                { code: "ta", label: "தமிழ்" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setPrimaryLanguage(lang.code)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    primaryLanguage === lang.code
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-surface-tertiary border-border text-text-secondary hover:border-border-hover"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 h-12 btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-[2] h-12 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer */}
      {step === 1 && (
        <div className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}

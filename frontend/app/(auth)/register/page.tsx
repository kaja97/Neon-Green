"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const regRes = await api.post("/auth/register", {
        full_name: fullName,
        email: email,
        phone_number: phone || undefined,
        password: password,
      });

      const { access_token } = regRes.data.data;
      useAuthStore.setState({ accessToken: access_token });

      const meRes = await api.get("/auth/me");
      const userData = meRes.data.data;

      login(
        {
          id: userData.id || userData.account_id,
          email: userData.email,
          role: userData.role || "farmer",
          name: userData.farmer_profile?.full_name || fullName,
        },
        access_token
      );

      router.push("/dashboard");
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error.message || "Registration failed");
      } else {
        setError("Could not complete registration. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 sm:p-10 space-y-6 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white">Create Account</h2>
        <p className="text-sm text-text-secondary font-medium">
          Start autonomous precision farming for free
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-semibold animate-slide-down">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="fullName"
            className="text-xs font-bold uppercase tracking-wider text-text-secondary"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Kajanan Farmer"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full h-12 px-4 rounded-xl bg-surface-tertiary/70 border border-border text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold uppercase tracking-wider text-text-secondary"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="farmer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full h-12 px-4 rounded-xl bg-surface-tertiary/70 border border-border text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="phone"
            className="text-xs font-bold uppercase tracking-wider text-text-secondary"
          >
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="+94 77 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
            className="w-full h-12 px-4 rounded-xl bg-surface-tertiary/70 border border-border text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wider text-text-secondary"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
              className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-tertiary/70 border border-border text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 btn-primary flex items-center justify-center gap-2 text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)] mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Register Free Account</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm text-text-secondary font-medium">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}

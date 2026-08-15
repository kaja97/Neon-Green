"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Loader2, Sprout } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const loginRes = await api.post("/auth/login", {
        email_or_phone: identifier,
        password: password,
      });

      const { access_token } = loginRes.data.data;
      useAuthStore.setState({ accessToken: access_token });

      const meRes = await api.get("/auth/me");
      const userData = meRes.data.data;

      login(
        {
          id: userData.id || userData.account_id,
          email: userData.email,
          role: userData.role || "farmer",
          name: userData.farmer_profile?.full_name,
        },
        access_token
      );

      if (userData.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error.message || "Invalid credentials");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 sm:p-10 space-y-6 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="text-sm text-text-secondary font-medium">
          Sign in to your AgriFarm AI account
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-semibold animate-slide-down">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email/Phone */}
        <div className="space-y-1.5">
          <label
            htmlFor="identifier"
            className="text-xs font-bold uppercase tracking-wider text-text-secondary"
          >
            Email or Phone Number
          </label>
          <input
            id="identifier"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="farmer@example.com or +9477..."
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            disabled={isLoading}
            className="w-full h-12 px-4 rounded-xl bg-surface-tertiary/70 border border-border text-text-primary placeholder:text-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-text-secondary"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          className="w-full h-12 btn-primary flex items-center justify-center gap-2 text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,197,94,0.3)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In Securely</span>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center text-xs sm:text-sm text-text-secondary font-medium">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
        >
          Create Free Account
        </Link>
      </div>
    </div>
  );
}

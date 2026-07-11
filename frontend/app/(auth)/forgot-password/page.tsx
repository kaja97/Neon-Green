import { Sprout, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-100 blur-3xl rounded-full pointer-events-none opacity-50" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-2xl">
              <Sprout className="w-10 h-10 text-green-700" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 mt-2">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="farmer@example.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-sm">
              Send Reset Link
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-green-600 text-sm font-semibold hover:text-green-700 transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

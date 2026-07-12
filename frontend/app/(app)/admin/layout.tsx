"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { LayoutDashboard, Users, Database, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/master-data", label: "Master Data", icon: Database },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                  isActive ? "bg-green-50 text-green-700" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-green-600" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:hidden flex items-center justify-between bg-white border-b border-slate-200">
           <h1 className="text-lg font-bold">Admin Portal</h1>
           <Link href="/dashboard" className="text-sm font-medium text-slate-500">Exit</Link>
        </div>
        {children}
      </main>
    </div>
  );
}

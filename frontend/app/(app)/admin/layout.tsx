"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Sprout,
  ShieldAlert,
  AlertTriangle,
  FolderGit2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-primary">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/master-data", label: "Crops & Varieties", icon: Sprout },
    { href: "/admin/health-library", label: "Health & Issues Library", icon: ShieldAlert },
    { href: "/admin/issues", label: "Reported Field Issues", icon: AlertTriangle },
    { href: "/admin/projects", label: "Global Projects", icon: FolderGit2 },
    { href: "/admin/users", label: "User Directory", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-surface-primary overflow-hidden text-text-primary">
      {/* Sidebar */}
      <aside className="w-72 glass-card rounded-none border-y-0 border-l-0 flex flex-col hidden md:flex z-20">
        <div className="p-6 border-b border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-neon-purple uppercase bg-neon-purple/10 px-2 py-0.5 rounded border border-neon-purple/20">
                System Control
              </span>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Admin Portal<span className="text-neon-purple">.</span>
              </h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                  isActive
                    ? "bg-neon-purple/15 text-neon-purple border border-neon-purple/30 glow-purple-sm font-semibold"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-neon-purple" : "text-text-muted")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Admin Active
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile Header */}
        <div className="p-4 md:hidden flex items-center justify-between glass-card rounded-none border-x-0 border-t-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neon-purple uppercase bg-neon-purple/10 px-2 py-0.5 rounded">
              Admin
            </span>
            <h1 className="text-base font-bold text-slate-900 dark:text-white">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="text-xs font-medium text-text-secondary hover:text-white">
              Exit
            </Link>
          </div>
        </div>

        {/* Mobile Nav Scroller */}
        <div className="md:hidden flex items-center gap-2 p-3 overflow-x-auto border-b border-border bg-surface-secondary">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-neon-purple text-white font-semibold"
                    : "bg-surface-tertiary text-text-secondary hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

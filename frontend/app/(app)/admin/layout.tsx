"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { LayoutDashboard, Users, Database, ArrowLeft, Loader2, Sprout } from "lucide-react";
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
    { href: "/admin/projects", label: "Projects", icon: Sprout },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/master-data", label: "Master Data", icon: Database },
  ];

  return (
    <div className="flex h-screen bg-surface-primary overflow-hidden text-text-primary">
      {/* Sidebar */}
      <aside className="w-64 glass-card rounded-none border-y-0 border-l-0 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
          <h1 className="text-xl font-black text-white tracking-tight">
            Admin Portal<span className="text-neon-purple">.</span>
          </h1>
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
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                  isActive
                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-neon-purple" : "text-text-muted")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:hidden flex items-center justify-between glass-card rounded-none border-x-0 border-t-0">
          <h1 className="text-lg font-bold text-white">Admin Portal</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="text-sm font-medium text-text-secondary">Exit</Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

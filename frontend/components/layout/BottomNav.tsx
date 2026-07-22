"use client";

import { Home, FolderOpen, Store, Bell, User, MessagesSquare, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: Store },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/community", label: "Community", icon: MessagesSquare },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full md:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-surface-primary/80 backdrop-blur-xl border-t border-border" />

      <div className="relative grid h-16 w-full grid-cols-7 items-center justify-center max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname?.startsWith(href));

          return (
            <Link
              key={label}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1 group"
            >
              {/* Active glow */}
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
              )}

              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-text-muted group-hover:text-text-secondary"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? "text-primary" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

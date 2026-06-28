"use client";

import { Home, LayoutDashboard, Bot, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/projects/1", label: "Projects", icon: LayoutDashboard },
    { href: "/projects/1/ai", label: "AI", icon: Bot },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t border-slate-800 bg-background/80 backdrop-blur-xl md:hidden">
      <div className="grid h-full w-full grid-cols-4 items-center justify-center">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

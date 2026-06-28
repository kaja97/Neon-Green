import { Bell, UserCircle2 } from "lucide-react";
import Link from "next/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-300">
            AgriFarm AI
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/notifications" className="relative p-2 text-slate-400 hover:text-white transition-colors">
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
          </Link>
          <Link href="/profile" className="p-1 text-slate-400 hover:text-white transition-colors">
            <UserCircle2 className="h-8 w-8" />
          </Link>
        </div>
      </div>
    </header>
  );
}

import AIChatWindow from "@/components/ai/AIChatWindow";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AIChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.id}`} className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400 text-glow-green animate-pulse" />
              AI Assistant
            </h1>
            <p className="text-slate-400 text-sm">Tomato Farm context is loaded.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#22c55e]" />
          <span className="text-xs font-bold uppercase tracking-wider">8 Calls Remaining</span>
        </div>
      </header>

      {/* Chat Window */}
      <AIChatWindow />
    </div>
  );
}

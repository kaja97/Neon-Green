import AIChatWindow from "@/components/ai/AIChatWindow";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AIChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.id}`} className="p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Assistant
            </h1>
            <p className="text-slate-400 text-sm">Tomato Farm context is loaded.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">8 Calls Remaining</span>
        </div>
      </header>

      {/* Chat Window */}
      <AIChatWindow />
    </div>
  );
}

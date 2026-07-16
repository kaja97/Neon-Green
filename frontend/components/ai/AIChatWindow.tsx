import { Send, Bot, User } from "lucide-react";
import { clsx } from "clsx";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export default function AIChatWindow() {
  const messages: Message[] = [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AgriFarm AI assistant. How can I help you with your Tomato Farm today?",
    },
    {
      id: "2",
      role: "user",
      content: "Why are my lower leaves turning yellow?",
    },
    {
      id: "3",
      role: "assistant",
      content: "Based on your soil test (pH 6.2, Nitrogen: LOW), the yellowing is likely a nitrogen deficiency. For your organic farm, I recommend applying 25kg of compost per acre this week. Also, since it's flowering, ensure it gets enough potassium.",
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[600px] glass-card border border-white/5 overflow-hidden relative shadow-2xl bg-slate-950/20">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-[90px] rounded-full -mr-20 -mt-20 pointer-events-none" />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 z-10 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx(
              "flex gap-4 max-w-[85%] animate-fade-in",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={clsx(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5",
                msg.role === "assistant" ? "bg-green-500/10 text-green-400 text-glow-green" : "bg-slate-900 text-slate-400"
              )}
            >
              {msg.role === "assistant" ? <Bot className="w-6 h-6 animate-pulse" /> : <User className="w-6 h-6" />}
            </div>
            <div
              className={clsx(
                "p-4 rounded-[20px] text-sm md:text-base leading-relaxed shadow-md transition-all duration-300",
                msg.role === "assistant"
                  ? "bg-slate-900/60 text-slate-200 border border-slate-800/80 rounded-tl-none hover:bg-slate-900/80"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] rounded-tr-none"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/40 backdrop-blur-xl z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Type your question..."
            className="w-full bg-slate-900/80 border border-slate-850 text-white rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-500"
          />
          <button className="absolute right-2 p-2.5 btn-primary hover:scale-[1.05] active:scale-[0.95] rounded-full transition-all duration-300 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-500 mt-3 font-medium uppercase tracking-wider">
          AgriFarm AI is powered by Google Gemini (Free Tier)
        </p>
      </div>
    </div>
  );
}

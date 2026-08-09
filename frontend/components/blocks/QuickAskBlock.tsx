"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Send, Loader2, Bot } from "lucide-react";

export default function QuickAskBlock({ projectId }: { projectId: string }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const askMutation = useMutation({
    mutationFn: async (msg: string) => {
      const res = await api.post(`/ai/${projectId}/chat`, { message: msg });
      return res.data.data;
    },
    onSuccess: (data) => {
      setAnswer(data.ai_response);
    },
    onError: () => {
      setAnswer("Sorry, I couldn't process your question. Please try again later.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAnswer(null);
    askMutation.mutate(question.trim());
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-base text-white">Ask About Your Farm</h3>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What should I do about yellow leaves?"
            disabled={askMutation.isPending}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <button
            type="submit"
            disabled={!question.trim() || askMutation.isPending}
            className="px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {askMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {askMutation.isPending && (
        <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm relative z-10">
          <Loader2 className="w-4 h-4 animate-spin" />
          Thinking...
        </div>
      )}

      {answer && (
        <div className="mt-4 p-4 bg-slate-800/80 border border-slate-700 rounded-xl relative z-10">
          <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      <div className="mt-3 relative z-10">
        <Link
          href={`/projects/${projectId}/ai`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Continue full conversation →
        </Link>
      </div>
    </div>
  );
}

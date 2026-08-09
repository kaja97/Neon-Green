"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Send, Bot, User, Loader2, Sparkles, MessageSquarePlus, Trash2 } from "lucide-react";
import { clsx } from "clsx";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  tokens_used?: number;
  created_at?: string;
}

interface Conversation {
  id: string;
  project_id: string;
  session_title: string;
  is_active: boolean;
  created_at: string;
}

interface ChatResponse {
  conversation_id: string;
  user_message: string;
  ai_response: string;
  intent: string;
  tokens_used: number;
}

const QUICK_SUGGESTIONS = [
  "What should I do this week?",
  "Are there any missed fertilizer applications?",
  "How is my soil health?",
  "When should I water next?",
  "What diseases should I watch for?",
  "Is my crop on track for harvest?",
];

function formatAIText(text: string): string {
  // Convert markdown-like formatting to HTML
  let html = text
    // Bold: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Headers: ### text
    .replace(/^### (.*$)/gm, '<h4 class="font-bold text-green-400 mt-3 mb-1 text-sm">$1</h4>')
    .replace(/^## (.*$)/gm, '<h3 class="font-bold text-green-300 mt-3 mb-1 text-base">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 class="font-bold text-green-300 mt-3 mb-1 text-lg">$1</h2>')
    // Bullet points: - text or • text or * text (at line start)
    .replace(/^[\-\•\*] (.*$)/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
    // Numbered list: 1. text
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-slate-300">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/((<li[^>]*>.*?<\/li>\s*(<br\/>)?)+)/g, '<ul class="my-2 space-y-1">$1</ul>');

  return html;
}

export default function AIChatWindow({ projectId }: { projectId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch conversation list
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["ai-conversations", projectId],
    queryFn: async () => {
      const res = await api.get(`/ai/${projectId}/conversations`);
      return res.data.data;
    },
    staleTime: 30_000,
    enabled: !!projectId,
  });

  // Fetch messages for a conversation
  const loadConversation = useMutation({
    mutationFn: async (convId: string) => {
      const res = await api.get(`/ai/conversations/${convId}/messages`);
      return res.data.data as Message[];
    },
    onSuccess: (data, convId) => {
      setMessages(
        data.map((m: Message) => ({
          ...m,
          role: m.role === "model" ? "model" : "user",
        }))
      );
      setConversationId(convId);
      setShowSidebar(false);
    },
  });

  // Send chat message
  const chatMutation = useMutation<ChatResponse, Error, string>({
    mutationFn: async (message: string) => {
      const res = await api.post(`/ai/${projectId}/chat`, {
        message,
        conversation_id: conversationId,
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      // Set conversation ID for continuity
      if (!conversationId) {
        setConversationId(data.conversation_id);
      }
      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "model",
          content: data.ai_response,
          tokens_used: data.tokens_used,
        },
      ]);
      // Invalidate conversation list so new conversations show up
      queryClient.invalidateQueries({ queryKey: ["ai-conversations", projectId] });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.detail ||
        "Sorry, I couldn't process your question right now. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "model",
          content: `⚠️ ${errorMsg}`,
        },
      ]);
    },
  });

  const handleSend = (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || chatMutation.isPending) return;

    // Add user message immediately
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      },
    ]);
    setInput("");
    chatMutation.mutate(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowSidebar(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] md:h-[650px] gap-3">
      {/* Sidebar — Conversation History */}
      <div
        className={clsx(
          "glass-card border border-white/5 overflow-hidden flex flex-col transition-all duration-300",
          showSidebar
            ? "absolute inset-0 z-50 md:relative md:w-72 md:min-w-[260px]"
            : "hidden md:flex md:w-72 md:min-w-[260px]"
        )}
      >
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            Conversations
          </h3>
          <button
            onClick={startNewConversation}
            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
            title="New conversation"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {conversations && conversations.length > 0 ? (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation.mutate(conv.id)}
                className={clsx(
                  "w-full text-left p-3 rounded-xl text-sm transition-all duration-200 group",
                  conversationId === conv.id
                    ? "bg-green-500/10 border border-green-500/20 text-green-300"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                )}
              >
                <p className="font-medium truncate text-xs leading-relaxed">
                  {conv.session_title}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {new Date(conv.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </button>
            ))
          ) : (
            <div className="text-center py-8 px-4">
              <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No conversations yet.</p>
              <p className="text-xs text-slate-600 mt-1">Ask your first question below!</p>
            </div>
          )}
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setShowSidebar(false)}
          className="md:hidden p-3 text-center text-sm text-slate-400 border-t border-slate-800"
        >
          Close
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card border border-white/5 overflow-hidden relative shadow-2xl bg-slate-950/20">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 blur-[90px] rounded-full -mr-20 -mt-20 pointer-events-none" />

        {/* Mobile sidebar toggle */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-slate-800/60 z-10">
          <button
            onClick={() => setShowSidebar(true)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            History
          </button>
          <button
            onClick={startNewConversation}
            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 z-10 custom-scrollbar">
          {/* Welcome message when empty */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <Sparkles className="w-8 h-8 text-green-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Your AI Farming Advisor
              </h3>
              <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
                Ask me anything about your crop — fertilizer schedules, pest control,
                irrigation timing, soil health, or harvest planning. I have your full
                project data loaded.
              </p>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {QUICK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    disabled={chatMutation.isPending}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:bg-green-500/10 hover:border-green-500/20 hover:text-green-300 transition-all duration-300 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex gap-3 max-w-[88%] animate-fade-in",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {/* Avatar */}
              <div
                className={clsx(
                  "w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border border-white/5",
                  msg.role === "model"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-slate-800 text-slate-400"
                )}
              >
                {msg.role === "model" ? (
                  <Bot className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* Message Content */}
              <div
                className={clsx(
                  "p-4 rounded-[20px] text-sm leading-relaxed shadow-md transition-all duration-300",
                  msg.role === "model"
                    ? "bg-slate-900/60 text-slate-200 border border-slate-800/80 rounded-tl-none"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_4px_15px_rgba(34,197,94,0.25)] rounded-tr-none"
                )}
              >
                {msg.role === "model" ? (
                  <div
                    className="ai-response-content prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatAIText(msg.content) }}
                  />
                ) : (
                  msg.content
                )}
                {msg.role === "model" && msg.tokens_used && msg.tokens_used > 0 && (
                  <p className="text-[10px] text-slate-500 mt-2 text-right">
                    {msg.tokens_used} tokens
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {chatMutation.isPending && (
            <div className="flex gap-3 mr-auto animate-fade-in">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 bg-green-500/10 border border-white/5 text-green-400">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-[20px] rounded-tl-none bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-green-400/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-green-400/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-green-400/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-400 ml-1">Analyzing your farm data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/40 backdrop-blur-xl z-10">
          {/* Quick suggestions after first message */}
          {messages.length > 0 && messages.length <= 2 && !chatMutation.isPending && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar">
              {QUICK_SUGGESTIONS.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="shrink-0 px-3 py-1.5 text-[11px] rounded-full bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:bg-green-500/10 hover:text-green-300 hover:border-green-500/20 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your farm..."
              disabled={chatMutation.isPending}
              className="w-full bg-slate-900/80 border border-slate-800 text-white rounded-full py-3.5 pl-5 pr-14 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all placeholder:text-slate-500 text-sm disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="absolute right-1.5 p-2.5 bg-green-500 hover:bg-green-400 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-full transition-all duration-300 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.3)] disabled:shadow-none"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white ml-0.5" />
              )}
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-600 mt-2.5 font-medium uppercase tracking-wider">
            Powered by Google Gemini · Your project data is sent with each question
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useChatStore } from "@/lib/stores/chatStore";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import MessageInput from "@/components/chat/MessageInput";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  const connect = useChatStore((state) => state.connect);
  const disconnect = useChatStore((state) => state.disconnect);
  const isConnected = useChatStore((state) => state.isConnected);

  useEffect(() => {
    if (token && user) {
      connect(token);
    }
    return () => {
      disconnect();
    };
  }, [token, user, connect, disconnect]);

  if (!user || !token) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span>Loading chat profile…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] pb-20 md:pb-6">
      <div className="glass-card rounded-3xl overflow-hidden flex h-full border border-border shadow-2xl">
        {/* Left Sidebar */}
        <ChatSidebar />

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface-primary/40 relative">
          {!isConnected && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-xs py-1.5 px-4 text-center font-medium animate-pulse">
              Connecting to real-time chat server…
            </div>
          )}
          <ChatWindow />
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

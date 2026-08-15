"use client";

import React, { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useChatStore } from "@/lib/stores/chatStore";
import chatApi from "@/lib/chatApi";
import { User, MessageSquare, FileText, Download, CheckCheck, Check } from "lucide-react";

export default function ChatWindow() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const messagesMap = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const markAsRead = useChatStore((state) => state.markAsRead);

  const authUser = useAuthStore((state) => state.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedConversationsRef = useRef<Set<string>>(new Set());

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const messages = activeConversationId ? messagesMap[activeConversationId] || [] : [];

  // Fetch message history when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    if (!loadedConversationsRef.current.has(activeConversationId)) {
      loadedConversationsRef.current.add(activeConversationId);
      chatApi
        .get(`/conversations/${activeConversationId}/messages?limit=50`)
        .then((res) => {
          const chronological = (res.data.data || []).reverse();
          setMessages(activeConversationId, chronological);
        })
        .catch((e) => {
          console.error("Failed to load history", e);
          loadedConversationsRef.current.delete(activeConversationId);
        });
    }
  }, [activeConversationId, setMessages]);

  // Auto-scroll and mark read
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    if (activeConversationId && activeConv?.unread_count && activeConv.unread_count > 0) {
      const unreadIds = messages
        .filter((m) => !m.is_read && m.sender_id !== authUser?.id)
        .map((m) => m.id);

      if (unreadIds.length > 0) {
        markAsRead(activeConversationId, unreadIds);
      }
    }
  }, [messages, activeConversationId, activeConv?.unread_count, markAsRead, authUser?.id]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-surface-primary/20">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary glow-green-sm">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Your P2P Chat Room</h3>
        <p className="text-text-muted text-sm max-w-sm">
          Search for a user in the left panel to start a conversation or select an existing chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-primary/30">
      {/* Room Header */}
      <div className="h-16 border-b border-border bg-surface-secondary/70 backdrop-blur-xl flex items-center px-6 shrink-0 z-10">
        <div className="relative mr-3">
          <div className="w-10 h-10 rounded-full bg-surface-tertiary border border-border flex items-center justify-center text-text-secondary overflow-hidden">
            {activeConv?.other_user.avatar_url ? (
              <img
                src={activeConv.other_user.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-sm text-primary">
                {activeConv?.other_user.display_name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {activeConv?.other_user.is_online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border-2 border-surface-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          )}
        </div>

        <div>
          <h2 className="font-bold text-slate-900 dark:text-white text-sm">
            {activeConv?.other_user.display_name}
          </h2>
          <p className="text-[11px] text-text-muted">
            {activeConv?.other_user.is_online ? (
              <span className="text-primary font-medium">Online</span>
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.sender_id !== activeConv?.other_user.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-[80%] md:max-w-[65%] ${
                  isMine ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl relative shadow-md ${
                    isMine
                      ? "bg-primary text-white rounded-tr-xs glow-green-sm"
                      : "bg-surface-secondary border border-border text-white rounded-tl-xs"
                  }`}
                >
                  {/* Text */}
                  {msg.message_type === "text" && msg.content && (
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </p>
                  )}

                  {/* Image */}
                  {(msg.message_type === "image" || msg.image_url) && (
                    <div className="space-y-2">
                      <div className="rounded-xl overflow-hidden max-w-xs border border-white/10">
                        <img
                          src={msg.image_url || msg.voice_url}
                          alt="Shared file"
                          className="w-full h-auto object-cover max-h-60"
                        />
                      </div>
                      {msg.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voice */}
                  {msg.message_type === "voice" && msg.voice_url && (
                    <div className="flex items-center gap-2 py-1">
                      <audio
                        controls
                        src={msg.voice_url}
                        className="h-8 max-w-[200px]"
                      />
                    </div>
                  )}

                  {/* Document / File */}
                  {msg.message_type === "file" && msg.voice_url && (
                    <a
                      href={msg.voice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                        isMine
                          ? "bg-white/10 border-white/20 hover:bg-white/20 text-white"
                          : "bg-surface-tertiary border-border hover:border-primary/50 text-white"
                      }`}
                    >
                      <FileText className="w-6 h-6 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">
                          {msg.content || "Attached Document"}
                        </p>
                        <p className="text-[10px] opacity-75">Click to download / view</p>
                      </div>
                      <Download className="w-4 h-4 shrink-0" />
                    </a>
                  )}

                  {/* Timestamp & Read Receipts */}
                  <div
                    className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                      isMine ? "text-white/80" : "text-text-muted"
                    }`}
                  >
                    <span>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMine && (
                      <span>
                        {msg.is_read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

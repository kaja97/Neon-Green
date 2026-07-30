"use client";

import React, { useEffect, useState } from "react";
import { Search, User, MessageCircle, Loader2, Sparkles } from "lucide-react";
import chatApi from "@/lib/chatApi";
import { useChatStore, Conversation, ChatUser } from "@/lib/stores/chatStore";

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);

  // Load inbox on mount
  useEffect(() => {
    async function loadInbox() {
      try {
        await chatApi.get("/users/me");
        const res = await chatApi.get("/conversations");
        setConversations(res.data.data.conversations || []);
      } catch (e) {
        console.error("Failed to load inbox", e);
      }
    }
    loadInbox();
  }, [setConversations]);

  // Handle Search Debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await chatApi.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.data.users || []);
      } catch (e) {
        console.error("Failed to search users", e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const startConversation = async (targetUser: ChatUser) => {
    try {
      const res = await chatApi.post("/conversations", {
        target_account_id: targetUser.account_id,
      });
      const conv = res.data.data as Conversation;

      if (!conversations.find((c) => c.id === conv.id)) {
        setConversations([conv, ...conversations]);
      }
      setActiveConversation(conv.id);
      setSearchQuery("");
    } catch (e) {
      console.error("Failed to start conversation", e);
    }
  };

  return (
    <div className="w-80 md:w-80 border-r border-border bg-surface-secondary/70 backdrop-blur-xl flex flex-col h-full shrink-0">
      {/* Header & Search */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Messages
          </h2>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search person to chat..."
            className="w-full h-10 pl-10 pr-4 bg-surface-tertiary border border-border rounded-xl text-white placeholder:text-text-muted text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-10 text-text-muted text-xs">
            <Loader2 className="w-5 h-5 text-primary animate-spin mb-2" />
            Searching users…
          </div>
        ) : searchQuery.length >= 2 ? (
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-text-muted px-3 py-1.5">
              Search Results
            </h3>
            {searchResults.length === 0 ? (
              <p className="text-xs text-text-muted px-3 py-3 text-center">
                No matching users found.
              </p>
            ) : (
              searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => startConversation(u)}
                  className="w-full flex items-center p-2.5 rounded-xl hover:bg-surface-tertiary/70 transition-colors text-left group"
                >
                  <div className="relative w-10 h-10 rounded-full bg-surface-tertiary border border-primary/30 flex items-center justify-center text-primary shrink-0 mr-3 overflow-hidden">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                      {u.display_name}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {u.is_online ? (
                        <span className="text-primary font-medium">Online</span>
                      ) : (
                        "Offline"
                      )}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div>
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted space-y-2">
                <Sparkles className="w-8 h-8 text-primary/40 mx-auto" />
                <p className="font-semibold text-white">No active chats</p>
                <p>Search for a farmer, vendor, or buyer above to start chatting!</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv.id)}
                    className={`w-full flex items-center p-3 rounded-xl transition-all text-left ${
                      isActive
                        ? "bg-primary/10 border border-primary/30 text-white"
                        : "hover:bg-surface-tertiary/50 text-text-secondary"
                    }`}
                  >
                    <div className="relative shrink-0 mr-3">
                      <div className="w-11 h-11 rounded-full bg-surface-tertiary border border-border flex items-center justify-center text-text-secondary overflow-hidden">
                        {conv.other_user.avatar_url ? (
                          <img
                            src={conv.other_user.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-sm text-primary">
                            {conv.other_user.display_name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {conv.other_user.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary border-2 border-surface-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm font-bold text-white truncate">
                          {conv.other_user.display_name}
                        </p>
                        {conv.last_message && (
                          <span className="text-[10px] text-text-muted ml-2 shrink-0">
                            {new Date(conv.last_message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <p
                          className={`text-xs truncate ${
                            conv.unread_count > 0
                              ? "font-semibold text-white"
                              : "text-text-muted"
                          }`}
                        >
                          {conv.last_message ? (
                            conv.last_message.message_type === "text"
                              ? conv.last_message.content
                              : conv.last_message.message_type === "image"
                              ? "📷 Photo"
                              : conv.last_message.message_type === "file"
                              ? "📄 File"
                              : "🎵 Voice message"
                          ) : (
                            "No messages yet"
                          )}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

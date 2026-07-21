'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useChatStore } from '@/lib/stores/chatStore';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageInput from '@/components/chat/MessageInput';

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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 mt-4 mx-4">
      {/* Left Sidebar */}
      <ChatSidebar />

      {/* Right Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isConnected && (
          <div className="bg-yellow-50 text-yellow-800 text-xs py-1 px-4 text-center">
            Connecting to chat server...
          </div>
        )}
        <ChatWindow />
        <MessageInput />
      </div>
    </div>
  );
}

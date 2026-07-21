import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useChatStore } from '@/lib/stores/chatStore';
import chatApi from '@/lib/chatApi';

export default function ChatWindow() {
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const messagesMap = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const markAsRead = useChatStore((state) => state.markAsRead);
  
  const authUser = useAuthStore((state) => state.user); // Contains id, email, etc.
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversationId ? (messagesMap[activeConversationId] || []) : [];

  // Fetch history when active conv changes
  useEffect(() => {
    if (!activeConversationId) return;
    
    // Only fetch if we don't have messages yet (could be optimized with proper pagination)
    if (!messagesMap[activeConversationId] || messagesMap[activeConversationId].length === 0) {
      chatApi.get(`/conversations/${activeConversationId}/messages?limit=50`)
        .then(res => {
          // Reverse because API returns newest first (descending), we want chronological for UI
          const chronological = (res.data.data || []).reverse();
          setMessages(activeConversationId, chronological);
        })
        .catch(e => console.error("Failed to load history", e));
    }
  }, [activeConversationId, messagesMap, setMessages]);

  // Scroll to bottom and mark read on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Mark read
    if (activeConversationId && activeConv?.unread_count && activeConv.unread_count > 0) {
      const unreadIds = messages
        .filter(m => !m.is_read && m.sender_id !== authUser?.id)
        .map(m => m.id);
        
      if (unreadIds.length > 0) {
        markAsRead(activeConversationId, unreadIds);
      }
    }
  }, [messages, activeConversationId, activeConv?.unread_count, markAsRead, authUser?.id]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900">Your Messages</h3>
          <p className="text-slate-500 mt-1">Select a chat or start a new conversation.</p>
        </div>
      </div>
    );
  }

  // To map sender_id correctly, the chat backend uses chat_users.id. 
  // However, the frontend auth user has account.id.
  // The Chat backend resolves everything using account_id, but the sender_id in messages is chat_user.id.
  // We can easily know if a message is ours by checking if sender_id !== activeConv.other_user.id
  
  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center px-6 shadow-sm z-10 shrink-0">
        <div className="w-10 h-10 rounded-full bg-slate-100 mr-3 flex items-center justify-center overflow-hidden">
          {activeConv?.other_user.avatar_url ? (
            <img src={activeConv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-slate-500 font-medium">
              {activeConv?.other_user.display_name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{activeConv?.other_user.display_name}</h2>
          <p className="text-xs text-slate-500">
            {activeConv?.other_user.is_online ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
              </span>
            ) : 'Offline'}
          </p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isMine = msg.sender_id !== activeConv?.other_user.id;
          
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Message Bubble */}
                <div 
                  className={`
                    px-4 py-2.5 rounded-2xl relative
                    ${isMine 
                      ? 'bg-emerald-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-sm'
                    }
                  `}
                >
                  {/* Content */}
                  {msg.message_type === 'text' && (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  
                  {msg.message_type === 'voice' && msg.voice_url && (
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${isMine ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <audio controls src={msg.voice_url} className="h-8 w-48" />
                    </div>
                  )}

                  {/* Status/Time Footer */}
                  <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMine ? 'text-emerald-100' : 'text-slate-400'}`}>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isMine && (
                      <span>
                        {msg.is_read ? (
                          <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                  
                  {/* Local preview indicator */}
                  {msg.is_local_preview && (
                     <div className="absolute -top-3 -right-2 bg-yellow-400 text-yellow-900 text-[9px] px-1.5 rounded-full font-bold">
                       Sending...
                     </div>
                  )}
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

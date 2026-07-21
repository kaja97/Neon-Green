import React, { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '../ui/input';
import chatApi from '@/lib/chatApi';
import { useChatStore, Conversation, ChatUser } from '@/lib/stores/chatStore';

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
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
        // Sync profile just in case it's the first time
        await chatApi.get('/users/me');
        const res = await chatApi.get('/conversations');
        setConversations(res.data.data.conversations || []);
      } catch (e) {
        console.error("Failed to load inbox", e);
      }
    }
    loadInbox();
  }, [setConversations]);

  // Handle Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await chatApi.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data.data.users || []);
      } catch (e) {
        console.error("Failed to search users", e);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const startConversation = async (user: ChatUser) => {
    try {
      const res = await chatApi.post('/conversations', {
        target_account_id: user.account_id
      });
      const conv = res.data.data as Conversation;
      
      // If it doesn't exist in our list, add it
      if (!conversations.find(c => c.id === conv.id)) {
        setConversations([conv, ...conversations]);
      }
      setActiveConversation(conv.id);
      setSearchQuery('');
    } catch (e) {
      console.error("Failed to start conversation", e);
    }
  };

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold mb-3">Chats</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input 
            placeholder="Search users..." 
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isSearching || searchQuery.length >= 2 ? (
          <div className="p-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Search Results</h3>
            {searchResults.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 py-2">No users found.</p>
            ) : (
              searchResults.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center p-2 hover:bg-slate-50 cursor-pointer rounded-md mx-1 mb-1 transition-colors"
                  onClick={() => startConversation(user)}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3 shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.display_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.is_online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-2">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No chats yet. Search for a user to start chatting!
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.id} 
                  className={`flex items-center p-3 cursor-pointer rounded-lg mx-1 mb-1 transition-colors ${
                    activeConversationId === conv.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setActiveConversation(conv.id)}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mr-3">
                      {conv.other_user.avatar_url ? (
                        <img src={conv.other_user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    {conv.other_user.is_online && (
                      <span className="absolute bottom-0 right-3 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className="text-sm font-semibold text-slate-900 truncate">{conv.other_user.display_name}</p>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-500 ml-2 shrink-0">
                          {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                        {conv.last_message ? (
                          conv.last_message.message_type === 'text' ? conv.last_message.content : `🎵 Voice message`
                        ) : 'No messages yet'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

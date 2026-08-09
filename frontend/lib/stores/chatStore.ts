import { create } from 'zustand';
import { getChatWsUrl } from '../chatApi';

export interface ChatUser {
  id: string;
  account_id: string;
  display_name: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  message_type: 'text' | 'voice' | 'image' | 'file';
  content?: string;
  voice_url?: string;
  voice_duration?: number;
  image_url?: string;
  is_read: boolean;
  created_at: string;
  is_local_preview?: boolean; // For local files pending upload
}

export interface Conversation {
  id: string;
  other_user: ChatUser;
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

interface ChatState {
  ws: WebSocket | null;
  isConnected: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>; // conversation_id -> messages
  
  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (message: Message) => void;
  sendMessage: (conversationId: string, type: string, data: any) => void;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  ws: null,
  isConnected: false,
  conversations: [],
  activeConversationId: null,
  messages: {},

  connect: (token: string) => {
    if (get().ws) return;

    const wsUrl = `${getChatWsUrl()}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      set({ isConnected: true });
    };

    ws.onclose = () => {
      set({ isConnected: false, ws: null });
      // Reconnect logic could be added here
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, conversation_id, data } = payload;

        if (type === 'message') {
          // data is MessageResponse
          get().addMessage(data);
          
          // Update conversation list last message and unread count
          set((state) => {
            const convs = [...state.conversations];
            const idx = convs.findIndex(c => c.id === conversation_id);
            if (idx >= 0) {
              convs[idx] = { 
                ...convs[idx], 
                last_message: data,
                updated_at: data.created_at,
                // Increment unread if it's not the active conversation and not sent by me
                unread_count: (state.activeConversationId !== conversation_id) ? convs[idx].unread_count + 1 : convs[idx].unread_count
              };
              // Sort to top
              const [updated] = convs.splice(idx, 1);
              convs.unshift(updated);
            }
            return { conversations: convs };
          });
        } else if (type === 'read') {
          // Mark messages as read in the store
          const { message_ids } = data;
          if (conversation_id && get().messages[conversation_id]) {
            set((state) => {
              const msgs = [...state.messages[conversation_id]];
              for (const msg of msgs) {
                if (message_ids.includes(msg.id)) {
                  msg.is_read = true;
                }
              }
              return { messages: { ...state.messages, [conversation_id]: msgs } };
            });
          }
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    set({ ws });
  },

  disconnect: () => {
    const ws = get().ws;
    if (ws) {
      ws.close();
    }
    set({ ws: null, isConnected: false });
  },

  setConversations: (conversations) => set({ conversations }),
  
  setActiveConversation: (id) => set({ activeConversationId: id }),

  setMessages: (conversationId, messages) => 
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages }
    })),

  addMessage: (message) => 
    set((state) => {
      const msgs = state.messages[message.conversation_id] || [];
      // Prevent duplicates
      if (msgs.find(m => m.id === message.id)) return state;
      
      // Keep sorted by created_at (assuming new messages go to the end)
      return {
        messages: {
          ...state.messages,
          [message.conversation_id]: [...msgs, message].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }
      };
    }),

  sendMessage: (conversationId, type, data) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message',
        conversation_id: conversationId,
        data: {
          message_type: type,
          ...data
        }
      }));
    }
  },

  markAsRead: (conversationId, messageIds) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'read',
        conversation_id: conversationId,
        data: { message_ids: messageIds }
      }));
      
      // Optimistically update local state
      set((state) => {
        // Clear unread count on conversation
        const convs = state.conversations.map(c => 
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        );
        return { conversations: convs };
      });
    }
  }
}));

import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useChatStore } from '@/lib/stores/chatStore';
import chatApi, { getChatBaseUrl } from '@/lib/chatApi';

export default function MessageInput() {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const sendMessage = useChatStore((state) => state.sendMessage);

  if (!activeConversationId) return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;

    // Send via WebSocket
    sendMessage(activeConversationId, 'text', { content: text.trim() });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // We accept audio files for now since voice_url is implemented
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert('Only audio/video files are supported as voice messages currently.');
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);

      // Upload to standalone chat service
      const res = await chatApi.post('/voice/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { voice_url, duration } = res.data.data;

      // Construct absolute URL if it returns relative (e.g. /static/...)
      let absoluteUrl = voice_url;
      if (voice_url.startsWith('/')) {
        // Strip /api/v1/chat to get base host:8001
        const baseUrl = getChatBaseUrl().replace('/api/v1/chat', '');
        absoluteUrl = `${baseUrl}${voice_url}`;
      }

      // Send WS message
      sendMessage(activeConversationId, 'voice', { 
        voice_url: absoluteUrl,
        voice_duration: duration 
      });

    } catch (err: any) {
      console.error("Upload failed", err);
      alert(err.response?.data?.detail || 'Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4 shrink-0">
      <form onSubmit={handleSend} className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors shrink-0 disabled:opacity-50"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="audio/*,video/*"
          onChange={handleFileSelect}
        />

        {/* Text Input */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 flex items-center shadow-inner">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400"
            disabled={isUploading}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || isUploading}
          className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shrink-0 disabled:opacity-50 disabled:bg-slate-300 shadow-md"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

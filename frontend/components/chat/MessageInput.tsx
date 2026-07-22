"use client";

import React, { useState, useRef } from "react";
import { Send, Paperclip, Loader2, Image as ImageIcon, FileText, X } from "lucide-react";
import { useChatStore } from "@/lib/stores/chatStore";
import chatApi, { getChatBaseUrl } from "@/lib/chatApi";

export default function MessageInput() {
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    url: string;
    type: "image" | "voice" | "file";
    name: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const sendMessage = useChatStore((state) => state.sendMessage);

  if (!activeConversationId) return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() && !attachedFile) return;

    let msgType: "text" | "voice" | "image" | "file" = "text";
    let payload: any = { content: text.trim() };

    if (attachedFile) {
      msgType = attachedFile.type;
      if (attachedFile.type === "image") {
        payload.image_url = attachedFile.url;
      } else {
        payload.voice_url = attachedFile.url;
      }
      if (!payload.content) {
        payload.content = attachedFile.name;
      }
    }

    // Send via WebSocket
    sendMessage(activeConversationId, msgType, payload);

    setText("");
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      // Upload to chat service
      const res = await chatApi.post("/voice/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { voice_url } = res.data.data;

      // Construct absolute URL if relative
      let absoluteUrl = voice_url;
      if (voice_url.startsWith("/")) {
        const baseUrl = getChatBaseUrl().replace("/api/v1/chat", "");
        absoluteUrl = `${baseUrl}${voice_url}`;
      }

      let detectedType: "image" | "voice" | "file" = "file";
      if (file.type.startsWith("image/")) {
        detectedType = "image";
      } else if (file.type.startsWith("audio/")) {
        detectedType = "voice";
      }

      setAttachedFile({
        url: absoluteUrl,
        type: detectedType,
        name: file.name,
      });
    } catch (err: any) {
      console.error("Upload failed", err);
      alert(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-surface-secondary/80 backdrop-blur-xl border-t border-border p-3 md:p-4 shrink-0 space-y-2">
      {/* File Attachment Preview Banner */}
      {attachedFile && (
        <div className="flex items-center justify-between px-3 py-2 bg-surface-tertiary border border-border rounded-xl text-xs text-white animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            {attachedFile.type === "image" ? (
              <ImageIcon className="w-4 h-4 text-primary shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-primary shrink-0" />
            )}
            <span className="truncate font-medium">{attachedFile.name}</span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedFile(null)}
            className="p-1 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-center gap-2">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 text-text-muted hover:text-primary hover:bg-surface-tertiary rounded-xl transition-all shrink-0 disabled:opacity-50"
          title="Attach photo, audio, or document"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,audio/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFileSelect}
        />

        {/* Text Input */}
        <div className="flex-1 bg-surface-tertiary border border-border rounded-xl px-4 py-2 flex items-center transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none text-white text-sm placeholder:text-text-muted focus:outline-none"
            disabled={isUploading}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !attachedFile) || isUploading}
          className="p-2.5 btn-primary rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useCreateComment } from "@/lib/hooks/useCommunity";

interface CommentComposerProps {
  issueId: string;
  parentId?: string | null;
  onDone?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CommentComposer({
  issueId,
  parentId,
  onDone,
  placeholder = "Write a comment…",
  autoFocus = false,
}: CommentComposerProps) {
  const [body, setBody] = useState("");
  const { mutate: createComment, isPending } = useCreateComment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    createComment(
      { issueId, body: trimmed, parentId },
      {
        onSuccess: () => {
          setBody("");
          onDone?.();
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 glass-card p-3 rounded-2xl"
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={1}
        className="flex-1 min-h-[40px] max-h-32 resize-none bg-surface-tertiary text-white text-sm placeholder-text-muted rounded-xl px-3 py-2.5 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        disabled={isPending || !body.trim()}
        className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}

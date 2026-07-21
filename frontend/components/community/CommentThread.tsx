"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CornerDownRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AuthorAvatar from "./AuthorAvatar";
import CommentComposer from "./CommentComposer";
import type { CommunityComment } from "@/lib/types";

interface CommentNodeProps {
  comment: CommunityComment;
  issueId: string;
  depth?: number;
}

function CommentNode({ comment, issueId, depth = 0 }: CommentNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const timeAgo = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : "";

  // Indent up to depth 4, then stay flat (Reddit/HN style)
  const indent = Math.min(depth, 4);

  return (
    <div
      style={{ marginLeft: indent > 0 ? `${indent * 24}px` : undefined }}
      className={depth > 0 ? "border-l border-border pl-3" : ""}
    >
      {/* Comment header */}
      <div className="flex items-start gap-2 py-2.5">
        <AuthorAvatar
          name={comment.author?.full_name}
          avatarUrl={comment.author?.avatar_url}
          size="sm"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">
              {comment.author?.full_name || "Unknown"}
            </span>
            <span className="text-[10px] text-text-muted">{timeAgo}</span>
          </div>

          {/* Body */}
          <p className="text-sm text-text-secondary mt-1 whitespace-pre-wrap break-words">
            {comment.body}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => setShowReply((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-primary transition-colors"
            >
              <CornerDownRight className="w-3 h-3" />
              Reply
            </button>

            {hasReplies && (
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-white transition-colors"
              >
                {collapsed ? (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Show {comment.replies.length} repl
                    {comment.replies.length === 1 ? "y" : "ies"}
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Hide
                  </>
                )}
              </button>
            )}
          </div>

          {/* Inline reply composer */}
          {showReply && (
            <div className="mt-2">
              <CommentComposer
                issueId={issueId}
                parentId={comment.id}
                placeholder={`Reply to ${comment.author?.full_name || "comment"}…`}
                autoFocus
                onDone={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {hasReplies && !collapsed && (
        <div>
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              issueId={issueId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Public component ── */

interface CommentThreadProps {
  comments: CommunityComment[];
  issueId: string;
}

export default function CommentThread({
  comments,
  issueId,
}: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return (
      <p className="text-sm text-text-muted py-6 text-center">
        No comments yet. Be the first to share your thoughts!
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {comments.map((c) => (
        <CommentNode key={c.id} comment={c} issueId={issueId} depth={0} />
      ))}
    </div>
  );
}

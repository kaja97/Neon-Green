"use client";


import Link from "next/link";
import { ArrowLeft, Loader2, Frown, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  useCommunityIssue,
  useCommunityComments,
} from "@/lib/hooks/useCommunity";
import { getImageUrl } from "@/lib/utils/image";
import AuthorAvatar from "@/components/community/AuthorAvatar";
import CommentThread from "@/components/community/CommentThread";
import CommentComposer from "@/components/community/CommentComposer";

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TYPE_COLORS: Record<string, string> = {
  disease: "bg-red-500/10 text-red-400 border-red-500/20",
  pest: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  nutrient_deficiency: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  other: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function formatType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function CommunityIssuePage({
  params,
}: {
  params: { issueId: string };
}) {
  const { issueId } = params;
  const { data: issue, isLoading, error } = useCommunityIssue(issueId);
  const { data: comments, isLoading: commentsLoading } =
    useCommunityComments(issueId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-text-muted text-sm mt-3">Loading discussion…</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto pb-24">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <Frown className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-text-secondary text-sm">
            Issue not found or no longer shared.
          </p>
        </div>
      </div>
    );
  }

  const timeAgo = issue.created_at
    ? formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })
    : issue.reported_date || "";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <header className="animate-fade-in">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Community
        </Link>

        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
          {issue.title}
        </h1>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              TYPE_COLORS[issue.issue_type] || TYPE_COLORS.other
            }`}
          >
            {formatType(issue.issue_type)}
          </span>
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.medium
            }`}
          >
            {issue.severity}
          </span>
          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              issue.status === "resolved"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-surface-tertiary text-text-muted border-border"
            }`}
          >
            {issue.status}
          </span>
        </div>

        {/* Author row */}
        <div className="flex items-center gap-2.5 mt-3">
          <AuthorAvatar
            name={issue.author_name}
            avatarUrl={issue.author_avatar_url}
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {issue.author_name || "Unknown farmer"}
            </p>
            <p className="text-[11px] text-text-muted">{timeAgo}</p>
          </div>
        </div>
      </header>

      {/* Issue body */}
      <section className="glass-card p-5 rounded-2xl space-y-4 animate-slide-up">
        {issue.description && (
          <p className="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">
            {issue.description}
          </p>
        )}

        {/* Image gallery */}
        {issue.images && issue.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {issue.images.map((img: string, i: number) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden bg-surface-tertiary"
              >
                <img
                  src={getImageUrl(img)}
                  alt={`Issue image ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}

        {issue.ai_diagnosis && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-semibold text-primary mb-1">
              AI Diagnosis
            </p>
            <p className="text-sm text-text-secondary">{issue.ai_diagnosis}</p>
          </div>
        )}
      </section>

      {/* Comments section */}
      <section className="space-y-4 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-white">
            Discussion
            {issue.comment_count > 0 && (
              <span className="text-text-muted font-normal text-sm ml-2">
                ({issue.comment_count})
              </span>
            )}
          </h2>
        </div>

        {commentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        ) : (
          <CommentThread comments={comments || []} issueId={issueId} />
        )}

        {/* Top-level comment composer */}
        <CommentComposer issueId={issueId} placeholder="Add to the discussion…" />
      </section>
    </div>
  );
}

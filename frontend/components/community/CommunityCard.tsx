"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import AuthorAvatar from "./AuthorAvatar";
import { getImageUrl } from "@/lib/utils/image";
import type { CommunityFeedItem } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  disease: "bg-red-500/10 text-red-400 border-red-500/20",
  pest: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  nutrient_deficiency: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  other: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-500/10 text-green-400 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CommunityCardProps {
  item: CommunityFeedItem;
  index?: number;
}

export default function CommunityCard({ item, index = 0 }: CommunityCardProps) {
  const timeAgo = item.created_at
    ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
    : "";

  return (
    <Link
      href={`/community/${item.id}`}
      className="block glass-card p-4 rounded-2xl hover:bg-surface-secondary/60 transition-all duration-300 group animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex gap-3">
        {/* Thumbnail */}
        {item.images && item.images.length > 0 && (
          <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-surface-tertiary">
            <img
              src={getImageUrl(item.images[0])}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                TYPE_COLORS[item.issue_type] || TYPE_COLORS.other
              }`}
            >
              {formatType(item.issue_type)}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.medium
              }`}
            >
              {item.severity}
            </span>
            {item.plant_name && (
              <span className="text-[10px] text-text-muted">
                · {item.plant_name}
              </span>
            )}
          </div>

          {/* Author + comment count */}
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              <AuthorAvatar
                name={item.author_name}
                avatarUrl={item.author_avatar_url}
                size="sm"
              />
              <span className="text-xs text-text-muted truncate max-w-[120px]">
                {item.author_name}
              </span>
              <span className="text-[10px] text-text-muted">{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1 text-text-muted">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">
                {item.comment_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

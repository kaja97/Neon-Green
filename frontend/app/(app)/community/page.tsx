"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MessagesSquare, Frown } from "lucide-react";
import { clsx } from "clsx";
import { useCommunityFeed } from "@/lib/hooks/useCommunity";
import CommunityCard from "@/components/community/CommunityCard";

type IssueFilter = "all" | "disease" | "pest" | "nutrient_deficiency" | "other";

const TABS: { value: IssueFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "disease", label: "Disease" },
  { value: "pest", label: "Pest" },
  { value: "nutrient_deficiency", label: "Nutrient" },
  { value: "other", label: "Other" },
];

export default function CommunityPage() {
  const [filter, setFilter] = useState<IssueFilter>("all");

  const { data: items, isLoading, error } = useCommunityFeed(
    filter === "all" ? null : filter
  );

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href="/dashboard"
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Community<span className="text-green-400 text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            Shared issues &amp; discussions
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex space-x-1 glass-card p-1.5 rounded-2xl animate-slide-up">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={clsx(
              "flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all",
              filter === tab.value
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-text-muted hover:text-white hover:bg-surface-tertiary/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-text-muted text-sm mt-3">Loading community…</p>
        </div>
      ) : error ? (
        <div className="glass-card p-8 rounded-2xl text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <Frown className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-text-secondary text-sm">
            Failed to load community feed. Please try again later.
          </p>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="glass-card p-8 rounded-2xl text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <MessagesSquare className="w-6 h-6 text-primary" />
          </div>
          <p className="text-white font-semibold">No discussions yet</p>
          <p className="text-text-muted text-sm mt-1">
            When farmers share their issues, they&apos;ll appear here for community advice.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <CommunityCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

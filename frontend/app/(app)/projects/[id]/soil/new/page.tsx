"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FlaskConical } from "lucide-react";
import SoilTestForm from "@/components/forms/SoilTestForm";

export default function NewSoilTestPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <header className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${params.id}/soil`}
            className="p-2.5 glass-card-hover rounded-2xl text-text-secondary hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Log Soil Diagnostic</span>
              <span className="text-amber-400">.</span>
            </h1>
            <p className="text-text-muted text-xs md:text-sm mt-0.5">
              Upload laboratory report file or enter chemical metrics to generate AI agronomic recommendations
            </p>
          </div>
        </div>
      </header>

      {/* Form Container */}
      <div className="glass-card rounded-3xl p-6 md:p-8 animate-slide-up border border-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        <SoilTestForm
          projectId={params.id}
          onSuccess={() => {
            router.push(`/projects/${params.id}/soil`);
          }}
          onCancel={() => {
            router.push(`/projects/${params.id}/soil`);
          }}
        />
      </div>
    </div>
  );
}

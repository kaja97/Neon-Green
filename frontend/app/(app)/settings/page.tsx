"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /settings redirects to /profile where all account + farm settings live.
 * This redirect exists because some UI links reference /settings.
 */
export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

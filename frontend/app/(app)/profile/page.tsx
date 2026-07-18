"use client";

import { ArrowLeft, Settings, User, Map, Globe, Bell, ChevronRight, LogOut, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useUIStore } from "@/lib/stores/uiStore";
import { useState } from "react";
import { clsx } from "clsx";

import ProfileSection from "@/components/settings/ProfileSection";
import LocationSection from "@/components/settings/LocationSection";
import LandSection from "@/components/settings/LandSection";
import LivestockSection from "@/components/settings/LivestockSection";

export default function SettingsPage() {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "farm" | "preferences">("profile");

  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const { t, language, setLanguage } = useTranslation();
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const handleTogglePush = async () => {
    if (!isSupported) {
      alert("Push notifications are not supported in this browser.");
      return;
    }
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const success = await subscribe();
      if (!success) {
        alert("Permission to send notifications was denied or failed to subscribe.");
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center gap-4 animate-fade-in">
        <Link
          href="/dashboard"
          className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-text-primary transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Account Hub<span className="text-green-400 text-glow-green">.</span>
          </h1>
          <p className="text-text-muted font-medium mt-1">Manage your profile, farm data, and settings.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 glass-card p-1.5 rounded-2xl w-full max-w-md animate-slide-up">
        {[
          { key: "profile" as const, label: "Profile", icon: User },
          { key: "farm" as const, label: "Farm Data", icon: Map },
          { key: "preferences" as const, label: "Preferences", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all",
                activeTab === tab.key
                  ? "bg-green-500/15 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-8">
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in">
            <ProfileSection />
          </div>
        )}

        {activeTab === "farm" && (
          <div className="space-y-6 animate-fade-in">
            <LocationSection />
            <LandSection />
            <LivestockSection />
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-xl font-bold text-text-primary mb-6">App Preferences</h2>

              {/* Appearance */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    {theme === "dark" ? <Moon className="w-6 h-6 text-indigo-400" /> : <Sun className="w-6 h-6 text-amber-400" />}
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-lg">Appearance</p>
                    <p className="text-sm text-text-muted">Switch between dark and light theme</p>
                  </div>
                </div>
                <div className="flex items-center bg-surface-tertiary p-1.5 rounded-2xl">
                  {[
                    { code: "dark" as const, label: "Dark", icon: Moon },
                    { code: "light" as const, label: "Light", icon: Sun },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.code}
                        onClick={() => setTheme(opt.code)}
                        className={clsx(
                          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                          theme === opt.code
                            ? "bg-surface-elevated shadow-sm text-text-primary"
                            : "text-text-muted hover:text-text-secondary"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-500/10 rounded-2xl">
                    <Globe className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-lg">{t.settings.language}</p>
                    <p className="text-sm text-text-muted">{t.settings.language_desc}</p>
                  </div>
                </div>
                <div className="flex items-center bg-surface-tertiary p-1.5 rounded-2xl">
                  {['en', 'si', 'ta'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang as any)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                        language === lang ? "bg-surface-elevated shadow-sm text-text-primary" : "text-text-muted hover:text-text-secondary"
                      )}
                    >
                      {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-border gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Bell className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary text-lg">{t.settings.push_notifications}</p>
                    <p className="text-sm text-text-muted">{t.settings.push_desc}</p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePush}
                  disabled={isLoading}
                  className={clsx(
                    "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-primary",
                    isSubscribed ? 'bg-primary shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-surface-elevated'
                  )}
                >
                  <span className={clsx(
                    "inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md",
                    isSubscribed ? 'translate-x-7' : 'translate-x-1'
                  )} />
                </button>
              </div>

              {/* Danger Zone */}
              <div className="pt-6">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Danger Zone</h3>
                <button
                  onClick={handleLogout}
                  className="w-full p-4 flex items-center justify-between bg-red-500/[0.06] hover:bg-red-500/10 border border-red-500/20 rounded-2xl transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-500/10 group-hover:bg-red-500/20 rounded-xl transition-colors">
                      <LogOut className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-red-400">Logout of AgriFarm</p>
                      <p className="text-xs text-red-400/70">You will need to sign in again.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400/50 group-hover:text-red-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

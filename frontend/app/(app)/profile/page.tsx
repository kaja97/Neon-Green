"use client";

import { ArrowLeft, Settings, User, Map, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useState } from "react";
import { clsx } from "clsx";

import ProfileSection from "@/components/settings/ProfileSection";
import LocationSection from "@/components/settings/LocationSection";
import LandSection from "@/components/settings/LandSection";
import LivestockSection from "@/components/settings/LivestockSection";
import { Globe, Bell, Smartphone, ChevronRight, LogOut, Shield } from "lucide-react";

export default function SettingsPage() {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "farm" | "preferences">("profile");
  
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const { t, language, setLanguage } = useTranslation();

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

  // Push notification loading is no longer blocking page render
  // The toggle will update asynchronously when ready

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Account Hub</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your profile, farm data, and settings.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveTab("profile")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all",
            activeTab === "profile" ? "bg-white text-green-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
          )}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("farm")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all",
            activeTab === "farm" ? "bg-white text-green-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
          )}
        >
          <Map className="w-4 h-4" />
          Farm Data
        </button>
        <button
          onClick={() => setActiveTab("preferences")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all",
            activeTab === "preferences" ? "bg-white text-green-700 shadow-sm" : "text-slate-600 hover:text-slate-800"
          )}
        >
          <Settings className="w-4 h-4" />
          Preferences
        </button>
      </div>

      <div className="mt-8 space-y-8">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <ProfileSection />
          </div>
        )}

        {activeTab === "farm" && (
          <div className="space-y-6">
            <LocationSection />
            <LandSection />
            <LivestockSection />
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">App Preferences</h2>
              
              {/* Language */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl">
                    <Globe className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{t.settings.language}</p>
                    <p className="text-sm text-slate-500">{t.settings.language_desc}</p>
                  </div>
                </div>
                <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl">
                  {['en', 'si', 'ta'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang as any)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-colors",
                        language === lang ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Push Notifications */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-2xl">
                    <Bell className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{t.settings.push_notifications}</p>
                    <p className="text-sm text-slate-500">{t.settings.push_desc}</p>
                  </div>
                </div>
                <button
                  onClick={handleTogglePush}
                  disabled={isLoading}
                  className={clsx(
                    "relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                    isSubscribed ? 'bg-green-500' : 'bg-slate-300'
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
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Danger Zone</h3>
                <button onClick={handleLogout} className="w-full p-4 flex items-center justify-between bg-red-50 hover:bg-red-100 rounded-2xl transition-colors text-left border border-red-100 group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 group-hover:bg-red-200 rounded-xl transition-colors">
                      <LogOut className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-bold text-red-700">Logout of AgriFarm</p>
                      <p className="text-xs text-red-500">You will need to sign in again.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

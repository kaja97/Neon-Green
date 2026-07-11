"use client";

import { ArrowLeft, Bell, BellOff, Loader2, Shield, Smartphone, ChevronRight, LogOut, Globe } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function SettingsPage() {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();
  
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900 pb-24">
      <header className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 bg-white shadow-sm hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.settings.title}</h1>
          <p className="text-slate-500 text-sm">{t.settings.subtitle}</p>
        </div>
      </header>

      {/* Preferences Section */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Preferences</h2>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Globe className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{t.settings.language}</p>
                <p className="text-xs text-slate-500">{t.settings.language_desc}</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('si')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === 'si' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                සිංහල
              </button>
              <button
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${language === 'ta' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                தமிழ்
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">{t.settings.notifications}</h2>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{t.settings.push_notifications}</p>
                <p className="text-xs text-slate-500">{t.settings.push_desc}</p>
              </div>
            </div>
            <button
              onClick={handleTogglePush}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isSubscribed ? 'bg-green-500' : 'bg-slate-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <Link href="/notifications" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Smartphone className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{t.settings.history}</p>
                <p className="text-xs text-slate-500">{t.settings.history_desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
        </div>
      </section>

      {/* Account Section */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">{t.settings.account}</h2>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <Link href="/profile" className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-xl">
                <Shield className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">{t.settings.details}</p>
                <p className="text-xs text-slate-500">{t.settings.details_desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Link>
          <button onClick={handleLogout} className="w-full p-4 flex items-center justify-between hover:bg-red-50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-red-600">{t.settings.logout}</p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

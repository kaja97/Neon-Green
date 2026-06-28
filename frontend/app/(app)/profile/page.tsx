import { User, Mail, Phone, MapPin, Sprout, LogOut, ChevronRight, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <section className="bg-card border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-emerald-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-emerald-500/20">
            K
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Kajanan</h1>
            <p className="text-slate-400 text-sm mt-1">Farmer · Jaffna, Sri Lanka</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Free Plan
            </span>
          </div>
        </div>
      </section>

      {/* Account Info */}
      <section className="bg-card border border-slate-800 rounded-3xl overflow-hidden">
        <h2 className="px-6 pt-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">Account Details</h2>
        <div className="divide-y divide-slate-800">
          {[
            { icon: User, label: "Full Name", value: "Kajanan" },
            { icon: Mail, label: "Email", value: "kajanan@email.com" },
            { icon: Phone, label: "Phone", value: "+94 77 123 4567" },
            { icon: MapPin, label: "Location", value: "Jaffna, Sri Lanka" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-white">{value}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="bg-card border border-slate-800 rounded-3xl overflow-hidden">
        <h2 className="px-6 pt-6 text-sm font-semibold text-slate-500 uppercase tracking-wider">Settings</h2>
        <div className="divide-y divide-slate-800">
          {[
            { icon: Globe, label: "Language", value: "English" },
            { icon: Shield, label: "Privacy & Security", value: "" },
            { icon: Sprout, label: "Farming Preferences", value: "Organic" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-slate-500" />
                <p className="text-sm font-medium text-white">{label}</p>
              </div>
              <div className="flex items-center gap-2">
                {value && <span className="text-sm text-slate-400">{value}</span>}
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logout */}
      <Link
        href="/"
        className="flex items-center justify-center gap-3 w-full bg-red-500/10 border border-red-500/20 text-red-400 py-4 rounded-2xl font-semibold hover:bg-red-500/20 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </Link>
    </div>
  );
}

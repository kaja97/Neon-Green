import { User, Mail, Phone, MapPin, Sprout, LogOut, ChevronRight, Shield, Globe } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 bg-slate-50 min-h-screen pb-24">
      {/* Profile Header */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-48 h-48 bg-green-50 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-green-500/20">
            K
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kajanan</h1>
            <p className="text-slate-500 text-sm mt-1">Farmer · Jaffna, Sri Lanka</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-100">
              Free Plan
            </span>
          </div>
        </div>
      </section>

      {/* Account Info */}
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <h2 className="px-6 pt-6 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Account Details</h2>
        <div className="divide-y divide-slate-100">
          {[
            { icon: User, label: "Full Name", value: "Kajanan" },
            { icon: Mail, label: "Email", value: "kajanan@email.com" },
            { icon: Phone, label: "Phone", value: "+94 77 123 4567" },
            { icon: MapPin, label: "Location", value: "Jaffna, Sri Lanka" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <h2 className="px-6 pt-6 text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</h2>
        <div className="divide-y divide-slate-100">
          {[
            { icon: Globe, label: "Language", value: "English", href: "/settings" },
            { icon: Shield, label: "Privacy & Security", value: "", href: "/settings" },
            { icon: Sprout, label: "Farming Preferences", value: "Organic", href: "/settings" },
          ].map(({ icon: Icon, label, value, href }) => (
            <Link key={label} href={href} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer block">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-100 rounded-xl">
                  <Icon className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
              </div>
              <div className="flex items-center gap-2">
                {value && <span className="text-sm text-slate-500">{value}</span>}
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Logout */}
      <Link
        href="/"
        className="flex items-center justify-center gap-3 w-full bg-red-50 border border-red-200 text-red-600 py-4 rounded-2xl font-semibold hover:bg-red-100 transition-colors shadow-sm"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </Link>
    </div>
  );
}

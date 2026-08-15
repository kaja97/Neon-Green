"use client";

import { useState } from "react";
import ParallaxBackground from "@/components/dashboard/ParallaxBackground";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, Store } from "lucide-react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { formatCurrency } from "@/lib/utils/formatters";

// Mock Data for demonstration
const mockChartData = [
  { name: "Jan", sales: 4000, purchases: 2400 },
  { name: "Feb", sales: 3000, purchases: 1398 },
  { name: "Mar", sales: 2000, purchases: 9800 },
  { name: "Apr", sales: 2780, purchases: 3908 },
  { name: "May", sales: 1890, purchases: 4800 },
  { name: "Jun", sales: 2390, purchases: 3800 },
  { name: "Jul", sales: 3490, purchases: 4300 },
];

const mockTransactions = [
  { id: "TX123", date: "2026-07-24", product: "Organic Tomatoes", type: "sale", amount: 12500.0, status: "completed", partner: "FreshMart Vendor" },
  { id: "TX124", date: "2026-07-22", product: "Carrots", type: "sale", amount: 8400.0, status: "completed", partner: "GreenGrocers" },
  { id: "TX125", date: "2026-07-20", product: "NPK Fertilizer", type: "purchase", amount: 4500.0, status: "completed", partner: "AgroSupply Co." },
  { id: "TX126", date: "2026-07-18", product: "Potatoes", type: "sale", amount: 22000.0, status: "pending", partner: "FreshMart Vendor" },
];

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "sales" | "purchases">("all");

  const filteredTransactions = mockTransactions.filter(t => activeTab === "all" || t.type === activeTab + "s" || t.type === activeTab.slice(0, -1));

  const totalSales = mockTransactions.filter(t => t.type === "sale").reduce((sum, t) => sum + t.amount, 0);
  const totalPurchases = mockTransactions.filter(t => t.type === "purchase").reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <ParallaxBackground />
      <div className="relative z-10 p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24">
        {/* Header */}
        <header className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-md">
                Transaction History<span className="text-emerald-400 text-glow-green">.</span>
              </h1>
              <p className="text-text-muted text-sm flex items-center gap-2">
                Manage your deals and financial history
              </p>
            </div>
          </div>
          <Link
            href="/market"
            className="p-2.5 glass-card-hover rounded-xl text-text-secondary hover:text-white transition-all duration-300 flex items-center gap-2"
          >
            <Store className="w-5 h-5 text-emerald-400" />
            <span className="hidden md:inline text-sm font-semibold text-slate-900 dark:text-white">Marketplace</span>
          </Link>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-up">
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ArrowUpRight className="w-5 h-5" />
              <h3 className="font-bold text-sm">Total Sales</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalSales)}</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <ArrowDownRight className="w-5 h-5" />
              <h3 className="font-bold text-sm">Total Purchases</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalPurchases)}</p>
          </div>
          <div className="glass-card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-bold text-sm">Net Balance</h3>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(totalSales - totalPurchases)}</p>
          </div>
        </div>

        {/* Charts */}
        <section className="glass-card p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Financial Overview</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="sales" name="Sales Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Transaction Table */}
        <section className="glass-card p-6 overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
            <div className="flex bg-slate-800/50 p-1 rounded-xl">
              {(["all", "sales", "purchases"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                    activeTab === tab ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                  <th className="pb-3 font-medium px-4">ID</th>
                  <th className="pb-3 font-medium px-4">Date</th>
                  <th className="pb-3 font-medium px-4">Type</th>
                  <th className="pb-3 font-medium px-4">Product</th>
                  <th className="pb-3 font-medium px-4">Partner</th>
                  <th className="pb-3 font-medium px-4">Amount</th>
                  <th className="pb-3 font-medium px-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-slate-300">{tx.id}</td>
                    <td className="py-4 px-4 text-slate-300">{tx.date}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                        tx.type === 'sale' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.type === 'sale' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-900 dark:text-white font-medium">{tx.product}</td>
                    <td className="py-4 px-4 text-slate-300">{tx.partner}</td>
                    <td className={`py-4 px-4 font-bold ${tx.type === 'sale' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'sale' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

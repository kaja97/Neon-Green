"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import {
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  X,
  MapPin,
  Building,
  ShoppingBag,
  Sprout,
  Calendar,
  Phone,
  Mail,
  FolderGit2,
} from "lucide-react";
import { clsx } from "clsx";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [inspectingUserId, setInspectingUserId] = useState<string | null>(null);

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", searchTerm, roleFilter, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter !== "") params.append("is_active", statusFilter);
      params.append("page", String(page));
      params.append("per_page", "20");

      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data?.data || res.data;
    },
  });

  const { data: userDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-user-detail", inspectingUserId],
    queryFn: async () => {
      if (!inspectingUserId) return null;
      const res = await api.get(`/admin/users/${inspectingUserId}`);
      return res.data?.data || res.data;
    },
    enabled: !!inspectingUserId,
  });

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const endpoint = isActive ? "deactivate" : "reactivate";
      const res = await api.patch(`/admin/users/${userId}/${endpoint}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", inspectingUserId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await api.patch(`/admin/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-user-detail", inspectingUserId] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const users = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20) || 1;

  const roleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-neon-purple/15 text-neon-purple border border-neon-purple/30";
      case "vendor":
        return "bg-neon-gold/15 text-neon-gold border border-neon-gold/30";
      case "buyer":
        return "bg-neon-blue/15 text-neon-blue border border-neon-blue/30";
      default:
        return "bg-primary/15 text-primary border border-primary/30";
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            User Directory & Access Control<span className="text-neon-blue text-glow-blue">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage ecosystem accounts across Farmers, Vendors, Buyers, and Platform Administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-surface-tertiary border border-border text-text-secondary">
            Total Accounts: <strong className="text-white">{total}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Roles (Farmer, Vendor, Buyer, Admin)</option>
          <option value="farmer">Farmer</option>
          <option value="vendor">Vendor</option>
          <option value="buyer">Buyer</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-tertiary border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Deactivated Only</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-text-muted glass-card rounded-2xl border border-dashed border-border">
          No user accounts found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-border overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase font-bold text-text-muted bg-surface-secondary/40">
                  <th className="p-4">User</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Profile Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-surface-tertiary/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{u.display_name}</div>
                      <div className="text-xs text-text-muted">{u.email}</div>
                    </td>
                    <td className="p-4 text-text-secondary text-xs">{u.phone || "No phone"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-secondary">
                      {u.role === "farmer" && (
                        <span>🌾 {u.farming_method || "Farmer Profile"}</span>
                      )}
                      {u.role === "vendor" && (
                        <span>🏪 {u.business_name || "Vendor Business"}</span>
                      )}
                      {u.role === "buyer" && (
                        <span>🛒 {u.buyer_type || "Buyer Tier"}</span>
                      )}
                      {u.role === "admin" && <span>🛡️ System Admin</span>}
                    </td>
                    <td className="p-4">
                      <span
                        className={clsx(
                          "text-xs font-semibold px-2 py-0.5 rounded",
                          u.is_active
                            ? "bg-green-500/15 text-green-400 border border-green-500/30"
                            : "bg-red-500/15 text-red-400 border border-red-500/30"
                        )}
                      >
                        {u.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-muted">{u.created_at?.split("T")[0]}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectingUserId(u.id)}
                          className="px-3 py-1.5 rounded-xl bg-surface-tertiary hover:bg-neon-blue/20 hover:text-neon-blue text-xs font-semibold transition-colors"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() =>
                            toggleStatusMutation.mutate({ userId: u.id, isActive: u.is_active })
                          }
                          className={clsx(
                            "p-1.5 rounded-lg text-xs font-medium transition-colors",
                            u.is_active
                              ? "hover:bg-red-500/20 text-text-muted hover:text-red-400"
                              : "hover:bg-green-500/20 text-text-muted hover:text-green-400"
                          )}
                          title={u.is_active ? "Deactivate Account" : "Reactivate Account"}
                        >
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-text-muted">
                Showing page {page} of {totalPages} ({total} accounts)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-surface-tertiary text-xs font-semibold text-text-secondary disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-surface-tertiary text-xs font-semibold text-text-secondary disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── USER PROFILE INSPECTOR DRAWER ─── */}
      {inspectingUserId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl h-full bg-surface-secondary border-l border-border flex flex-col overflow-hidden animate-slide-left">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-blue/15 text-neon-blue border border-neon-blue/30 flex items-center justify-center font-bold text-sm">
                  {userDetail?.email?.slice(0, 2).toUpperCase() || "US"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {userDetail?.farmer_profile?.full_name ||
                      userDetail?.vendor_profile?.business_name ||
                      userDetail?.buyer_profile?.full_name ||
                      "User Account"}
                  </h2>
                  <p className="text-xs text-text-muted">{userDetail?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingUserId(null)}
                className="p-2 rounded-xl bg-surface-tertiary text-text-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {isLoadingDetail ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Account Overview */}
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Account Credentials</h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-text-muted block">Phone</span>
                        <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{userDetail?.phone || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Current Role</span>
                        <span className={`font-bold uppercase mt-0.5 inline-block px-2 py-0.5 rounded text-[11px] ${roleBadge(userDetail?.role)}`}>
                          {userDetail?.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Account Status</span>
                        <span className={`font-semibold mt-0.5 inline-block ${userDetail?.is_active ? "text-green-400" : "text-red-400"}`}>
                          {userDetail?.is_active ? "Active" : "Deactivated"}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted block">Joined Date</span>
                        <span className="text-text-secondary mt-0.5 block">{userDetail?.created_at?.split("T")[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Farmer Profile Specifics */}
                  {userDetail?.farmer_profile && (
                    <div className="glass-card rounded-2xl p-5 border border-primary/30 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Sprout className="w-4 h-4" /> Farmer Profile
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-text-muted block">Full Name</span>
                          <strong className="text-white mt-0.5 block">{userDetail.farmer_profile.full_name}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">Farming Method</span>
                          <strong className="text-white mt-0.5 block capitalize">{userDetail.farmer_profile.farming_method}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">Experience</span>
                          <span className="text-slate-900 dark:text-white mt-0.5 block">{userDetail.farmer_profile.experience_years} Years</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Active Projects</span>
                          <span className="font-bold text-primary mt-0.5 block">{userDetail.farmer_profile.project_count}</span>
                        </div>
                      </div>

                      {userDetail.farmer_profile.locations?.length > 0 && (
                        <div className="pt-2 border-t border-border/50 space-y-1.5">
                          <span className="text-[11px] font-semibold text-text-muted block">Registered Farm Locations:</span>
                          <div className="space-y-1">
                            {userDetail.farmer_profile.locations.map((loc: any) => (
                              <div key={loc.id} className="text-xs p-2 rounded-lg bg-surface-tertiary flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <span className="font-medium text-slate-900 dark:text-white">{loc.name}</span>
                                <span className="text-text-muted">({loc.district})</span>
                                {loc.is_primary && (
                                  <span className="ml-auto text-[10px] font-bold text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vendor Profile Specifics */}
                  {userDetail?.vendor_profile && (
                    <div className="glass-card rounded-2xl p-5 border border-neon-gold/30 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neon-gold flex items-center gap-1.5">
                        <Building className="w-4 h-4" /> Vendor Profile
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-text-muted block">Business Name</span>
                          <strong className="text-white mt-0.5 block">{userDetail.vendor_profile.business_name}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">Tax / Business ID</span>
                          <span className="text-slate-900 dark:text-white mt-0.5 block">{userDetail.vendor_profile.tax_id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Vendor Rating</span>
                          <span className="text-neon-gold font-bold mt-0.5 block">★ {userDetail.vendor_profile.rating || "5.0"}</span>
                        </div>
                        <div>
                          <span className="text-text-muted block">Verified Vendor</span>
                          <span className="text-slate-900 dark:text-white mt-0.5 block">{userDetail.vendor_profile.is_verified ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buyer Profile Specifics */}
                  {userDetail?.buyer_profile && (
                    <div className="glass-card rounded-2xl p-5 border border-neon-blue/30 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neon-blue flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> Buyer Profile
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-text-muted block">Full Name</span>
                          <strong className="text-white mt-0.5 block">{userDetail.buyer_profile.full_name}</strong>
                        </div>
                        <div>
                          <span className="text-text-muted block">Buyer Tier</span>
                          <strong className="text-white mt-0.5 block">{userDetail.buyer_profile.buyer_type}</strong>
                        </div>
                      </div>
                      {userDetail.buyer_profile.delivery_address && (
                        <div className="text-xs pt-2 border-t border-border/50">
                          <span className="text-text-muted block">Delivery Address:</span>
                          <span className="text-text-secondary mt-0.5 block">{userDetail.buyer_profile.delivery_address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Assignment Action */}
                  <div className="glass-card rounded-2xl p-5 border border-border space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">Role & Access Management</h3>
                    <div className="flex items-center gap-2">
                      {["farmer", "vendor", "buyer", "admin"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            if (confirm(`Change role of user ${userDetail.email} to "${r}"?`)) {
                              changeRoleMutation.mutate({ userId: inspectingUserId, role: r });
                            }
                          }}
                          className={clsx(
                            "px-3 py-1.5 rounded-xl border text-xs font-bold uppercase transition-all",
                            userDetail?.role === r
                              ? "bg-neon-purple/20 border-neon-purple text-neon-purple"
                              : "bg-surface-tertiary border-border text-text-muted hover:text-white"
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

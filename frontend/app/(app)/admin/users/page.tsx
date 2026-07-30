"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState } from "react";
import { Loader2, Search, ShieldAlert, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { clsx } from "clsx";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", searchTerm, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter) params.append("role", roleFilter);
      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data;
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      const endpoint = isActive ? "deactivate" : "reactivate";
      const res = await api.patch(`/admin/users/${userId}/${endpoint}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const res = await api.patch(`/admin/users/${userId}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            User Management<span className="text-green-400 text-glow-green">.</span>
          </h1>
          <p className="text-text-muted text-sm mt-1">Manage farmers, admins, and their access.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-64"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-surface-tertiary border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </header>

      <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-tertiary/50 border-b border-border text-text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                data?.items?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-surface-tertiary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.full_name || "Unknown"}</div>
                      <div className="text-xs text-text-muted font-mono mt-0.5">{user.id.split("-")[0]}...</div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <div>{user.email}</div>
                      <div className="text-xs text-text-muted">{user.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-semibold capitalize border",
                        user.role === "admin"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "flex items-center gap-1.5 text-xs font-medium",
                        user.is_active ? "text-green-400" : "text-red-400"
                      )}>
                        <span className={clsx("w-2 h-2 rounded-full", user.is_active ? "bg-green-400 shadow-[0_0_8px_#22c55e]" : "bg-red-400")} />
                        {user.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role === "farmer" ? (
                          <button
                            onClick={() => changeRoleMutation.mutate({ userId: user.id, role: "admin" })}
                            className="p-1.5 text-text-muted hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Make Admin"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => changeRoleMutation.mutate({ userId: user.id, role: "farmer" })}
                            className="p-1.5 text-text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Make Farmer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}

                        {user.is_active ? (
                          <button
                            onClick={() => toggleStatusMutation.mutate({ userId: user.id, isActive: user.is_active })}
                            className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Deactivate User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatusMutation.mutate({ userId: user.id, isActive: user.is_active })}
                            className="p-1.5 text-text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Reactivate User"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface-tertiary/30 flex items-center justify-between text-sm text-text-muted">
          <div>
            Showing {data?.items?.length || 0} of {data?.total || 0} users
          </div>
        </div>
      </div>
    </div>
  );
}

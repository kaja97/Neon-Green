"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Plus, Edit2, Trash2, Bird } from "lucide-react";
import Modal from "../ui/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const livestockSchema = z.object({
  animal_type: z.string().min(2, "Animal type is required"),
  count: z.number().min(1, "Count must be at least 1"),
  purpose: z.string().optional(),
});

type LivestockFormValues = z.infer<typeof livestockSchema>;

const inputClass =
  "w-full px-4 py-2 bg-surface-tertiary border border-border text-text-primary placeholder:text-text-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

export default function LivestockSection() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLivestock, setEditingLivestock] = useState<any>(null);

  const { data: livestock, isLoading } = useQuery({
    queryKey: ["farmerLivestock"],
    queryFn: async () => {
      const res = await api.get("/farmer/livestock");
      return res.data.data;
    },
  });

  const form = useForm<LivestockFormValues>({
    resolver: zodResolver(livestockSchema),
    defaultValues: {
      animal_type: "",
      count: 1,
      purpose: "",
    },
  });

  const handleOpenModal = (ls: any = null) => {
    if (ls) {
      setEditingLivestock(ls);
      form.reset({
        animal_type: ls.animal_type,
        count: ls.count,
        purpose: ls.purpose || "",
      });
    } else {
      setEditingLivestock(null);
      form.reset({
        animal_type: "",
        count: 1,
        purpose: "",
      });
    }
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: LivestockFormValues) => {
      if (editingLivestock) {
        await api.put(`/farmer/livestock/${editingLivestock.id}`, data);
      } else {
        await api.post("/farmer/livestock", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerLivestock"] });
      setIsModalOpen(false);
    },
    onError: (err) => {
      alert("Failed to save livestock: " + (err as any).message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/farmer/livestock/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerLivestock"] });
    },
    onError: (err) => {
      alert("Failed to delete. " + (err as any).message);
    }
  });

  const onSubmit = (data: LivestockFormValues) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Livestock</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl font-semibold hover:bg-green-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Livestock
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {livestock?.length === 0 ? (
          <p className="text-text-muted text-sm col-span-full">No livestock added yet.</p>
        ) : (
          livestock?.map((ls: any) => (
            <div key={ls.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-green-500/20 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bird className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white capitalize">{ls.animal_type}</h3>
                </div>
                <div className="flex gap-2 items-center mb-1">
                  <span className="text-sm font-semibold text-text-secondary bg-surface-tertiary px-2 py-1 rounded-lg">Count: {ls.count}</span>
                </div>
                {ls.purpose && <p className="text-xs text-text-muted mt-2 line-clamp-2">Purpose: {ls.purpose}</p>}
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border justify-end">
                <button
                  onClick={() => handleOpenModal(ls)}
                  className="p-2 text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this livestock record?")) {
                      deleteMutation.mutate(ls.id);
                    }
                  }}
                  className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLivestock ? "Edit Livestock" : "New Livestock"}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Animal Type</label>
            <input {...form.register("animal_type")} className={inputClass} placeholder="e.g. Cows, Chickens, Goats" />
            {form.formState.errors.animal_type && <p className="text-red-400 text-xs">{form.formState.errors.animal_type.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Head Count</label>
            <input type="number" {...form.register("count", { valueAsNumber: true })} className={inputClass} />
            {form.formState.errors.count && <p className="text-red-400 text-xs">{form.formState.errors.count.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Primary Purpose (Optional)</label>
            <input {...form.register("purpose")} className={inputClass} placeholder="e.g. Dairy, Meat, Eggs" />
          </div>

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Livestock"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

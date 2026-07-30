"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  primary_language: z.string().min(2, "Required"),
  experience_years: z.number().min(0, "Experience must be 0 or more"),
  farming_method: z.string().min(2, "Required"),
  gender: z.string().optional(),
  education_level: z.string().optional(),
  bio: z.string().max(1000, "Bio is too long").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const inputClass =
  "w-full px-4 py-2 bg-surface-tertiary border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all";

export default function ProfileSection() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["farmerProfile"],
    queryFn: async () => {
      const res = await api.get("/farmer/profile");
      return res.data.data;
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      primary_language: "en",
      experience_years: 0,
      farming_method: "",
      gender: "",
      education_level: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        primary_language: profile.primary_language || "en",
        experience_years: profile.experience_years || 0,
        farming_method: profile.farming_method || "",
        gender: profile.gender || "",
        education_level: profile.education_level || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await api.put("/farmer/profile", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmerProfile"] });
      alert("Profile updated successfully!");
    },
    onError: (error) => {
      alert("Failed to update profile. " + (error as any).message);
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateMutation.mutate(data);
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
      <h2 className="text-xl font-bold text-white mb-6">Personal Details</h2>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Full Name</label>
            <input
              {...form.register("full_name")}
              className={inputClass}
              placeholder="Your full name"
            />
            {form.formState.errors.full_name && (
              <p className="text-red-400 text-xs">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Primary Language</label>
            <select
              {...form.register("primary_language")}
              className={inputClass}
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Experience (Years)</label>
            <input
              type="number"
              {...form.register("experience_years", { valueAsNumber: true })}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Farming Method</label>
            <select
              {...form.register("farming_method")}
              className={inputClass}
            >
              <option value="organic">Organic</option>
              <option value="inorganic">Conventional / Inorganic</option>
              <option value="integrated">Integrated</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Bio / Notes</label>
          <textarea
            {...form.register("bio")}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="Tell us a bit about your farm..."
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

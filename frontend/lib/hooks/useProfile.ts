import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface FarmerProfile {
  id: string;
  full_name: string;
  primary_language: string;
  experience_years: number;
  farming_method: string;
  avatar_url: string | null;
}

export function useProfile() {
  return useQuery<FarmerProfile>({
    queryKey: ["farmer-profile"],
    queryFn: async () => {
      const res = await api.get("/farmer/profile");
      return res.data.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<FarmerProfile>) => {
      const res = await api.put("/farmer/profile", data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmer-profile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: {
      current_password: string;
      new_password: string;
    }) => {
      const res = await api.patch("/auth/change-password", data);
      return res.data.data;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      await api.delete("/auth/account");
    },
  });
}

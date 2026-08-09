import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories: SubCategory[];
}

export function useCategories() {
  return useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: async (): Promise<Category[]> => {
      const res = await api.get("/marketplace/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post("/marketplace/products", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product listed successfully!");
      queryClient.invalidateQueries({ queryKey: ["marketplace", "products"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace", "my-products"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to list product");
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/marketplace/products/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update product");
    },
  });
}

export function useMarkSoldOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/marketplace/products/${id}/sold-out`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Product marked as sold out!");
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || "Failed to update product");
    },
  });
}

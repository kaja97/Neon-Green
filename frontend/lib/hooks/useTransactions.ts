import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import type { Transaction, TransactionSummary, TransactionReview, ApiResponse } from "@/lib/types";

// ── Queries ─────────────────────────────────────────────

export function useMyTransactions(filters?: {
  type?: "sales" | "purchases";
  status?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["transactions", "list", filters],
    queryFn: async (): Promise<Transaction[]> => {
      const params = new URLSearchParams();
      if (filters?.type) params.set("type", filters.type);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.skip) params.set("skip", String(filters.skip));
      if (filters?.limit) params.set("limit", String(filters.limit));

      const res = await api.get<ApiResponse<Transaction[]>>(
        `/transactions?${params.toString()}`
      );
      return res.data.data;
    },
  });
}

export function useTransactionDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["transactions", "detail", id],
    queryFn: async (): Promise<Transaction> => {
      const res = await api.get<ApiResponse<Transaction>>(
        `/transactions/${id}`
      );
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useTransactionSummary() {
  return useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: async (): Promise<TransactionSummary> => {
      const res = await api.get<ApiResponse<TransactionSummary>>(
        "/transactions/summary"
      );
      return res.data.data;
    },
  });
}

// ── Mutations ───────────────────────────────────────────

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: string;
      quantity: number;
      notes?: string;
    }) => {
      const res = await api.post<ApiResponse<Transaction>>(
        "/transactions",
        data
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Purchase order created successfully!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error?.message || "Failed to create transaction"
      );
    },
  });
}

export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: string;
      reason?: string;
    }) => {
      const res = await api.patch<ApiResponse<Transaction>>(
        `/transactions/${id}/status`,
        { status, reason }
      );
      return res.data.data;
    },
    onSuccess: (data) => {
      const statusLabels: Record<string, string> = {
        confirmed: "Transaction confirmed!",
        completed: "Transaction completed!",
        cancelled: "Transaction cancelled.",
      };
      toast.success(statusLabels[data.status] || "Status updated!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error?.message || "Failed to update status"
      );
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      transactionId,
      rating,
      comment,
    }: {
      transactionId: string;
      rating: number;
      comment?: string;
    }) => {
      const res = await api.post<ApiResponse<TransactionReview>>(
        `/transactions/${transactionId}/reviews`,
        { rating, comment }
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error?.message || "Failed to submit review"
      );
    },
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ["reviews", "me"],
    queryFn: async (): Promise<TransactionReview[]> => {
      const res = await api.get<ApiResponse<TransactionReview[]>>(
        "/transactions/reviews/me"
      );
      return res.data.data;
    },
  });
}

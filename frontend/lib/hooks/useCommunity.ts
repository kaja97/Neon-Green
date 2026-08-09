import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import type { CommunityFeedItem, CommunityComment } from "@/lib/types";

export function useCommunityFeed(issueType?: string | null) {
  return useQuery({
    queryKey: ["community", "feed", issueType],
    queryFn: async (): Promise<CommunityFeedItem[]> => {
      const params: Record<string, string> = {};
      if (issueType) params.issue_type = issueType;
      const res = await api.get("/disease/community", { params });
      return res.data.data;
    },
  });
}

export function useCommunityIssue(issueId?: string) {
  return useQuery({
    queryKey: ["community", "issue", issueId],
    queryFn: async () => {
      const res = await api.get(`/disease/community/${issueId}`);
      return res.data.data;
    },
    enabled: !!issueId,
  });
}

export function useCommunityComments(issueId?: string) {
  return useQuery({
    queryKey: ["community", "comments", issueId],
    queryFn: async (): Promise<CommunityComment[]> => {
      const res = await api.get(`/disease/community/${issueId}/comments`);
      return res.data.data;
    },
    enabled: !!issueId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issueId,
      body,
      parentId,
    }: {
      issueId: string;
      body: string;
      parentId?: string | null;
    }) => {
      const res = await api.post(`/disease/community/${issueId}/comments`, {
        body,
        parent_id: parentId || null,
      });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      toast.success("Comment posted!");
      queryClient.invalidateQueries({
        queryKey: ["community", "comments", variables.issueId],
      });
      queryClient.invalidateQueries({ queryKey: ["community", "feed"] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.error?.message || "Failed to post comment"
      );
    },
  });
}

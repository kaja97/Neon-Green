import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface AISummary {
  summary: string;
  generated_at: string;
  model: string;
  cost: number;
  source: string;
}

interface AIRefreshResponse {
  summary: string;
  generated_at: string;
  model: string;
  cost: number;
  ai_calls_remaining_today: number;
  insights_applied: string[];
}

interface AIUsage {
  ai_calls_remaining_today: number;
  daily_limit: number;
}

export function useAISummary(projectId: string) {
  return useQuery<AISummary>({
    queryKey: ["ai-summary", projectId],
    queryFn: async () => {
      const res = await api.get(`/ai/summary/${projectId}`);
      return res.data.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!projectId,
  });
}

export function useRefreshAISummary(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<AIRefreshResponse>({
    mutationFn: async () => {
      const res = await api.post(`/ai/summary/${projectId}`);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-summary", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
    },
  });
}

export function useAIChat(projectId: string) {
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post("/ai/chat", {
        project_id: projectId,
        message,
      });
      return res.data.data;
    },
  });
}

export function useAIUsage() {
  return useQuery<AIUsage>({
    queryKey: ["ai-usage"],
    queryFn: async () => {
      const res = await api.get("/ai/usage");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

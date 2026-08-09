import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useOfflineStore } from "../stores/offlineStore";
import type { Activity } from "@/lib/types";

export function useActivities(projectId: string) {
  const { cacheActivities, getActivities } = useOfflineStore();

  return useQuery<Activity[]>({
    queryKey: ["activities", projectId],
    queryFn: async () => {
      try {
        const res = await api.get(`/planner/${projectId}/today`);
        const data = res.data.data ?? res.data;
        cacheActivities(projectId, data);
        return data;
      } catch (err: any) {
        if (!navigator.onLine) {
          const cached = getActivities(projectId);
          if (cached) return cached;
        }
        throw err;
      }
    },
    // Start with cached data if available
    initialData: () => getActivities(projectId),
  });
}

export function useAllActivities(projectId: string) {
  return useQuery<Activity[]>({
    queryKey: ["all-activities", projectId],
    queryFn: async () => {
      const res = await api.get(`/planner/${projectId}/activities`);
      return res.data.data;
    },
    enabled: !!projectId,
  });
}

export function useCompleteActivity(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, data = {} }: { activityId: string, data?: { actual_water_liters?: number, actual_fertilizer_kg?: number, notes?: string } }) => {
      const res = await api.patch(`/planner/activities/${activityId}/complete`, data);
      return res.data.data;
    },
    onMutate: async ({ activityId }) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", projectId] });
      await queryClient.cancelQueries({ queryKey: ["activities", projectId] });
      await queryClient.cancelQueries({ queryKey: ["all-activities", projectId] });

      const previousDashboard: any = queryClient.getQueryData(["dashboard", projectId]);
      const previousActivities: any = queryClient.getQueryData(["activities", projectId]);
      const previousAll: any = queryClient.getQueryData(["all-activities", projectId]);

      const markDone = (list: any[]) => list?.map((a: any) => a.id === activityId ? { ...a, status: "completed" } : a);

      if (previousDashboard) queryClient.setQueryData(["dashboard", projectId], { ...previousDashboard, todays_activities: markDone(previousDashboard.todays_activities) });
      if (previousActivities) queryClient.setQueryData(["activities", projectId], markDone(previousActivities));
      if (previousAll) queryClient.setQueryData(["all-activities", projectId], markDone(previousAll));

      return { previousDashboard, previousActivities, previousAll };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousDashboard) queryClient.setQueryData(["dashboard", projectId], context.previousDashboard);
      if (context?.previousActivities) queryClient.setQueryData(["activities", projectId], context.previousActivities);
      if (context?.previousAll) queryClient.setQueryData(["all-activities", projectId], context.previousAll);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-activities", projectId] });
    },
  });
}

export function useSkipActivity(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, reason }: { activityId: string, reason: string }) => {
      // Backend accepts both 'reason' and 'skipped_reason' — send both for compatibility
      const res = await api.patch(`/planner/activities/${activityId}/skip`, { reason, skipped_reason: reason });
      return res.data.data;
    },
    onMutate: async ({ activityId }) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", projectId] });
      await queryClient.cancelQueries({ queryKey: ["activities", projectId] });
      await queryClient.cancelQueries({ queryKey: ["all-activities", projectId] });

      const previousDashboard: any = queryClient.getQueryData(["dashboard", projectId]);
      const previousActivities: any = queryClient.getQueryData(["activities", projectId]);
      const previousAll: any = queryClient.getQueryData(["all-activities", projectId]);

      const markSkipped = (list: any[]) => list?.map((a: any) => a.id === activityId ? { ...a, status: "skipped" } : a);

      if (previousDashboard) queryClient.setQueryData(["dashboard", projectId], { ...previousDashboard, todays_activities: markSkipped(previousDashboard.todays_activities) });
      if (previousActivities) queryClient.setQueryData(["activities", projectId], markSkipped(previousActivities));
      if (previousAll) queryClient.setQueryData(["all-activities", projectId], markSkipped(previousAll));

      return { previousDashboard, previousActivities, previousAll };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousDashboard) queryClient.setQueryData(["dashboard", projectId], context.previousDashboard);
      if (context?.previousActivities) queryClient.setQueryData(["activities", projectId], context.previousActivities);
      if (context?.previousAll) queryClient.setQueryData(["all-activities", projectId], context.previousAll);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-activities", projectId] });
    },
  });
}

export function useCreateActivity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string; activity_type: string; name?: string; description?: string; due_date: string }) => {
      const res = await api.post(`/planner/${projectId}/activities`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
    },
  });
}

export function useUpdateActivity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ activityId, data }: { activityId: string, data: { title?: string; activity_type?: string; name?: string; description?: string; due_date?: string } }) => {
      const res = await api.put(`/planner/activities/${activityId}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-activities", projectId] });
    },
  });
}

export function useDeleteActivity(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activityId: string) => {
      await api.delete(`/planner/activities/${activityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
    },
  });
}

export function useResetActivity(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      const res = await api.post(`/planner/activities/${activityId}/reset`);
      return res.data.data;
    },
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: ["dashboard", projectId] });
      await queryClient.cancelQueries({ queryKey: ["activities", projectId] });
      await queryClient.cancelQueries({ queryKey: ["all-activities", projectId] });

      const previousDashboard: any = queryClient.getQueryData(["dashboard", projectId]);
      const previousActivities: any = queryClient.getQueryData(["activities", projectId]);
      const previousAll: any = queryClient.getQueryData(["all-activities", projectId]);

      const markPending = (list: any[]) => list?.map((a: any) => a.id === activityId ? { ...a, status: "pending", completed_at: null } : a);

      if (previousDashboard) queryClient.setQueryData(["dashboard", projectId], { ...previousDashboard, todays_activities: markPending(previousDashboard.todays_activities) });
      if (previousActivities) queryClient.setQueryData(["activities", projectId], markPending(previousActivities));
      if (previousAll) queryClient.setQueryData(["all-activities", projectId], markPending(previousAll));

      return { previousDashboard, previousActivities, previousAll };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousDashboard) queryClient.setQueryData(["dashboard", projectId], context.previousDashboard);
      if (context?.previousActivities) queryClient.setQueryData(["activities", projectId], context.previousActivities);
      if (context?.previousAll) queryClient.setQueryData(["all-activities", projectId], context.previousAll);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", projectId] });
      queryClient.invalidateQueries({ queryKey: ["activities", projectId] });
      queryClient.invalidateQueries({ queryKey: ["all-activities", projectId] });
    },
  });
}

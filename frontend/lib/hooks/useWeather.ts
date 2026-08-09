import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { WeatherResponse } from "@/lib/types";

export function useWeather(projectId: string) {
  return useQuery<WeatherResponse>({
    queryKey: ["weather", projectId],
    queryFn: async () => {
      const res = await api.get(`/weather/${projectId}`);
      return res.data.data;
    },
    staleTime: 3 * 60 * 60 * 1000, // 3 hours
    enabled: !!projectId,
  });
}

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Plant {
  id: string;
  common_name: string;
  local_name: string;
  category: string;
  growth_duration_days: number;
  image_url: string;
  compatible_soil_types: string[];
  optimal_temp_range: string;
}

interface FarmingMethod {
  id: string;
  code: string;
  name: string;
}

interface Location {
  id: string;
  label: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
  address_line?: string;
  province?: string;
}

interface LandDetail {
  id: string;
  location_id: string;
  total_area: number;
  area_unit: string;
  soil_type: string;
  water_source: string;
  irrigation_type: string;
  land_ownership: string;
}

export function usePlants(category?: string) {
  return useQuery<Plant[]>({
    queryKey: ["plants", category],
    queryFn: async () => {
      const res = await api.get("/plants", {
        params: category ? { category } : undefined,
      });
      return res.data.data;
    },
    staleTime: Infinity, // Master data rarely changes
  });
}

export function useFarmingMethods() {
  return useQuery<FarmingMethod[]>({
    queryKey: ["farming-methods"],
    queryFn: async () => {
      const res = await api.get("/farming-methods");
      return res.data.data;
    },
    staleTime: Infinity,
  });
}

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["farmer-locations"],
    queryFn: async () => {
      const res = await api.get("/farmer/locations");
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLandDetails() {
  return useQuery<LandDetail[]>({
    queryKey: ["farmer-land"],
    queryFn: async () => {
      const res = await api.get("/farmer/land");
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

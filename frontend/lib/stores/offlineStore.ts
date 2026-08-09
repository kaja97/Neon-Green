import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineState {
  todaysActivities: Record<string, any[]>;
  dashboardData: Record<string, any>;
  lastSyncedAt: number | null;
  cacheActivities: (projectId: string, activities: any[]) => void;
  cacheDashboard: (projectId: string, data: any) => void;
  getActivities: (projectId: string) => any[] | undefined;
  getDashboard: (projectId: string) => any | undefined;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      todaysActivities: {},
      dashboardData: {},
      lastSyncedAt: null,
      
      cacheActivities: (projectId, activities) => 
        set((state) => ({
          todaysActivities: {
            ...state.todaysActivities,
            [projectId]: activities
          },
          lastSyncedAt: Date.now()
        })),

      cacheDashboard: (projectId, data) =>
        set((state) => ({
          dashboardData: {
            ...state.dashboardData,
            [projectId]: data
          },
          lastSyncedAt: Date.now()
        })),

      getActivities: (projectId) => get().todaysActivities[projectId],
      
      getDashboard: (projectId) => get().dashboardData[projectId]
    }),
    {
      name: 'agrifarm-offline-cache',
    }
  )
);

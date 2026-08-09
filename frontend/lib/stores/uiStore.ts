import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";
type Locale = "en" | "si" | "ta";

interface UIState {
  theme: Theme;
  locale: Locale;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  setLocale: (locale: Locale) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      locale: "en",
      sidebarOpen: false,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "ui-storage",
    }
  )
);

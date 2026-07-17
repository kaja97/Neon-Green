"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/stores/uiStore";

/**
 * Keeps the `dark` / `light` class on <html> in sync with the persisted
 * theme in `uiStore`. The matching no-flash inline script in layout.tsx
 * sets the class *before* hydration so there is no flash on reload.
 */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

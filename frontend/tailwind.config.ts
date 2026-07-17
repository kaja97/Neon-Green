import type { Config } from "tailwindcss";

const config: Config = {
  // Theme class lives on <html> ("dark" | "light"); driven by ThemeProvider.
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        // Brand Colors (static — consistent across themes)
        primary: {
          DEFAULT: "#10b981",
          foreground: "#ffffff",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        neon: {
          green: "#22c55e",
          gold: "#f59e0b",
          red: "#ef4444",
          blue: "#3b82f6",
          purple: "#8b5cf6",
        },
        // Surface Palette — theme-aware via CSS variables.
        // Each resolves to hsl(var(--…)) so dark/light swap from globals.css.
        surface: {
          primary: "hsl(var(--color-surface-primary))",
          secondary: "hsl(var(--color-surface-secondary))",
          tertiary: "hsl(var(--color-surface-tertiary))",
          elevated: "hsl(var(--color-surface-elevated))",
        },
        // Text — theme-aware
        text: {
          primary: "hsl(var(--color-text-primary))",
          secondary: "hsl(var(--color-text-secondary))",
          muted: "hsl(var(--color-text-muted))",
        },
        // Borders — theme-aware
        border: "hsl(var(--color-border))",
        "border-hover": "hsl(var(--color-border-hover))",

        // Aliases for shadcn/ui compatibility — also theme-aware
        background: "hsl(var(--color-surface-primary))",
        foreground: "hsl(var(--color-text-primary))",
        card: "hsl(var(--color-surface-secondary))",
        "card-foreground": "hsl(var(--color-text-primary))",
        muted: "hsl(var(--color-surface-tertiary))",
        "muted-foreground": "hsl(var(--color-text-secondary))",
        accent: "hsl(var(--color-surface-elevated))",
        "accent-foreground": "hsl(var(--color-text-primary))",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        input: "hsl(var(--color-border))",
        ring: "#10b981",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "highlight-flash": "highlight-flash 2s ease-in-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      backgroundImage: {
        shimmer:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
      },
      backgroundSize: {
        shimmer: "200% 100%",
      },
    },
  },
  plugins: [],
};
export default config;

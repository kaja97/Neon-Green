import type { Config } from "tailwindcss";

const config: Config = {
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
        // Brand Colors
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
        // Surface Palette (Dark)
        surface: {
          primary: "#0a0f12",
          secondary: "#111827",
          tertiary: "#1e2736",
          elevated: "#283548",
        },
        // Text
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
          muted: "#64748b",
        },
        // Borders
        border: "#1e293b",

        // Aliases for shadcn/ui compatibility
        background: "#0a0f12",
        foreground: "#f1f5f9",
        card: "#111827",
        "card-foreground": "#f1f5f9",
        muted: "#1e293b",
        "muted-foreground": "#94a3b8",
        accent: "#1e2736",
        "accent-foreground": "#f1f5f9",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        input: "#1e293b",
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

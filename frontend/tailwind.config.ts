import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10b981", // emerald-500
          foreground: "#ffffff",
        },
        background: "#0f172a", // slate-900 for dark mode feel
        card: "#1e293b",
        foreground: "#f8fafc",
      },
    },
  },
  plugins: [],
};
export default config;

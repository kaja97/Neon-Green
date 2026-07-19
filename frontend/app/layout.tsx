import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgriFarm AI — Intelligent Farming Assistant",
  description:
    "AI-powered personalized farming assistant with weather tracking, soil analysis, crop planning, and market insights. Zero-cost AI, built for Sri Lankan farmers.",
  manifest: "/manifest.json",
  keywords: [
    "farming",
    "agriculture",
    "AI",
    "crop management",
    "weather",
    "soil analysis",
    "Sri Lanka",
  ],
  authors: [{ name: "AgriFarm AI" }],
  openGraph: {
    title: "AgriFarm AI — Intelligent Farming Assistant",
    description: "AI-powered personalized farming assistant",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// No-flash theme bootstrap: read persisted theme from localStorage BEFORE paint
// and stamp the correct class on <html>. Falls back to dark.
const themeBootstrap = `(function(){try{var s=localStorage.getItem('ui-storage');var t=s?JSON.parse(s).state?.theme:null;var c=(t==='light')?'light':'dark';var d=document.documentElement;d.classList.remove('dark','light');d.classList.add(c);}catch(e){document.documentElement.classList.add('dark');}})();`;

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-surface-primary text-text-primary`}
      >
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster position="top-right" theme="system" richColors />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

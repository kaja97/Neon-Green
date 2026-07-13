import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-surface-primary text-text-primary`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

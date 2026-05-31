import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import QueryProvider from "@/components/QueryProvider";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sprintprep — Coding Study Notes",
  description: "Save and review your programming solutions in C, C++, Java, and Python.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sprintprep",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full font-sans antialiased text-slate-900">
        <QueryProvider>
          {children}
          <BottomNav />
        </QueryProvider>
      </body>
    </html>
  );
}

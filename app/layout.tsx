import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppSidebar } from "@/components/AppSidebar";
import { PrototypeBanner } from "@/components/PrototypeBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EgoForge",
  description:
    "Egocentric manipulation data collection platform — Studio, Capture, EgoDB.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex h-screen flex-col overflow-hidden">
        <PrototypeBanner />
        <div className="flex min-h-0 flex-1">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Providers>{children}</Providers>
          </main>
        </div>
      </body>
    </html>
  );
}

"use client";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { seed } from "@/lib/seed";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seed().catch(console.error);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster position="bottom-right" richColors />
    </ThemeProvider>
  );
}

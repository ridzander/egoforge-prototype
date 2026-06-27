import { AppSidebar } from "@/components/AppSidebar";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { Providers } from "@/app/providers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <PrototypeBanner />
      <div className="flex min-h-0 flex-1">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Providers>{children}</Providers>
        </main>
      </div>
    </div>
  );
}

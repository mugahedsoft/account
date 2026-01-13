import { ReactNode } from "react";
import { Sidebar, MobileNav } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function Layout({ children }: { children: ReactNode }) {
  const isOnline = useOnlineStatus();

  return (
    <div
      className="min-h-screen bg-background flex font-sans text-right overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      dir="rtl"
    >
      <Sidebar />
      <main className="flex-1 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] lg:pb-0 overflow-x-hidden">
        {!isOnline && (
          <div className="sticky top-0 z-50">
            <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm font-medium">
              لا يوجد اتصال بالإنترنت — التطبيق يعمل بالوضع المحلي
            </div>
          </div>
        )}
        <div className="container max-w-7xl mx-auto px-3 py-4 sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
      <MobileNav />
      <Toaster />
    </div>
  );
}

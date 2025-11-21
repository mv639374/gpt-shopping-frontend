"use client";

import { useBackendStatus } from "@/hooks/useApi";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useBackendStatus();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <Sidebar />
      {/* Content area - always starts from left, header is fixed */}
      <main className="pt-16 min-h-screen">
        <div className="p-6 content-scroll max-h-[calc(100vh-4rem)] overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

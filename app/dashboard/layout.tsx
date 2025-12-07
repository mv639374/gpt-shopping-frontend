"use client";

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useBackendStatus } from "@/hooks/useApi";
import { Sidebar } from "@/components/Sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent>{children}</DashboardContent>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
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

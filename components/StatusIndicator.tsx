"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/useAppStore";
import { cn } from "@/lib/utils";

export function StatusIndicator() {
  const pathname = usePathname();
  const { backendConnected } = useAppStore();

  // Only show on the main page (not dashboard)
  if (pathname !== "/") {
    return null;
  }

  return (
    <div className="fixed top-6 left-6 z-50 flex items-center gap-3 bg-card/95 backdrop-blur-sm px-4 py-2 rounded-full border shadow-lg">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            backendConnected ? "status-dot-online" : "status-dot-offline"
          )}
        />
      </div>
      <span className="text-sm font-medium text-foreground">
        {backendConnected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}

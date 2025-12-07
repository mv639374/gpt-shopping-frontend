"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/store/useAppStore";

export function DashboardHeader() {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Fixed position toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="transition-all duration-300 hover:bg-accent shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="GPT Shopping Logo"
                width={40}
                height={40}
                className="rounded-lg"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                GPT Shopping
              </h1>
              <p className="text-xs text-muted-foreground">AEO & GEO Dashboard</p>
            </div>
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}

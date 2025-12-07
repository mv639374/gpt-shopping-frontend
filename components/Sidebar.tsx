"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Mail, MoreHorizontal, Settings, Link2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/dashboard/analytics",
  },
  {
    id: "citations",
    label: "Citation Analytics",
    icon: Link2,
    path: "/dashboard/citations",
  },
  {
    id: "contact",
    label: "Contact Us",
    icon: Mail,
    path: "/dashboard/contact",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/dashboard/settings",
  },
  {
    id: "more",
    label: "More",
    icon: MoreHorizontal,
    path: "/dashboard/more",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useAppStore();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r z-40"
        >
          <div className="flex flex-col h-full p-4">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground px-3">Dashboard Menu</h2>
            </div>

            <nav className="flex-1 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <Link key={item.id} href={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

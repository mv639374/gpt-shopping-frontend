import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  backendConnected: boolean;
  sidebarOpen: boolean;
  dashboardInitialized: boolean;
  selectedMarketplace: string;
  setBackendConnected: (connected: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setDashboardInitialized: (initialized: boolean) => void;
  setSelectedMarketplace: (marketplace: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      backendConnected: false,
      sidebarOpen: true,
      dashboardInitialized: false,
      selectedMarketplace: "amazon",
      setBackendConnected: (connected) => set({ backendConnected: connected }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setDashboardInitialized: (initialized) => set({ dashboardInitialized: initialized }),
      setSelectedMarketplace: (marketplace) => set({ selectedMarketplace: marketplace }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen,
        dashboardInitialized: state.dashboardInitialized,
        selectedMarketplace: state.selectedMarketplace,
      }),
    }
  )
);

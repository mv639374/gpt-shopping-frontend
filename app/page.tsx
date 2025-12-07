"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useBackendStatus } from "@/hooks/useApi";
import { useAppStore } from "@/store/useAppStore";

// const API_URL = 'https://gpt-shopping-backend-production.up.railway.app';
const API_URL = 'http://localhost:8000'

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing dashboard...");
  const { dashboardInitialized, setDashboardInitialized } = useAppStore();
  useBackendStatus();

  const handleEnterDashboard = async () => {
    setIsLoading(true);
    
    try {
      // Only load data if not already initialized
      if (!dashboardInitialized) {
        setLoadingMessage("Loading data from database...");
        
        // Call backend to load all data
        const response = await fetch(`${API_URL}/analytics/load-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        
        if (!response.ok) {
          throw new Error("Failed to load data");
        }
        
        await response.json();
        
        setLoadingMessage("Processing analytics...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        setDashboardInitialized(true);
      }
      
      router.push("/dashboard/analytics");
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setLoadingMessage("Error loading data. Please try again.");
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-8 text-center max-w-5xl"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
        >
          <BarChart3 className="w-12 h-12 text-white" />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-foreground tracking-tight">
            GPT Shopping Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Track and optimize product recommendations from ChatGPT and other LLMs.
            Master Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO).
          </p>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            onClick={handleEnterDashboard}
            className="gap-2 text-lg px-8 py-6 h-auto bg-primary hover:bg-primary/90 shadow-xl"
          >
            Enter Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            {
              icon: TrendingUp,
              title: "Real-time Tracking",
              description: "Monitor marketplace rankings across LLM platforms",
            },
            {
              icon: BarChart3,
              title: "Analytics & Insights",
              description: "Gain actionable insights from comprehensive data",
            },
            {
              icon: Zap,
              title: "Optimization Tools",
              description: "Improve your product visibility in AI responses",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="bg-card rounded-xl border p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

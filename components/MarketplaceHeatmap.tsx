"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface MarketplaceInfo {
  name: string;
  rank: number;
  score_norm: number;
  highlight: boolean;
}

interface CategoryData {
  category: string;
  marketplaces: MarketplaceInfo[];
  selected_marketplace_rank: number | null;
}

interface HeatmapProps {
  data: {
    categories: CategoryData[];
    selected_marketplace: string;
  };
}

export function MarketplaceHeatmap({ data }: HeatmapProps) {
  const router = useRouter();

  if (!data || !data.categories || data.categories.length === 0) {
    return null;
  }

  const handleHeatmapClick = () => {
    router.push("/dashboard/detailed-heatmap");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full h-full cursor-pointer"
      onClick={handleHeatmapClick}
    >
      <Card className="shadow-lg bg-gradient-to-br from-card to-muted/20 h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Rankings by Category</CardTitle>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="focus:outline-none" onClick={(e) => e.stopPropagation()}>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-sm">
                    Shows top 5 marketplaces for each product category. <strong className="text-red-500">Red cells</strong> indicate competitors at rank #1 where your selected marketplace is not #1. <strong>Click to view detailed heatmap.</strong>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription className="text-xs">
            Top 5 categories (ranks #1 to #5) • Selected: <span className="font-semibold text-primary">{data.selected_marketplace}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-2 font-semibold text-foreground bg-muted/50 w-1/4">
                    Category
                  </th>
                  {[1, 2, 3, 4, 5].map((rank) => (
                    <th
                      key={rank}
                      className="text-center p-2 font-semibold text-foreground bg-muted/50"
                    >
                      #{rank}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.categories.map((category, idx) => (
                  <motion.tr
                    key={category.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-2 font-medium text-foreground bg-muted/10">
                      <div className="truncate" title={category.category}>
                        {category.category}
                      </div>
                    </td>
                    {[1, 2, 3, 4, 5].map((rank) => {
                      const marketplace = category.marketplaces.find((m) => m.rank === rank);
                      
                      if (!marketplace) {
                        return (
                          <td key={rank} className="text-center p-2 text-muted-foreground bg-muted/5">
                            -
                          </td>
                        );
                      }

                      const isSelected =
                        marketplace.name.toLowerCase().trim() === data.selected_marketplace.toLowerCase().trim();

                      return (
                        <td
                          key={rank}
                          className={`text-center p-2 transition-all duration-200 ${
                            marketplace.highlight
                              ? "bg-red-100 dark:bg-red-900/40 font-bold text-red-700 dark:text-red-400 ring-2 ring-red-500/50"
                              : isSelected
                              ? "bg-primary/20 font-semibold text-primary ring-2 ring-primary/30"
                              : "text-foreground bg-card/50"
                          }`}
                        >
                          <div className="truncate" title={marketplace.name}>
                            {marketplace.name}
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

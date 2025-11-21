"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LowRankAnalysis } from "@/types";
import { cn } from "@/lib/utils";

interface LowRankAnalysisChartProps {
  data: LowRankAnalysis;
  onCategoryClick?: (category: string) => void;
}

const colorGradients = [
  "from-purple-500 to-purple-600",
  "from-violet-500 to-violet-600",
  "from-indigo-500 to-indigo-600",
  "from-blue-500 to-blue-600",
  "from-cyan-500 to-cyan-600",
  "from-teal-500 to-teal-600",
  "from-sky-500 to-sky-600",
];

export function LowRankAnalysisChart({ data, onCategoryClick }: LowRankAnalysisChartProps) {
  const maxProducts = Math.max(...data.top_low_rank_categories.map(c => c.low_rank_count), 1);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Low-Rank Analysis</CardTitle>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="focus:outline-none">
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">
                  Shows top categories where <strong>{data.marketplace}</strong> has the lowest rankings (rank &gt; {data.rank_threshold}). 
                  Higher bars indicate more products with poor rankings.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Top {data.top_low_rank_categories.length} categories with most low-ranked products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div 
            className="flex items-end gap-3 min-w-max" 
            style={{ paddingBottom: '60px', minHeight: '350px' }}
          >
            {data.top_low_rank_categories.map((category, idx) => {
              const barHeight = (category.low_rank_count / maxProducts) * 240;
              const gradient = colorGradients[idx % colorGradients.length];

              return (
                <motion.div
                  key={category.category}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex flex-col items-center justify-end cursor-pointer"
                  style={{ minWidth: '90px', height: '100%' }}
                  onClick={() => onCategoryClick?.(category.category)}
                >
                  {/* Label above bar */}
                  <div className="flex-none mb-2 text-center">
                    <p className="text-sm font-bold text-foreground">
                      {category.low_rank_count}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Avg: {category.avg_rank}
                    </p>
                  </div>

                  {/* Bar */}
                  <div className="group relative flex-none">
                    <div
                      className={cn(
                        "w-20 rounded-t-lg transition-all duration-200 hover:opacity-80 bg-gradient-to-b",
                        gradient
                      )}
                      style={{ height: `${barHeight}px`, minHeight: '30px' }}
                    />

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-popover border rounded-md p-2 shadow-lg z-10 whitespace-nowrap">
                      <p className="text-xs font-semibold">{category.category}</p>
                      <p className="text-xs text-muted-foreground">
                        Low rank: {category.low_rank_count}/{category.total_products} products
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Avg rank: {category.avg_rank}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.low_rank_percentage}% with low rank
                      </p>
                    </div>
                  </div>

                  {/* Category name below */}
                  <div className="flex flex-col items-center justify-start" style={{ height: '50px', marginTop: '8px' }}>
                    <div className="w-24 text-center">
                      <p className="text-xs font-medium text-foreground line-clamp-2" title={category.category}>
                        {category.category}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

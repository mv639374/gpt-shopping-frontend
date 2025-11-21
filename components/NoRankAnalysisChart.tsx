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
import type { NoRankAnalysis } from "@/types";
import { cn } from "@/lib/utils";

interface NoRankAnalysisChartProps {
  data: NoRankAnalysis;
  onCategoryClick?: (category: string) => void;
}

const colorGradients = [
  "from-red-500 to-red-600",
  "from-orange-500 to-orange-600",
  "from-amber-500 to-amber-600",
  "from-yellow-500 to-yellow-600",
  "from-lime-500 to-lime-600",
  "from-green-500 to-green-600",
  "from-emerald-500 to-emerald-600",
];

export function NoRankAnalysisChart({ data, onCategoryClick }: NoRankAnalysisChartProps) {
  const maxProducts = Math.max(...data.top_no_rank_categories.map(c => c.missing_products), 1);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>No-Rank Analysis</CardTitle>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="focus:outline-none">
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">
                  Shows top categories where <strong>{data.marketplace}</strong> is missing the most. 
                  Higher bars indicate more products without marketplace presence.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Top {data.top_no_rank_categories.length} categories with most missing products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div 
            className="flex items-end gap-3 min-w-max" 
            style={{ paddingTop: '30px', paddingLeft: '30px', minHeight: '50px' }}
          >
            {data.top_no_rank_categories.map((category, idx) => {
              const barHeight = (category.missing_products / maxProducts) * 240;
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
                      {category.missing_products}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ({category.missing_percentage}%)
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
                        Missing: {category.missing_products}/{category.total_products} products
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Present: {category.products_with_rank} products
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

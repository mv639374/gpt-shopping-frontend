"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CompetitorThreatAnalysis } from "@/types";
import { cn } from "@/lib/utils";

interface CompetitorThreatChartProps {
  data: CompetitorThreatAnalysis;
  onCompetitorClick?: (competitor: string) => void;
}

const colorGradients = [
  "from-red-500 to-red-600",
  "from-orange-500 to-orange-600",
  "from-amber-500 to-amber-600",
  "from-yellow-500 to-yellow-600",
  "from-lime-500 to-lime-600",
];

export function CompetitorThreatChart({ data, onCompetitorClick }: CompetitorThreatChartProps) {
  const maxCategories = Math.max(...data.top_competitors.map(c => c.categories_dominated), 1);

  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <CardTitle>Competitor Threat Analysis</CardTitle>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="focus:outline-none">
                  <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">
                  Shows top {data.top_competitors.length} competitors dominating most categories with rank #1 positions. 
                  Longer bars indicate higher threat level from competitors.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Top {data.top_competitors.length} marketplaces with most #1 rankings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.top_competitors.map((competitor, idx) => {
            const barWidth = (competitor.categories_dominated / maxCategories) * 100;
            const gradient = colorGradients[idx % colorGradients.length];
            
            // Determine if bar is too small for internal label (less than 25% width)
            const isSmallBar = barWidth < 25;

            return (
              <motion.div
                key={competitor.marketplace}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="cursor-pointer hover:bg-muted/20 p-2 rounded-lg transition-colors"
                onClick={() => onCompetitorClick?.(competitor.marketplace)}
              >
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className={cn(
                    "flex-none w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    idx === 0 ? "bg-red-500 text-white" :
                    idx === 1 ? "bg-orange-500 text-white" :
                    idx === 2 ? "bg-amber-500 text-white" :
                    "bg-muted text-foreground"
                  )}>
                    {idx + 1}
                  </div>

                  {/* Marketplace Name */}
                  <div className="flex-none w-32">
                    <p className="font-semibold text-foreground text-sm truncate" title={competitor.marketplace}>
                      {competitor.marketplace}
                    </p>
                  </div>

                  {/* Bar Chart */}
                  <div className="flex-1 relative">
                    <div className="relative h-10 bg-muted/30 rounded-md overflow-visible">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                        className={cn(
                          "h-full bg-gradient-to-r rounded-md relative group",
                          gradient
                        )}
                      >
                        {/* Label - inside bar if large, outside if small */}
                        {!isSmallBar ? (
                          // Label inside bar for large bars
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-bold text-white drop-shadow-md">
                              {competitor.categories_dominated} categories
                            </span>
                          </div>
                        ) : null}

                        {/* Tooltip */}
                        <div className="absolute left-1/2 bottom-full transform -translate-x-1/2 mb-2 hidden group-hover:block bg-popover border rounded-md p-2 shadow-lg z-10 whitespace-nowrap">
                          <p className="text-xs font-semibold">{competitor.marketplace}</p>
                          <p className="text-xs text-muted-foreground">
                            Dominates {competitor.categories_dominated} categories
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {competitor.dominance_percentage}% market dominance
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click to see categories
                          </p>
                        </div>
                      </motion.div>
                      
                      {/* Label outside bar for small bars */}
                      {isSmallBar && (
                        <div className="absolute left-0 top-0 h-full flex items-center pl-2" style={{ left: `${barWidth}%` }}>
                          <span className="text-sm font-semibold text-foreground ml-2 whitespace-nowrap">
                            {competitor.categories_dominated} categories
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Percentage */}
                  <div className="flex-none w-16 text-right">
                    <p className="text-sm font-bold text-foreground">
                      {competitor.dominance_percentage}%
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        {data.top_competitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 pt-4 border-t"
          >
            <p className="text-xs text-muted-foreground text-center">
              Showing top threats to <span className="font-semibold text-foreground">{data.marketplace}</span> across {data.total_categories} categories
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

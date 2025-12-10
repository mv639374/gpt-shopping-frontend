// ============================================
// File: components/citations/CategoryPerformanceMatrix.tsx
// REPLACE ENTIRE FILE - Added click navigation
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CategoryPerformanceMatrix } from '@/types/citations';

interface CategoryPerformanceMatrixProps {
  data: CategoryPerformanceMatrix[];
  onCategoryClick?: (category: string) => void;
  loading?: boolean;
}

const getHeatmapColor = (percentage: number) => {
  if (percentage >= 50) return 'bg-green-500 text-white';
  if (percentage >= 30) return 'bg-green-400 text-white';
  if (percentage >= 20) return 'bg-yellow-400 text-foreground';
  if (percentage >= 10) return 'bg-orange-400 text-foreground';
  if (percentage > 0) return 'bg-red-400 text-white';
  return 'bg-muted text-muted-foreground';
};

export function CategoryPerformanceMatrix({ data, onCategoryClick, loading }: CategoryPerformanceMatrixProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCategoryClick = (category: string) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
    // Navigate to category detail page
    router.push(`/citations/categories/${encodeURIComponent(category)}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Category Performance Matrix</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Heatmap: Low (1-3) = Best, Mid (4-7), High (8+), No Rank = Unlisted. Darker green = higher %.
                  Click any category to see detailed product comparison.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-0 overflow-x-auto max-h-[350px] overflow-y-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 bg-background z-20">
            <tr className="border-b">
              <th className="text-left py-1.5 px-2 font-semibold sticky left-0 bg-background z-10 text-xs">
                Category
              </th>
              <th className="text-center py-1.5 px-1 font-semibold text-[10px]">
                <div>Low</div>
                <div className="text-[9px] text-muted-foreground font-normal">(1-3)</div>
              </th>
              <th className="text-center py-1.5 px-1 font-semibold text-[10px]">
                <div>Mid</div>
                <div className="text-[9px] text-muted-foreground font-normal">(4-7)</div>
              </th>
              <th className="text-center py-1.5 px-1 font-semibold text-[10px]">
                <div>High</div>
                <div className="text-[9px] text-muted-foreground font-normal">(8+)</div>
              </th>
              <th className="text-center py-1.5 px-1 font-semibold text-[10px]">
                <div>None</div>
              </th>
              <th className="text-center py-1.5 px-1 font-semibold text-[10px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-muted/30 cursor-pointer transition-colors group"
                onClick={() => handleCategoryClick(item.product_category)}
              >
                <td className="py-1 px-2 font-medium sticky left-0 bg-background group-hover:bg-muted/30 z-10 text-xs truncate max-w-[120px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <span className="cursor-pointer group-hover:text-primary transition-colors">
                            {item.product_category}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.product_category}</p>
                        <p className="text-xs text-muted-foreground">Click to view all products →</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-1 px-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded px-1.5 py-0.5 text-center font-semibold text-[10px] transition-transform group-hover:scale-105 ${getHeatmapColor(
                            item.low_rank_percentage
                          )}`}
                        >
                          {item.low_rank_percentage}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.low_rank_count} products</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-1 px-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded px-1.5 py-0.5 text-center font-semibold text-[10px] transition-transform group-hover:scale-105 ${getHeatmapColor(
                            item.mid_rank_percentage
                          )}`}
                        >
                          {item.mid_rank_percentage}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.mid_rank_count} products</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-1 px-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded px-1.5 py-0.5 text-center font-semibold text-[10px] transition-transform group-hover:scale-105 ${getHeatmapColor(
                            item.high_rank_percentage
                          )}`}
                        >
                          {item.high_rank_percentage}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.high_rank_count} products</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-1 px-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded px-1.5 py-0.5 text-center font-semibold text-[10px] transition-transform group-hover:scale-105 ${getHeatmapColor(
                            item.no_rank_percentage
                          )}`}
                        >
                          {item.no_rank_percentage}%
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.no_rank_count} products</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-1 px-1 text-center font-semibold text-[10px]">
                  {item.total_products}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

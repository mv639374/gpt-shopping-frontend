// ============================================
// File: components/citations/CitationTypePerformance.tsx
// REPLACE ENTIRE FILE
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUp, TrendingDown } from 'lucide-react';
import type { CitationTypePerformance } from '@/types/citations';

interface CitationTypePerformanceProps {
  data: CitationTypePerformance[];
  onTypeClick?: (type: string) => void;
  loading?: boolean;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Company': 'hsl(221, 83%, 53%)',
    'UGC': 'hsl(142, 76%, 36%)',
    '3rd party media': 'hsl(24, 95%, 53%)',
    'marketplace': 'hsl(262, 83%, 58%)',
    'High trusted media': 'hsl(199, 89%, 48%)',
    'Unknown': 'hsl(0, 0%, 50%)',
  };
  return colors[category] || 'hsl(0, 0%, 50%)';
};

export function CitationTypePerformance({ data, onTypeClick, loading }: CitationTypePerformanceProps) {
  if (loading) {
    return (
      <Card className="h-[450px]">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-5 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow h-[450px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Citation Type Performance</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Shows distribution and effectiveness of different citation sources.
                  Lower avg rank = better impact on Amazon's position.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3 pb-3 pt-1">
        {data.map((item, index) => {
          const isGoodRank = item.avg_amazon_rank <= 3;
          const color = getCategoryColor(item.domain_category);
          
          return (
            <div
              key={index}
              className="space-y-1.5 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
              onClick={() => onTypeClick?.(item.domain_category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{item.domain_category}</span>
                  {isGoodRank ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-orange-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{item.percentage}%</span>
                  <span className={`font-semibold ${isGoodRank ? 'text-green-600' : 'text-orange-600'}`}>
                    Rank: {item.avg_amazon_rank}
                  </span>
                </div>
              </div>
              
              {/* Custom Progress Bar */}
              <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.citation_count.toLocaleString()} citations</span>
                <span>{item.total_responses.toLocaleString()} responses</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ============================================
// File: components/citations/ResponseCitationDensity.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, FileText, Award } from 'lucide-react';
import type { ResponseCitationDensity } from '@/types/citations';

interface ResponseCitationDensityProps {
  data: ResponseCitationDensity[];
  loading?: boolean;
}

const getDensityBadge = (density: number) => {
  if (density >= 5) return { label: 'Very High', variant: 'default' as const, color: 'text-green-600' };
  if (density >= 3) return { label: 'High', variant: 'secondary' as const, color: 'text-blue-600' };
  if (density >= 1) return { label: 'Medium', variant: 'outline' as const, color: 'text-orange-600' };
  return { label: 'Low', variant: 'outline' as const, color: 'text-gray-600' };
};

export function ResponseCitationDensity({ data, loading }: ResponseCitationDensityProps) {
  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow h-[400px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Response Citation Density</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Citations per 100 words of response. Higher density = more credible responses.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2 pt-0 pb-2">
        {data.slice(0, 15).map((item, index) => {
          const densityBadge = getDensityBadge(item.citations_per_100_words);
          const isTopPerformer = index < 3;
          
          return (
            <div
              key={index}
              className={`border rounded p-2 hover:shadow-sm transition-shadow ${
                isTopPerformer ? 'bg-green-50 dark:bg-green-950/10 border-green-300 dark:border-green-800' : ''
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {isTopPerformer && <Award className="h-3 w-3 text-green-600 flex-shrink-0" />}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-xs truncate cursor-pointer">
                          {item.product_name || item.brand_name}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.product_name || item.brand_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Badge variant={densityBadge.variant} className="text-[10px] px-1.5 py-0 h-5 ml-2">
                  {densityBadge.label}
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-1.5 mb-1.5">
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground">Density</div>
                  <div className={`text-xs font-bold ${densityBadge.color}`}>
                    {item.citations_per_100_words}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground">Citations</div>
                  <div className="text-xs font-semibold">{item.total_citations}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground">Words</div>
                  <div className="text-xs font-semibold">{item.response_word_count}</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-muted-foreground">Rank</div>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                    #{item.position_rank || 'N/A'}
                  </Badge>
                </div>
              </div>

              {/* Citation Snippets */}
              <div className="flex gap-1 flex-wrap">
                {item.citation_snippets?.slice(0, 3).map((snippet, idx) => (
                  <TooltipProvider key={idx}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="secondary" 
                          className="text-[9px] px-1.5 py-0 h-4 cursor-pointer"
                        >
                          {snippet.category}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-semibold">{snippet.domain}</p>
                        <p className="text-[10px] text-muted-foreground max-w-xs">
                          {snippet.text_snippet}...
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {item.citation_snippets?.length > 3 && (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                    +{item.citation_snippets.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

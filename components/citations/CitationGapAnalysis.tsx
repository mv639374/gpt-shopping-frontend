// ============================================
// File: components/citations/CitationGapAnalysis.tsx
// REPLACE ENTIRE FILE - Added click navigation
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, AlertTriangle, TrendingUp, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CitationGapAnalysis } from '@/types/citations';

interface CitationGapAnalysisProps {
  data: CitationGapAnalysis[];
  loading?: boolean;
}

const getGapSeverity = (gapScore: number) => {
  if (gapScore >= 50) return { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/10', label: 'Critical' };
  if (gapScore >= 30) return { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/10', label: 'High' };
  if (gapScore >= 15) return { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/10', label: 'Medium' };
  return { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/10', label: 'Low' };
};

export function CitationGapAnalysis({ data, loading }: CitationGapAnalysisProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card className="h-[450px]">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-full bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const handleDomainClick = (domain: string) => {
    router.push(`/citations/domains/${encodeURIComponent(domain)}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-[450px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Citation Gap Analysis</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Products with low Amazon rank + low citations. Gap Score = (Avg Citations - Current) × Rank Weight.
                  Click products or domains for details.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0 pb-2">
        <div className="grid grid-cols-2 gap-3 h-full">
          {/* LEFT: Gap Products */}
          <div className="border rounded overflow-hidden flex flex-col">
            <div className="bg-muted px-2 py-1.5 border-b flex-shrink-0">
              <h4 className="text-xs font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-600" />
                Products with Gaps ({data.length})
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {data.slice(0, 10).map((item, idx) => {
                const severity = getGapSeverity(item.gap_score);
                
                return (
                  <div
                    key={idx}
                    className={`border rounded p-2 ${severity.bg} cursor-pointer hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-semibold text-xs truncate cursor-pointer flex-1">
                              {item.product_name || item.brand_name}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{item.product_name || item.brand_name}</p>
                            <p className="text-xs text-muted-foreground">Click to view details</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Badge variant="outline" className={`text-[9px] px-1 py-0 h-4 ml-1 ${severity.color}`}>
                        {severity.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1 text-[9px]">
                      <div className="text-center">
                        <div className="text-muted-foreground">Rank</div>
                        <div className="font-bold text-red-600">#{item.amazon_rank}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Citations</div>
                        <div className="font-bold">{item.citation_count}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-muted-foreground">Gap</div>
                        <div className={`font-bold ${severity.color}`}>{item.gap_score}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Recommended Sources */}
          <div className="border rounded overflow-hidden flex flex-col">
            <div className="bg-muted px-2 py-1.5 border-b flex-shrink-0">
              <h4 className="text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                Recommended Citation Sources
              </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {data[0]?.recommended_sources?.map((source, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDomainClick(source.domain)}
                  className="border rounded p-2 hover:bg-muted/30 hover:shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium text-xs truncate cursor-pointer flex-1 group-hover:text-primary transition-colors">
                            {source.domain}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{source.domain}</p>
                          <p className="text-xs text-muted-foreground">Click to view domain details</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={
                        source.category === 'Company' ? 'default' :
                        source.category === '3rd party media' ? 'secondary' : 'outline'
                      }
                      className="text-[9px] px-1.5 py-0 h-4"
                    >
                      {source.category}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Used by <span className="font-semibold text-foreground">{source.usage_count}</span> top products
                    </span>
                  </div>
                </div>
              ))}
              
              {(!data[0]?.recommended_sources || data[0].recommended_sources.length === 0) && (
                <div className="text-xs text-muted-foreground text-center py-4">
                  No recommended sources available
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

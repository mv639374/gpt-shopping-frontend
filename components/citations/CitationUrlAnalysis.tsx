// ============================================
// File: components/citations/CitationUrlAnalysis.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, ExternalLink, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import type { CitationUrlAnalysis, UtmSourceDistribution } from '@/types/citations';

interface CitationUrlAnalysisProps {
  urlData: CitationUrlAnalysis[];
  utmData: UtmSourceDistribution[];
  loading?: boolean;
}

export function CitationUrlAnalysis({ urlData, utmData, loading }: CitationUrlAnalysisProps) {
  const [expandedUrl, setExpandedUrl] = useState<number | null>(null);

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

  const toggleExpand = (index: number) => {
    setExpandedUrl(expandedUrl === index ? null : index);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-[450px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Citation URL Analysis</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Most cited URLs and UTM tracking. Click to see full citation context.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0 pb-2 flex flex-col gap-3">
        {/* UTM Distribution Summary */}
        <div className="border rounded p-2 flex-shrink-0">
          <h4 className="text-xs font-semibold mb-1.5">UTM Source Distribution</h4>
          <div className="flex gap-1 flex-wrap">
            {utmData.slice(0, 6).map((utm, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5 h-5 cursor-pointer">
                      {utm.utm_source_name}: {utm.citation_count}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-semibold">{utm.utm_source_name}</p>
                      <p>Citations: {utm.citation_count} ({utm.percentage}%)</p>
                      <p>Domains: {utm.unique_domains}</p>
                      <p>Avg Rank: {utm.avg_product_rank}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        {/* Top URLs */}
        <div className="flex-1 overflow-y-auto space-y-1.5">
          <h4 className="text-xs font-semibold sticky top-0 bg-background pb-1">
            Top Cited URLs ({urlData.length})
          </h4>
          {urlData.slice(0, 15).map((item, index) => {
            const isExpanded = expandedUrl === index;
            
            return (
              <div
                key={index}
                className="border rounded overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div 
                  className="p-2 cursor-pointer hover:bg-muted/30"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Activity 
                        className={`h-3 w-3 flex-shrink-0 ${item.is_alive ? 'text-green-600' : 'text-red-600'}`} 
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs truncate cursor-pointer">
                              {item.citation_domain}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs max-w-xs break-all">{item.citation_url}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                        {item.total_citations}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[9px]">
                    {item.utm_source && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
                        UTM: {item.utm_source}
                      </Badge>
                    )}
                    <span className="text-muted-foreground">
                      {item.unique_products} products
                    </span>
                    <span className="text-muted-foreground">
                      Avg Rank: <span className="font-semibold text-foreground">{item.avg_product_rank}</span>
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-2 pb-2 pt-1 bg-muted/20 border-t">
                    <div className="mb-1.5">
                      <a 
                        href={item.citation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 break-all"
                      >
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        {item.citation_url}
                      </a>
                    </div>
                    {item.sample_citation_text && (
                      <div className="text-[10px] text-muted-foreground italic border-l-2 border-muted pl-2">
                        "{item.sample_citation_text}..."
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
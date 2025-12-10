// ============================================
// File: components/citations/CitationSourceAuthority.tsx
// REPLACE ENTIRE FILE - Added click navigation
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Award, Activity, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { CitationSourceAuthority } from '@/types/citations';

interface CitationSourceAuthorityProps {
  data: CitationSourceAuthority[];
  loading?: boolean;
}

const getAuthorityBadge = (score: number) => {
  if (score >= 1000) return { label: 'Elite', variant: 'default' as const, color: 'text-purple-600' };
  if (score >= 500) return { label: 'High', variant: 'secondary' as const, color: 'text-green-600' };
  if (score >= 200) return { label: 'Medium', variant: 'outline' as const, color: 'text-blue-600' };
  return { label: 'Emerging', variant: 'outline' as const, color: 'text-gray-600' };
};

export function CitationSourceAuthority({ data, loading }: CitationSourceAuthorityProps) {
  const router = useRouter();

  if (loading) {
    return (
      <Card className="h-[450px]">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded animate-pulse" />
          ))}
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
          <CardTitle className="text-base">Citation Source Authority</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Authority Score = (Citations × 100) / Avg Rank × Alive Rate. Higher = more valuable source.
                  Click any domain to see detailed analysis.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-1.5 pt-0 pb-2">
        {data.slice(0, 20).map((item, index) => {
          const authorityBadge = getAuthorityBadge(item.authority_score);
          const isTopTier = index < 3;
          
          return (
            <div
              key={index}
              onClick={() => handleDomainClick(item.citation_domain)}
              className={`border rounded p-2 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group ${
                isTopTier ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10 border-yellow-300 dark:border-yellow-800' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {isTopTier && <Award className="h-3 w-3 text-yellow-600 flex-shrink-0" />}
                  <span className="text-[10px] font-bold text-muted-foreground">#{index + 1}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold text-xs truncate cursor-pointer group-hover:text-primary transition-colors">
                          {item.citation_domain}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{item.citation_domain}</p>
                        <p className="text-xs text-muted-foreground">Click to view domain details</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 ml-auto" />
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Badge variant={authorityBadge.variant} className="text-[9px] px-1.5 py-0 h-4">
                    {authorityBadge.label}
                  </Badge>
                  <span className={`text-xs font-bold ${authorityBadge.color}`}>
                    {Math.round(item.authority_score)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[9px]">
                <div className="text-center">
                  <div className="text-muted-foreground">Citations</div>
                  <div className="font-semibold">{item.total_citations}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Avg Rank</div>
                  <div className="font-semibold text-green-600">{item.avg_rank_when_cited}</div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Alive</div>
                  <div className="font-semibold flex items-center justify-center gap-0.5">
                    <Activity className={`h-2.5 w-2.5 ${item.alive_rate > 80 ? 'text-green-600' : 'text-orange-600'}`} />
                    {item.alive_rate}%
                  </div>
                </div>
                <div className="text-center">
                  <Badge 
                    variant={
                      item.domain_category === 'Company' ? 'default' :
                      item.domain_category === '3rd party media' ? 'secondary' : 'outline'
                    }
                    className="text-[8px] px-1 py-0 h-3.5"
                  >
                    {item.domain_category}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

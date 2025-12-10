// ============================================
// File: components/citations/CompetitorCitationComparison.tsx
// REPLACE ENTIRE FILE - COMPACT VERSION
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import type { CompetitorCitationComparison } from '@/types/citations';

interface CompetitorCitationComparisonProps {
  data: CompetitorCitationComparison[];
  loading?: boolean;
}

const MARKETPLACE_COLORS: Record<string, string> = {
  'Amazon': 'hsl(24, 95%, 53%)',
  'Flipkart': 'hsl(221, 83%, 53%)',
  'Croma': 'hsl(262, 83%, 58%)',
  'Myntra': 'hsl(339, 82%, 56%)',
  'Tata': 'hsl(199, 89%, 48%)',
};

const getMarketplaceColor = (marketplace: string) => {
  const key = Object.keys(MARKETPLACE_COLORS).find(k => 
    marketplace.toLowerCase().includes(k.toLowerCase())
  );
  return key ? MARKETPLACE_COLORS[key] : 'hsl(0, 0%, 60%)';
};

export function CompetitorCitationComparison({ data, loading }: CompetitorCitationComparisonProps) {
  const chartData = data.slice(0, 8).map(item => ({
    name: item.marketplace.length > 12 ? item.marketplace.slice(0, 10) + '...' : item.marketplace,
    fullName: item.marketplace,
    citations: item.citation_count,
    products: item.product_count,
    avgCitations: item.avg_citations_per_product,
    topRanks: item.top_rank_count,
  }));

  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-full bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const topPerformer = data[0];

  return (
    <Card className="hover:shadow-lg transition-shadow h-[400px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Competitor Comparison</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Citations across marketplaces. Shows which platforms get most AI mentions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0 pb-2 overflow-hidden">
        {/* Top Performer - Compact */}
        {topPerformer && (
          <div className="mb-2 p-2 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded border border-green-200 dark:border-green-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-3 w-3 text-green-600" />
                <span className="font-semibold text-xs">{topPerformer.marketplace}</span>
              </div>
              <div className="flex gap-1.5">
                <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">
                  {topPerformer.citation_count}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  #{topPerformer.top_rank_count}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Compact Bar Chart */}
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={50}
                tick={{ fontSize: 9 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 9 }}
                stroke="hsl(var(--muted-foreground))"
                width={30}
              />
              <RechartsTooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded p-2 shadow-xl">
                        <p className="font-semibold text-xs mb-1">{data.fullName}</p>
                        <div className="space-y-0.5 text-[10px] text-muted-foreground">
                          <p>Citations: <span className="font-medium text-foreground">{data.citations}</span></p>
                          <p>Products: <span className="font-medium text-foreground">{data.products}</span></p>
                          <p>Avg: <span className="font-medium text-foreground">{data.avgCitations}</span></p>
                          <p>Top Ranks: <span className="font-medium text-green-600">{data.topRanks}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="citations" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getMarketplaceColor(entry.fullName)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compact Stats Table */}
        <div className="mt-2 border rounded overflow-hidden flex-shrink-0">
          <table className="w-full text-[10px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left py-1 px-1.5 font-semibold">Market</th>
                <th className="text-center py-1 px-1 font-semibold">Prod</th>
                <th className="text-center py-1 px-1 font-semibold">Avg</th>
                <th className="text-center py-1 px-1 font-semibold">Top</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 4).map((item, index) => (
                <tr key={index} className="border-t hover:bg-muted/30">
                  <td className="py-0.5 px-1.5 font-medium truncate max-w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer">{item.marketplace}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{item.marketplace}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="py-0.5 px-1 text-center">{item.product_count}</td>
                  <td className="py-0.5 px-1 text-center font-semibold">{item.avg_citations_per_product}</td>
                  <td className="py-0.5 px-1 text-center">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                      {item.top_rank_count}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

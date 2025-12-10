// ============================================
// File: components/citations/TemporalCitationTrends.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TemporalCitationTrend } from '@/types/citations';

interface TemporalCitationTrendsProps {
  data: TemporalCitationTrend[];
  loading?: boolean;
}

export function TemporalCitationTrends({ data, loading }: TemporalCitationTrendsProps) {
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

  // Format data for chart
  const chartData = data.map(item => ({
    date: new Date(item.time_period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: item.time_period,
    total: item.total_citations,
    company: item.company_citations,
    thirdParty: item.third_party_citations,
    ugc: item.ugc_citations,
    products: item.unique_products,
    avgPerProduct: item.avg_citations_per_product,
  }));

  // Calculate trend
  const trend = data.length >= 2 
    ? ((data[data.length - 1].total_citations - data[0].total_citations) / data[0].total_citations * 100).toFixed(1)
    : '0';

  return (
    <Card className="hover:shadow-lg transition-shadow h-[400px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Temporal Citation Trends</CardTitle>
            {data.length >= 2 && (
              <span className={`text-xs font-semibold ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(trend) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(trend))}%
              </span>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Citation volume over time by source type. Shows if your citation strategy is improving.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 pt-0 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded p-2 shadow-xl">
                      <p className="font-semibold text-xs mb-1">{data.fullDate}</p>
                      <div className="space-y-0.5 text-[10px]">
                        <p className="text-foreground font-semibold">Total: {data.total}</p>
                        <p className="text-blue-600">Company: {data.company}</p>
                        <p className="text-green-600">3rd Party: {data.thirdParty}</p>
                        <p className="text-purple-600">UGC: {data.ugc}</p>
                        <p className="text-muted-foreground">Products: {data.products}</p>
                        <p className="text-muted-foreground">Avg/Product: {data.avgPerProduct}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px' }}
              iconSize={8}
            />
            <Line 
              type="monotone" 
              dataKey="company" 
              stroke="hsl(221, 83%, 53%)" 
              strokeWidth={2}
              name="Company"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="thirdParty" 
              stroke="hsl(142, 76%, 36%)" 
              strokeWidth={2}
              name="3rd Party"
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="ugc" 
              stroke="hsl(262, 83%, 58%)" 
              strokeWidth={2}
              name="UGC"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

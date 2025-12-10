// ============================================
// File: components/citations/CitationKPICards.tsx
// ============================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon, TrendingUp, Target, Award, Activity } from 'lucide-react';
import type { CitationOverviewKPIs } from '@/types/citations';

interface CitationKPICardsProps {
  kpis: CitationOverviewKPIs | null;
  loading?: boolean;
}

export function CitationKPICards({ kpis, loading }: CitationKPICardsProps) {
  const cards = [
    {
      title: 'Total Citations',
      value: kpis?.total_citations?.toLocaleString() || '0',
      icon: Activity,
      tooltip: 'Total number of citations across all ChatGPT responses in the dataset',
      color: 'text-blue-600',
    },
    {
      title: 'Amazon Citations',
      value: `${kpis?.amazon_citations?.toLocaleString() || '0'} (${kpis?.amazon_citation_percentage || 0}%)`,
      icon: Target,
      tooltip: 'Citations specifically mentioning or linking to Amazon products/pages',
      color: 'text-orange-600',
    },
    {
      title: 'Citation Coverage',
      value: `${kpis?.citation_coverage_percentage || 0}%`,
      icon: Award,
      tooltip: 'Percentage of responses that include at least one citation',
      color: 'text-green-600',
    },
    {
      title: 'Avg Citations/Response',
      value: kpis?.avg_citations_per_response?.toFixed(1) || '0.0',
      icon: TrendingUp,
      tooltip: 'Average number of citations per ChatGPT response',
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{card.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${card.color}`} />
                <div className="text-2xl font-bold">{card.value}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

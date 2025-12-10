'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InfoIcon, AlertTriangle, Target } from 'lucide-react';
import type { CitationSentimentImpact } from '@/types/citations';
import { SentimentDetailModal } from './SentimentDetailModal';

interface CitationSentimentImpactProps {
  data: CitationSentimentImpact[];
  loading?: boolean;
}

const getSentimentStyle = (sentiment: string) => {
  const s = sentiment?.toLowerCase() ?? '';
  if (s === 'positive')
    return {
      label: 'Positive',
      bar: 'bg-green-500',
      text: 'text-green-600',
      border: 'border-green-200',
    };
  if (s === 'negative')
    return {
      label: 'Negative',
      bar: 'bg-red-500',
      text: 'text-red-600',
      border: 'border-red-200',
    };
  return {
    label: 'Neutral',
    bar: 'bg-gray-400',
    text: 'text-gray-600',
    border: 'border-gray-200',
  };
};

export function CitationSentimentImpact({
  data,
  loading,
}: CitationSentimentImpactProps) {
  const [selectedSentiment, setSelectedSentiment] =
    useState<CitationSentimentImpact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  if (loading) {
    return (
      <Card className="h-[450px]">
        <CardHeader className="pb-2">
          <div className="h-6 bg-muted rounded w-40 animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[450px]">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Sentiment Impact on Rankings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[380px] text-muted-foreground text-sm">
          No sentiment data available.
        </CardContent>
      </Card>
    );
  }

  const totalCitations = data.reduce(
    (sum, item) => sum + (item.citation_count ?? 0),
    0,
  );

  const handleClick = (item: CitationSentimentImpact) => {
    setSelectedSentiment(item);
    setModalOpen(true);
  };

  // Ensure we always show in order Positive, Neutral, Negative if present
  const ordered = ['Positive', 'Neutral', 'Negative']
    .map((label) => data.find((d) => d.sentiment_category === label))
    .filter(Boolean) as CitationSentimentImpact[];

  return (
    <>
      <Card className="h-[450px] flex flex-col">
        <CardHeader className="pb-1 flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                Sentiment Impact on Rankings
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p className="text-xs">
                      Distribution of citations by sentiment and how they map to
                      Amazon rankings. Click a row for product-level details.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="outline" className="text-xs">
              {totalCitations} citations
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between pt-2 pb-3">
          <div className="space-y-3">
            {ordered.map((item) => {
              const style = getSentimentStyle(item.sentiment_category);
              const share =
                totalCitations > 0
                  ? (item.citation_count / totalCitations) * 100
                  : 0;
              const issues =
                (item.low_rank_products ?? 0) + (item.no_rank_products ?? 0);

              return (
                <button
                  key={item.sentiment_category}
                  type="button"
                  onClick={() => handleClick(item)}
                  className={`w-full rounded-lg border ${style.border} hover:border-primary/60 hover:shadow-sm transition-colors px-3 py-2 text-left bg-background flex flex-col gap-1.5`}
                >
                  {/* Top row: label + small stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.text} bg-muted`}
                      >
                        {style.label}
                      </span>
                      {issues > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-5 px-1.5 text-[11px] flex items-center gap-1"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {issues} at risk
                        </Badge>
                      )}
                      <span className="text-[11px] text-muted-foreground">
                        {item.products_affected} products
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-muted-foreground">
                        {item.citation_count} cites
                      </span>
                      <span className="font-medium">
                        {item.percentage?.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Middle row: horizontal impact bar */}
                  <div className="relative h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`${style.bar} h-full opacity-70`}
                      style={{ width: `${share}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] font-medium">
                        Citation share vs other sentiments
                      </span>
                    </div>
                  </div>

                  {/* Bottom row: compact 3 metrics */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] mt-0.5">
                    <div className="text-center">
                      <div className={`${style.text} font-semibold`}>
                        {item.avg_amazon_rank != null
                          ? item.avg_amazon_rank.toFixed(1)
                          : 'N/A'}
                      </div>
                      <div className="text-muted-foreground">Avg rank</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600">
                        {item.low_rank_products ?? 0}
                      </div>
                      <div className="text-muted-foreground">Rank 8+</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-red-600">
                        {item.no_rank_products ?? 0}
                      </div>
                      <div className="text-muted-foreground">No rank</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-orange-600" />
              <span>Click any sentiment row to drill into products.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedSentiment && (
        <SentimentDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sentimentData={selectedSentiment}
        />
      )}
    </>
  );
}

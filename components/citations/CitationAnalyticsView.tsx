// ============================================
// File: components/citations/CitationAnalyticsView.tsx
// REPLACE ENTIRE FILE - Updated layout with 40/60 split
// ============================================

'use client';

import { useState, useCallback } from 'react';
import { 
  useCitationAnalytics,
  useCitationSentimentImpact,
  useCategoryPerformanceMatrix,
  useCompetitorCitationComparison,
  useCitationFlowData,
  useResponseCitationDensity,
  useFilterOptions,
  useCitationGapAnalysis,
  useCitationSourceAuthority,
  useTemporalCitationTrends,
  useCitationUrlAnalysis,
  useUtmSourceDistribution,
} from '@/hooks/useCitationAnalytics';
import { CitationKPICards } from './CitationKPICards';
import { DomainDistributionChart } from './DomainDistributionChart';
import { CitationSentimentImpact } from './CitationSentimentImpact';
import { CategoryPerformanceMatrix } from './CategoryPerformanceMatrix';
import { CompetitorCitationComparison } from './CompetitorCitationComparison';
import { PromptTypeFilters } from './PromptTypeFilters';
import { CitationFlowDiagram } from './CitationFlowDiagram';
import { ResponseCitationDensity } from './ResponseCitationDensity';
import { CitationGapAnalysis } from './CitationGapAnalysis';
import { CitationSourceAuthority } from './CitationSourceAuthority';
import { TemporalCitationTrends } from './TemporalCitationTrends';
import { CitationUrlAnalysis } from './CitationUrlAnalysis';
import type { CitationFilters } from '@/types/citations';

export function CitationAnalyticsView() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [phase4Filters, setPhase4Filters] = useState<CitationFilters>({});
  
  // Phase 1 hooks
  const { kpis, domainDistribution, loading: phase1Loading, error: phase1Error } = useCitationAnalytics();
  
  // Phase 2 hooks
  const { data: sentimentImpact, loading: sentimentLoading } = useCitationSentimentImpact();

  // Phase 3 hooks
  const { data: categoryMatrix, loading: matrixLoading } = useCategoryPerformanceMatrix();
  const { data: competitorData, loading: competitorLoading } = useCompetitorCitationComparison(selectedCategory);

  // Phase 4 hooks
  const { data: filterOptions, loading: filterLoading } = useFilterOptions();
  const { data: flowData, loading: flowLoading } = useCitationFlowData(phase4Filters);
  const { data: densityData, loading: densityLoading } = useResponseCitationDensity(15);

  // Phase 5 hooks
  const { data: gapAnalysis, loading: gapLoading } = useCitationGapAnalysis(8, 20);
  const { data: sourceAuthority, loading: authorityLoading } = useCitationSourceAuthority(30);
  const { data: temporalTrends, loading: trendsLoading } = useTemporalCitationTrends(7);
  const { data: urlAnalysis, loading: urlLoading } = useCitationUrlAnalysis(50);
  const { data: utmDistribution, loading: utmLoading } = useUtmSourceDistribution();

  const handleDomainClick = (domain: string) => {
    console.log('Domain clicked:', domain);
  };

  const handleCategoryClick = (category: string) => {
    console.log('Category clicked:', category);
    setSelectedCategory(category);
  };

  const handleFlowNodeClick = (nodeName: string) => {
    console.log('Flow node clicked:', nodeName);
  };

  const handleFiltersChange = useCallback((filters: CitationFilters) => {
    setPhase4Filters({
      category: filters.category === '__all__' ? undefined : filters.category,
      marketplace: filters.marketplace === '__all__' ? undefined : filters.marketplace,
    });
  }, []);

  if (phase1Error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive rounded-lg">
        <h3 className="text-lg font-semibold text-destructive">Error Loading Citation Analytics</h3>
        <p className="text-sm mt-2">{phase1Error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PHASE 1: Overview - Updated Layout 40/60 */}
      <div className="space-y-6">
        <CitationKPICards kpis={kpis} loading={phase1Loading} />
        
        {/* 40% Donut Chart + 60% Sentiment Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <DomainDistributionChart
              data={domainDistribution}
              onDomainClick={handleDomainClick}
              loading={phase1Loading}
            />
          </div>
          <div className="lg:col-span-3">
            <CitationSentimentImpact
              data={sentimentImpact}
              loading={sentimentLoading}
            />
          </div>
        </div>
      </div>

      {/* PHASE 3: Product Category Deep Dive */}
      <div className="space-y-4 mt-6">
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold mb-1">Product Category Deep Dive</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Category-specific citation patterns and competitive analysis
            {selectedCategory && (
              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                Filtered: {selectedCategory}
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryPerformanceMatrix
            data={categoryMatrix}
            onCategoryClick={handleCategoryClick}
            loading={matrixLoading}
          />
          <CompetitorCitationComparison
            data={competitorData}
            loading={competitorLoading}
          />
        </div>
      </div>

      {/* PHASE 4: Prompt-to-Citation Journey */}
      <div className="space-y-4 mt-6">
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold mb-1">Prompt-to-Citation Journey</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Trace the path from product category → citation → marketplace rank
          </p>
        </div>

        <PromptTypeFilters
          filterOptions={filterOptions}
          onFiltersChange={handleFiltersChange}
          loading={filterLoading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <CitationFlowDiagram
              data={flowData}
              onNodeClick={handleFlowNodeClick}
              loading={flowLoading}
            />
          </div>
          <div className="lg:col-span-1">
            <ResponseCitationDensity
              data={densityData}
              loading={densityLoading}
            />
          </div>
        </div>
      </div>

      {/* PHASE 5: Advanced Citation Intelligence */}
      <div className="space-y-4 mt-6">
        <div className="border-t pt-4">
          <h3 className="text-xl font-bold mb-1">Advanced Citation Intelligence</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Actionable insights and recommendations for citation strategy optimization
          </p>
        </div>

        {/* 5.1 & 5.2: Gap Analysis + Source Authority */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CitationGapAnalysis
            data={gapAnalysis}
            loading={gapLoading}
          />
          <CitationSourceAuthority
            data={sourceAuthority}
            loading={authorityLoading}
          />
        </div>

        {/* 5.3 & 5.4: Temporal Trends + URL Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TemporalCitationTrends
            data={temporalTrends}
            loading={trendsLoading}
          />
          <CitationUrlAnalysis
            urlData={urlAnalysis}
            utmData={utmDistribution}
            loading={urlLoading || utmLoading}
          />
        </div>
      </div>
    </div>
  );
}

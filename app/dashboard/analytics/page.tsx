"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useApi } from "@/hooks/useApi";
import { MarketplaceSelector } from "@/components/MarketplaceSelector";
import { KPICard } from "@/components/KPICard";
import { MarketplaceHeatmap } from "@/components/MarketplaceHeatmap";
import { NoRankAnalysisChart } from "@/components/NoRankAnalysisChart";
import { CompetitorThreatChart } from "@/components/CompetitorThreatChart";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Eye, Trophy, TrendingUp, Target } from "lucide-react";
import type { MarketplaceAnalytics, NoRankAnalysis, CompetitorThreatAnalysis } from "@/types";
import { CitationAnalyticsView } from '@/components/citations/CitationAnalyticsView';

export default function AnalyticsPage() {
  const { selectedMarketplace } = useAppStore();
  const [loadedMarketplaces, setLoadedMarketplaces] = useState<Set<string>>(new Set());
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  
  const { data, loading, fetchData } = useApi<MarketplaceAnalytics>(
    `/analytics/marketplace/${selectedMarketplace}`
  );

  const { data: noRankData, fetchData: fetchNoRank } = useApi<NoRankAnalysis>(
    `/analytics/no-rank-analysis/${selectedMarketplace}`
  );

  const { data: competitorData, fetchData: fetchCompetitor } = useApi<CompetitorThreatAnalysis>(
    `/analytics/competitor-threat/${selectedMarketplace}`
  );

  useEffect(() => {
    const marketplaceLower = selectedMarketplace.toLowerCase();
    
    if (loadedMarketplaces.has(marketplaceLower)) {
      fetchData();
      fetchNoRank();
      fetchCompetitor();
    } else {
      setIsLoadingMarketplace(true);
      Promise.all([fetchData(), fetchNoRank(), fetchCompetitor()]).then(() => {
        setLoadedMarketplaces((prev) => new Set(prev).add(marketplaceLower));
        setIsLoadingMarketplace(false);
      });
    }
  }, [selectedMarketplace, fetchData, fetchNoRank, fetchCompetitor]);

  if (isLoadingMarketplace) {
    return <LoadingSpinner message={`Loading analytics for ${selectedMarketplace}...`} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive AEO/GEO insights and marketplace performance metrics
        </p>
      </motion.div>

      {/* Marketplace Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <MarketplaceSelector />
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">'{selectedMarketplace}'</span> is selected
        </p>
      </motion.div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* KPI Cards and Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="grid grid-cols-2 gap-3">
              <KPICard
                title="Visibility Score"
                value={data.kpis.visibility_score.percentage}
                subtitle={`${data.kpis.visibility_score.present_in}/${data.kpis.visibility_score.total_categories} categories`}
                icon={Eye}
                color="text-blue-600"
                bgColor="bg-blue-50 dark:bg-blue-950"
                delay={0.2}
                isPercentage={true}
              />
              <KPICard
                title="Market Leadership"
                value={data.kpis.market_leadership.percentage}
                subtitle={`#1 in ${data.kpis.market_leadership.rank_1_count} categories`}
                icon={Trophy}
                color="text-yellow-600"
                bgColor="bg-yellow-50 dark:bg-yellow-950"
                delay={0.25}
                isPercentage={true}
              />
              <KPICard
                title="Average Ranking"
                value={data.kpis.avg_ranking.value}
                subtitle={data.kpis.avg_ranking.rating}
                icon={TrendingUp}
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-950"
                delay={0.3}
                isPercentage={false}
              />
              <KPICard
                title="Opportunity Gap"
                value={data.kpis.opportunity_gap.percentage}
                subtitle={`${data.kpis.opportunity_gap.categories_not_rank1} categories`}
                icon={Target}
                color="text-red-600"
                bgColor="bg-red-50 dark:bg-red-950"
                delay={0.35}
                isPercentage={true}
              />
            </div>

            <div className="h-full flex items-stretch">
              <MarketplaceHeatmap data={data.heatmap} />
            </div>
          </div>

          {/* Analysis Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* No-Rank Analysis */}
            {noRankData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <NoRankAnalysisChart 
                  data={noRankData}
                  onCategoryClick={(category) => {
                    console.log("No-rank category clicked:", category);
                    // TODO: Navigate to detailed no-rank analysis page
                  }}
                />
              </motion.div>
            )}

            {/* Competitor Threat Analysis */}
            {competitorData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <CompetitorThreatChart 
                  data={competitorData}
                  onCompetitorClick={(competitor) => {
                    console.log("Competitor clicked:", competitor);
                    // TODO: Navigate to competitor comparison page
                  }}
                />
              </motion.div>
            )}
          </div>
        </>
      ) : null}



            {/* Add Citation Analytics Section */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Citation Analytics</h2>
          <p className="text-muted-foreground mt-2">
            Deep dive into how citations influence Amazon's ranking in ChatGPT recommendations
          </p>
        </div>
        <CitationAnalyticsView />
      </section>
    </div>
  );
}

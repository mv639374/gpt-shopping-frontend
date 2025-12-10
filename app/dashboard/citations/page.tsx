'use client'

import React, { useState, Suspense } from 'react'
import { useBrandStore } from '@/store/brandStore'
import { useCitationMetrics } from '@/hooks/useCitationMetrics'
import { useSourceCitations } from '@/hooks/useSourceCitations'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DomainCategoryPieChart } from '@/components/charts/DomainCategoryPieChart'
import { UnifiedSourceTable } from '@/components/charts/UnifiedSourceTable'
import { Globe, Link as LinkIcon, Percent, Info, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import AmazonAnalytics from './AmazonAnalytics'

export default function Citations() {
  const { currentBrandId, getCurrentBrand } = useBrandStore()
  const [citationType, setCitationType] = useState<'all' | 'referring'>('all')
  
  // Get current brand to access domain
  const currentBrand = getCurrentBrand()
  
  // Get citation metrics for summary stats
  const { data: citationMetrics, isLoading: citationMetricsLoading } = useCitationMetrics({
    parentBrandId: currentBrandId,
    minCitations: 1
  })

  // Get source citation metrics from brand mentions
  const { data: sourceCitationMetrics, isLoading: sourceCitationsLoading } = useSourceCitations({
    parentBrandId: currentBrandId
  })

  // Log brand-specific citation data to console
  React.useEffect(() => {
    if (citationMetrics?.brandSpecific) {
      console.log('📊 Brand-Specific Citations Data:', {
        totalCitations: citationMetrics.brandSpecific.totalCitations,
        totalDomains: citationMetrics.brandSpecific.totalDomains,
        responsesWithBrandMentions: citationMetrics.brandSpecific.totalResponses
      })
    }
  }, [citationMetrics])

  // Helper function to normalize domain for comparison
  const normalizeDomain = (domain: string) => domain.toLowerCase().replace(/^www\./, '')

  // For referring citations: merge source citations with parent brand domain from overall citations
  // For the parent brand's own domain, overall citation data is more accurate
  const mergedReferringDomainData = React.useMemo(() => {
    if (!sourceCitationMetrics?.domainStats) return []
    if (!currentBrand?.domain || !citationMetrics?.overall?.leaderboard) {
      return sourceCitationMetrics.domainStats
    }
    
    const parentDomain = normalizeDomain(currentBrand.domain)
    
    // Filter out parent domain from source citations (we'll replace it with overall data)
    const sourceDataWithoutParent = sourceCitationMetrics.domainStats.filter(
      stat => normalizeDomain(stat.domain) !== parentDomain
    )
    
    // Find parent domain in overall citations
    const parentDomainFromOverall = citationMetrics.overall.leaderboard.find(
      entry => normalizeDomain(entry.domain) === parentDomain
    )
    
    // If parent domain exists in overall, add it; otherwise just return source data
    if (parentDomainFromOverall) {
      console.log('🔄 Merging parent domain citations:', {
        parentDomain,
        sourceCitations: sourceCitationMetrics.domainStats.find(s => normalizeDomain(s.domain) === parentDomain)?.citationCount || 0,
        overallCitations: parentDomainFromOverall.citationCount,
        message: `Replacing ${parentDomain} source citations with more accurate overall data`
      })
      
      // Convert to DomainSourceStats format
      const parentAsDomainStat = {
        domain: parentDomainFromOverall.domain,
        citationCount: parentDomainFromOverall.citationCount,
        uniqueBrands: 0,
        brandNames: [],
        urls: [],
        urlDetails: [],
        platforms: parentDomainFromOverall.platforms || [],
        regions: parentDomainFromOverall.regions || [],
        recentCitation: parentDomainFromOverall.recentCitation,
        sentimentDistribution: { positive: 0, negative: 0, neutral: 0 },
        avgPosition: 0,
        domainCategory: parentDomainFromOverall.domainCategory
      }
      return [parentAsDomainStat, ...sourceDataWithoutParent]
    }
    
    return sourceDataWithoutParent
  }, [sourceCitationMetrics?.domainStats, currentBrand?.domain, citationMetrics?.overall?.leaderboard])

  const mergedReferringPageData = React.useMemo(() => {
    if (!sourceCitationMetrics?.domainStats) return []
    if (!currentBrand?.domain || !citationMetrics?.overall?.topCitationPages) {
      // Return source citation pages
      return sourceCitationMetrics.domainStats.flatMap(stat => 
        (stat.urlDetails || []).map((urlDetail, idx) => ({
          id: `${stat.domain}-${idx}`,
          url: urlDetail.url,
          title: null,
          description: null,
          domain: stat.domain,
          citationCount: urlDetail.citationCount,
          domainCategory: stat.domainCategory || 'Unknown',
          citationType: null,
          utmSource: null,
          isAlive: null,
          createdAt: stat.recentCitation || new Date().toISOString(),
          text: null
        }))
      )
    }
    
    const parentDomain = normalizeDomain(currentBrand.domain)
    
    // Get pages from source citations excluding parent domain
    const sourcePagesWithoutParent = sourceCitationMetrics.domainStats
      .filter(stat => normalizeDomain(stat.domain) !== parentDomain)
      .flatMap(stat => 
        (stat.urlDetails || []).map((urlDetail, idx) => ({
          id: `${stat.domain}-${idx}`,
          url: urlDetail.url,
          title: null,
          description: null,
          domain: stat.domain,
          citationCount: urlDetail.citationCount,
          domainCategory: stat.domainCategory || 'Unknown',
          citationType: null,
          utmSource: null,
          isAlive: null,
          createdAt: stat.recentCitation || new Date().toISOString(),
          text: null
        }))
      )
    
    // Get pages from overall citations for parent domain
    const parentPagesFromOverall = citationMetrics.overall.topCitationPages.filter(
      page => normalizeDomain(page.domain) === parentDomain
    )
    
    return [...parentPagesFromOverall, ...sourcePagesWithoutParent]
  }, [sourceCitationMetrics?.domainStats, currentBrand?.domain, citationMetrics?.overall?.topCitationPages])

  // Calculate citation rate (YOUR brand's source citations / total brand-specific citations * 100)
  // This shows what percentage of citations in brand-mentioning responses are source citations for YOUR brand
  const citationRate = citationMetrics?.brandSpecific?.totalCitations && sourceCitationMetrics?.totalSourceCitations
    ? ((sourceCitationMetrics.totalSourceCitations / citationMetrics.brandSpecific.totalCitations) * 100).toFixed(1)
    : '0.0'

  // Show loading state
  if (citationMetricsLoading && !citationMetrics) {
    const loadingSteps = [
      { label: "Loading citation metrics", completed: !citationMetricsLoading },
      { label: "Processing citations", completed: false },
      { label: "Generating insights", completed: false }
    ]

    return (
      <div className="space-y-10 animate-in fade-in duration-500 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Globe className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Citation Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Domain citations and citation intelligence. Track which citations AI platforms reference when answering prompts.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">Loading Citation Analytics</h3>
            <p className="text-sm text-muted-foreground mb-6">Fetching your citation data...</p>
            <div className="space-y-3 w-full max-w-md">
              {loadingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  {step.completed ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  )}
                  <span className="text-sm text-muted-foreground">{step.label}</span>
        </div>
              ))}
        </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Globe className="h-6 w-6 text-blue-600 dark:text-blue-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Citation Analytics</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Domain citations and citation intelligence. Track which citations AI platforms reference when answering prompts.
        </p>
      </div>

      {/* Row 1: Key Metrics */}
      <section id="metrics-section" className="space-y-5 scroll-mt-20">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary"></div>
          <h2 className="text-lg font-semibold text-foreground">Key Insights</h2>
        </div>
        
        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Citation Rate */}
            <Card className="relative border border-border/60 hover:border-primary/40 transition-all duration-200 group hover:shadow-xl rounded-2xl bg-card/50 backdrop-blur-sm">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent dark:from-purple-400/10 dark:via-purple-400/5 opacity-60 rounded-2xl" />
              
              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col min-h-[170px]">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Citation Rate</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex-shrink-0 rounded-full hover:bg-muted/50 transition-colors p-0.5">
                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-help transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 z-50" sideOffset={5}>
                        <p className="text-xs leading-relaxed">Percentage of YOUR brand's source citations relative to all citations in responses mentioning brands</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="p-2 rounded-full bg-purple-100/80 dark:bg-purple-950/50 transition-transform group-hover:scale-110">
                    <Percent className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                <div className="flex flex-col flex-grow justify-center">
                  <div className="text-2xl font-bold text-foreground">
                    {citationRate}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Brand Citations: {sourceCitationMetrics?.totalSourceCitations || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Brand Response Citations: {citationMetrics?.brandSpecific?.totalCitations || 0}
                  </p>
                </div>
              </div>
            </Card>

            {/* Citation Domains */}
            <Card className="relative border border-border/60 hover:border-primary/40 transition-all duration-200 group hover:shadow-xl rounded-2xl bg-card/50 backdrop-blur-sm">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-400/10 dark:via-emerald-400/5 opacity-60 rounded-2xl" />
              
              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col min-h-[170px]">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Citation Domains</h3>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="flex-shrink-0 rounded-full hover:bg-muted/50 transition-colors p-0.5">
                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-help transition-colors" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs p-3 z-50" sideOffset={5}>
                        <p className="text-xs leading-relaxed">Total number of unique domains cited across all responses</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="p-2 rounded-full bg-emerald-100/80 dark:bg-emerald-950/50 transition-transform group-hover:scale-110">
                    <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <div className="flex flex-col flex-grow justify-center">
                  <div className="text-2xl font-bold text-foreground">
                    {citationMetrics?.overall?.totalDomains || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Unique Domains
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All domains cited across responses
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TooltipProvider>
      </section>

      {/* Row 2: Citation Distribution & Statistics */}
      <section id="distribution-statistics-section" className="space-y-5 scroll-mt-20">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary"></div>
          <h2 className="text-lg font-semibold text-foreground">Citation Distribution</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
              <DomainCategoryPieChart 
                data={citationMetrics?.overall?.domainCategoryDistribution || []}
                isLoading={citationMetricsLoading}
              />

          {/* Statistics Card */}
          <TooltipProvider delayDuration={300}>
            <Card className="relative border border-border/60 hover:border-primary/40 transition-all duration-200 group hover:shadow-xl rounded-2xl bg-card/50 backdrop-blur-sm">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent dark:from-blue-400/10 dark:via-blue-400/5 opacity-60 rounded-2xl" />
              
              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col h-full">
                <h3 className="text-base font-semibold text-foreground mb-6">Statistics</h3>
                <div className="flex flex-col gap-8 flex-grow justify-center">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Unique Pages</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex-shrink-0 rounded-full hover:bg-muted/50 transition-colors p-0.5">
                            <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 z-50" sideOffset={5}>
                          <p className="text-xs leading-relaxed">Total number of unique pages cited across all responses</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {citationMetrics?.overall?.totalCitedPages || 0}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Unique Domains</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex-shrink-0 rounded-full hover:bg-muted/50 transition-colors p-0.5">
                            <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 z-50" sideOffset={5}>
                          <p className="text-xs leading-relaxed">Number of unique domains referenced in citations</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {citationMetrics?.overall?.totalDomains || 0}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Total Citations</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="flex-shrink-0 rounded-full hover:bg-muted/50 transition-colors p-0.5">
                            <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-foreground cursor-help transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs p-3 z-50" sideOffset={5}>
                          <p className="text-xs leading-relaxed">Total citation links across all responses</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {citationMetrics?.overall?.totalCitations || 0}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TooltipProvider>
        </div>
      </section>

      {/* Section 4: Top Citations with Citation Type Toggle */}
      <section id="top-citations-section" className="space-y-5 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h2 className="text-lg font-semibold text-foreground">Top Citations</h2>
          </div>
          
          {/* Citation Type Toggle */}
          <div className="flex items-center rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_-2px_0_rgba(0,0,0,0.1)] border border-border/80 border-b-[3px] overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCitationType('all')}
              className={cn(
                "rounded-none border-0 transition-all duration-200",
                citationType === 'all' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              All Citations
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCitationType('referring')}
              className={cn(
                "rounded-none border-0 transition-all duration-200",
                citationType === 'referring' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              Referring Citations
            </Button>
          </div>
        </div>
        
        {citationType === 'referring' && (
          <p className="text-sm text-muted-foreground">
            Citations responsible for YOUR brand mentions - includes citations from responses mentioning your brand (any child brand) PLUS all citations to your parent brand's website ({currentBrand?.domain || 'N/A'}), since any citation to your official domain inherently refers to your brand.
          </p>
        )}
        
        <UnifiedSourceTable
          citationType={citationType}
          domainData={citationType === 'all' ? (citationMetrics?.overall?.leaderboard || []) : []}
          pageData={citationType === 'all' ? (citationMetrics?.overall?.topCitationPages || []) : []}
          sourceCitationData={citationType === 'all' ? [] : mergedReferringDomainData}
          isLoading={citationType === 'all' ? citationMetricsLoading : sourceCitationsLoading}
        />
      </section>


      {/* Amazon Analytics Section */}
      <div className="mt-12 pt-8 border-t">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }>
          <AmazonAnalytics />
        </Suspense>
      </div>




      
    </div>
  )
}


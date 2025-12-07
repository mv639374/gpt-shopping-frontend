export interface CitationLeaderboardEntry {
  domain: string
  citationCount: number
  uniqueResponses: number
  platforms: string[]
  regions: string[]
  utmCount: number
  utmPercentage: number
  aliveCount: number
  deadCount: number
  topUtmSource: string | null
  recentCitation: string
  domainCategory: string | null
}

export interface DomainCategoryDistribution {
  category: string
  count: number
  percentage: number
}

export interface TopCitationPage {
  id: string
  url: string
  title: string | null
  description: string | null
  domain: string
  citationType: string | null
  domainCategory: string | null
  utmSource: string | null
  isAlive: boolean | null
  createdAt: string
  text: string | null
  citationCount?: number
}

export interface CitationMetrics {
  overall: {
    totalCitations: number
    totalDomains: number
    totalResponses: number
    totalCitedPages: number
    responsesWithCitations: number
    domainCategoryDistribution: DomainCategoryDistribution[]
    topCitations: TopCitationPage[]
  }
  brandSpecific: {
    totalCitations: number
    totalDomains: number
    totalResponses: number
    selectedChildBrandIds: string[]
  }
}

export interface DomainSourceStats {
  domain: string
  citationCount: number
  uniqueBrands: number
  brandNames: string[]
  urls: string[]
  urlDetails: Array<{
    url: string
    citationCount: number
  }>
  platforms: string[]
  regions: string[]
  recentCitation: string
  sentimentDistribution: {
    positive: number
    negative: number
    neutral: number
  }
  avgPosition: number
  domainCategory: string | null
}

export interface SourceCitationMetrics {
  domainStats: DomainSourceStats[]
  totalSourceCitations: number
  totalDomains: number
  totalBrands: number
  selectedChildBrandIds: string[]
}

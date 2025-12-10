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


export interface CitationOverviewKPIs {
  total_citations: number;
  amazon_citations: number;
  amazon_citation_percentage: number;
  citation_coverage_percentage: number;
  avg_citations_per_response: number;
}

export interface DomainDistribution {
  domain_category: string;
  citation_count: number;
  percentage: number;
  avg_amazon_rank: number;
}

export interface CitationDetail {
  citation_id: string;
  citation_domain: string;
  citation_url: string;
  citation_title: string;
  citation_text: string;
  is_alive: boolean;
  product_name: string;
  amazon_rank: number;
  created_at: string;
}

export interface CitationFilters {
  marketplace?: string;
  category?: string;
}

export interface CitationTypePerformance {
  domain_category: string;
  citation_count: number;
  percentage: number;
  avg_amazon_rank: number;
  total_responses: number;
}

export interface CitationSentimentImpact {
  sentiment_category: string;
  citation_count: number;
  percentage: number;
  avg_amazon_rank: number;
  products_affected: number;
  low_rank_products: number;
  no_rank_products: number;
  improvement_potential: number;
}

export interface CategoryPerformanceMatrix {
  product_category: string;
  low_rank_count: number;
  low_rank_percentage: number;
  mid_rank_count: number;
  mid_rank_percentage: number;
  high_rank_count: number;
  high_rank_percentage: number;
  no_rank_count: number;
  no_rank_percentage: number;
  total_products: number;
}


export interface CompetitorCitationComparison {
  marketplace: string;
  citation_count: number;
  product_count: number;
  avg_citations_per_product: number;
  top_rank_count: number;
}

export interface CitationFlowData {
  source_node: string;
  target_node: string;
  flow_value: number;
  node_type: string;
}

export interface ResponseCitationDensity {
  response_id: string;
  product_name: string;
  brand_name: string;
  marketplace: string;
  position_rank: number;
  total_citations: number;
  response_word_count: number;
  citations_per_100_words: number;
  citation_snippets: Array<{
    domain: string;
    category: string;
    text_snippet: string;
  }>;
}

export interface FilterOption {
  filter_type: string;
  filter_value: string;
  count: number;
}

export interface CitationFilters {
  category?: string;
  marketplace?: string;
}


export interface CitationGapAnalysis {
  product_name: string;
  brand_name: string;
  amazon_rank: number;
  citation_count: number;
  avg_competitor_citations: number;
  gap_score: number;
  recommended_sources: Array<{
    domain: string;
    category: string;
    usage_count: number;
  }>;
}

export interface CitationSourceAuthority {
  citation_domain: string;
  domain_category: string;
  total_citations: number;
  avg_rank_when_cited: number;
  alive_rate: number;
  authority_score: number;
}

export interface TemporalCitationTrend {
  time_period: string;
  total_citations: number;
  unique_products: number;
  avg_citations_per_product: number;
  company_citations: number;
  third_party_citations: number;
  ugc_citations: number;
}

export interface CitationUrlAnalysis {
  citation_url: string;
  citation_domain: string;
  utm_source: string;
  total_citations: number;
  unique_products: number;
  avg_product_rank: number;
  is_alive: boolean;
  sample_citation_text: string;
}

export interface UtmSourceDistribution {
  utm_source_name: string;  // Changed from utm_source
  citation_count: number;
  unique_domains: number;
  avg_product_rank: number;
  percentage: number;
}


export interface CitationDetail {
  id: string;
  citation_domain: string;
  citation_url: string;
  citation_type: string;
  text: string;
  title: string;
  description: string;
  domain_category: string;
  is_alive: boolean;
  utm_source: string;
  created_at: string;
}

export interface ProductDetail {
  product_name: string;
  brand_name: string;
  product_description: string;
  card_rank: number;
  marketplace: string;
  position_rank: number;
  price: number;
  total_citations: number;
  company_citations: number;
  third_party_citations: number;
  ugc_citations: number;
  citations_detail: CitationDetail[];
}

export interface ProductCitedInfo {
  product_name: string;
  brand_name: string;
  rank: number;
  marketplace: string;
  response_id: string;
}

export interface DomainDetail {
  citation_domain: string;
  domain_category: string;
  total_citations: number;
  unique_products: number;
  avg_product_rank: number;
  best_rank: number;
  worst_rank: number;
  alive_rate: number;
  products_cited: ProductCitedInfo[];
  citation_timeline: Array<{ date: string; citation_count: number }>;
}

export interface CategoryProductComparison {
  product_name: string;
  brand_name: string;
  response_id: string;
  amazon_rank: number;
  total_citations: number;
  company_citations: number;
  third_party_citations: number;
  ugc_citations: number;
  avg_citation_rank: number;
  citation_domains: string[];
}

export interface CitationFullContext {
  citation_text: string;
  citation_url: string;
  citation_domain: string;
  citation_type: string;
  title: string;
  description: string;
  domain_category: string;
  is_alive: boolean;
  utm_source: string;
  product_name: string;
  brand_name: string;
  product_rank: number;
  marketplace: string;
  created_at: string;
}

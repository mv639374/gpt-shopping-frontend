export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  environment: string;
  tables: {
    [key: string]: {
      accessible: boolean;
      row_count?: number;
      sample_row?: Record<string, unknown>;
      error?: string;
    };
  };
}

export interface RootResponse {
  message: string;
  version: string;
  environment: string;
  docs: string;
  health: string;
  status: string;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

export interface KPIData {
  visibility_score: {
    percentage: number;
    present_in: number;
    total_categories: number;
  };
  market_leadership: {
    percentage: number;
    rank_1_count: number;
    total_categories: number;
  };
  avg_ranking: {
    value: number;
    rating: string;
  };
  opportunity_gap: {
    percentage: number;
    categories_not_rank1: number;
    total_categories: number;
  };
}

export interface MarketplaceInfo {
  name: string;
  rank: number;
  score_norm: number;
  highlight: boolean;
}

export interface CategoryData {
  category: string;
  marketplaces: MarketplaceInfo[];
  selected_marketplace_rank: number | null;
}

export interface HeatmapData {
  categories: CategoryData[];
  selected_marketplace: string;
}

export interface MarketplaceAnalytics {
  marketplace: string;
  kpis: KPIData;
  heatmap: HeatmapData;
}


export interface DetailedHeatmapData {
  categories: DetailedCategoryData[];
  selected_marketplace: string;
  total_categories: number;
  showing_categories: number;
  show_all: boolean;
}

export interface DetailedCategoryData {
  category: string;
  marketplaces: DetailedMarketplaceInfo[];
  selected_marketplace_rank: number | null;
  rank_1_marketplace: string | null;
}

export interface DetailedMarketplaceInfo {
  name: string;
  rank: number;
  score_norm: number;
  is_selected: boolean;
  is_rank_1: boolean;
}

export interface CategoryAnalytics {
  category: string;
  selected_marketplace: string;
  kpis: {
    total_products: number;
    total_marketplaces: number;
    top_marketplace: string;
    selected_marketplace_rank: number | null;
  };
  products: string[];
  marketplace_rankings: MarketplaceRanking[];
  total_category_products: number;  // Added
}


export interface MarketplaceRanking {
  rank: number;
  marketplace: string;
  product_coverage: number;
  total_products: number;
  score_norm: number;
}


export interface ProductAnalytics {
  category: string;
  product_name: string;
  marketplace_podium: MarketplacePodiumItem[];
  total_marketplaces: number;
}

export interface MarketplacePodiumItem {
  marketplace: string;
  rank: number;
  price: number | null;
  currency: string | null;
  delivery_fee: number | null;
  delivery_days: number | null;
}


export interface NoRankAnalysis {
  marketplace: string;
  top_no_rank_categories: NoRankCategory[];
  total_categories_analyzed: number;
}

export interface NoRankCategory {
  category: string;
  total_products: number;
  products_with_rank: number;
  missing_products: number;
  missing_percentage: number;
}

export interface LowRankAnalysis {
  marketplace: string;
  top_low_rank_categories: LowRankCategory[];
  total_categories_analyzed: number;
  rank_threshold: number;
}

export interface LowRankCategory {
  category: string;
  total_products: number;
  low_rank_count: number;
  low_rank_percentage: number;
  avg_rank: number;
}


export interface CompetitorThreatAnalysis {
  marketplace: string;
  top_competitors: CompetitorThreat[];
  total_categories: number;
  analysis_date: string;
}

export interface CompetitorThreat {
  marketplace: string;
  categories_dominated: number;
  categories: string[];
  dominance_percentage: number;
}


export interface CitationMetrics {
  marketplace: string;
  citation_share: number;
  citation_rank: number | null;
  response_inclusion_rate: number;
  total_citations: number;
  total_responses: number;
  responses_with_citations: number;
  citation_vs_no_citation: number;
  top_citation_sources: CitationSource[];
  citation_types: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
  trend: {
    citation_share_change: number;
    rank_change: number;
  };
}

export interface CitationSource {
  domain: string;
  count: number;
  share: number;
}

export interface PromptIntelligence {
  marketplace: string;
  share_of_voice: number;
  sov_rank: number | null;
  total_unique_prompts: number;
  marketplace_prompt_count: number;
  average_rank: number;
  top_trigger_topics: TopicRank[];
  weakness_topics: TopicRank[];
  trend: {
    sov_change: number;
    rank_change: number;
  };
}

export interface TopicRank {
  topic: string;
  avg_rank: number;
}


export interface CitationMetrics {
  citation_share: number;
  citation_rank: number | null;
  response_inclusion_rate: number;
  total_citations: number;
  total_responses: number;
  responses_with_citations: number;
  citation_vs_no_citation: number;
  top_citation_sources: CitationSource[];
  top_cited_pages?: CitationPage[];  // Make optional to avoid TS errors
  citation_types: Record<string, { count: number; percentage: number }>;
  trend: {
    citation_share_change: number;
    rank_change: number;
  };
}

export interface CitationSource {
  domain: string;
  count: number;
  share: number;
}

export interface CitationPage {
  url: string;
  count: number;
  domain: string;
}

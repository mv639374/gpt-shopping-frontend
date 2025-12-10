// ============================================
// File: hooks/useCitationAnalytics.ts
// REPLACE ENTIRE FILE - Fixed function name and TypeScript errors
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type {
  CitationOverviewKPIs,
  DomainDistribution,
  CitationDetail,
  CitationFilters,
  CitationTypePerformance,
  CitationSentimentImpact,
  CategoryPerformanceMatrix,
  CompetitorCitationComparison,
  CitationFlowData,
  ResponseCitationDensity,
  FilterOption,
  CitationGapAnalysis,
  CitationSourceAuthority,
  TemporalCitationTrend,
  CitationUrlAnalysis,
  UtmSourceDistribution,
  ProductDetail,
  DomainDetail,
  CategoryProductComparison,
  CitationFullContext,
} from '@/types/citations';

export function useCitationAnalytics(filters?: CitationFilters) {
  const [kpis, setKpis] = useState<CitationOverviewKPIs | null>(null);
  const [domainDistribution, setDomainDistribution] = useState<DomainDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch KPIs
        const { data: kpisData, error: kpisError } = await supabase.rpc(
          'get_citation_overview_kpis',
          {
            marketplace_filter: filters?.marketplace || null,
            category_filter: filters?.category || null,
          }
        );

        if (kpisError) throw kpisError;
        setKpis(kpisData?.[0] || null);

        // Fetch Domain Distribution - FIXED: Changed function name
        const { data: domainData, error: domainError } = await supabase.rpc(
          'get_domain_distribution'  // Changed from 'get_citation_domain_distribution'
        );

        if (domainError) throw domainError;
        setDomainDistribution(domainData || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [filters?.marketplace, filters?.category]);

  return { kpis, domainDistribution, loading, error };
}

// ============================================
// PHASE 2 HOOKS
// ============================================

export function useCitationTypePerformance() {
  const [data, setData] = useState<CitationTypePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_type_performance');
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation type performance:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useCitationSentimentImpact() {
  const [data, setData] = useState<CitationSentimentImpact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_sentiment_impact');
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation sentiment impact:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

export async function fetchCitationDetailsByDomain(
  domainCategory: string
): Promise<CitationDetail[]> {
  const { data, error } = await supabase.rpc('get_citation_details_by_domain', {
    domain_category_filter: domainCategory,
  });

  if (error) throw error;
  return data || [];
}

export function useCategoryPerformanceMatrix() {
  const [data, setData] = useState<CategoryPerformanceMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_category_performance_matrix');
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching category performance matrix:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useCompetitorCitationComparison(category?: string) {
  const [data, setData] = useState<CompetitorCitationComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc(
          'get_competitor_citation_comparison',
          { category_filter: category || null }
        );
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching competitor citation comparison:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [category]);

  return { data, loading, error };
}

export function useCitationFlowData(filters?: CitationFilters) {
  const [data, setData] = useState<CitationFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_flow_data', {
          category_filter: filters?.category || null,
          marketplace_filter: filters?.marketplace || null,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation flow data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters?.category, filters?.marketplace]);

  return { data, loading, error };
}

export function useResponseCitationDensity(limit: number = 20) {
  const [data, setData] = useState<ResponseCitationDensity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_response_citation_density', {
          limit_rows: limit,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching response citation density:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [limit]);

  return { data, loading, error };
}

export function useFilterOptions() {
  const [data, setData] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_filter_options');
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching filter options:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

export function useCitationGapAnalysis(minRank: number = 8, limit: number = 20) {
  const [data, setData] = useState<CitationGapAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_gap_analysis', {
          min_rank: minRank,
          limit_rows: limit,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation gap analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [minRank, limit]);

  return { data, loading, error };
}

export function useCitationSourceAuthority(limit: number = 30) {
  const [data, setData] = useState<CitationSourceAuthority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_source_authority', {
          limit_rows: limit,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation source authority:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [limit]);

  return { data, loading, error };
}

export function useTemporalCitationTrends(timeBucketDays: number = 7) {
  const [data, setData] = useState<TemporalCitationTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_temporal_citation_trends', {
          time_bucket_days: timeBucketDays,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching temporal citation trends:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timeBucketDays]);

  return { data, loading, error };
}

export function useCitationUrlAnalysis(limit: number = 50) {
  const [data, setData] = useState<CitationUrlAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_url_analysis', {
          limit_rows: limit,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation URL analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [limit]);

  return { data, loading, error };
}

export function useUtmSourceDistribution() {
  const [data, setData] = useState<UtmSourceDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_utm_source_distribution');
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching UTM source distribution:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { data, loading, error };
}

// ============================================
// DRILL-DOWN DETAIL HOOKS - FIXED TypeScript errors
// ============================================

export function useProductDetail(responseId: string | null) {
  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!responseId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_product_detail', {
          product_response_id: responseId,
        });
        if (err) throw err;
        setData(result?.[0] || null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [responseId]);

  return { data, loading, error };
}

export function useDomainDetail(domainName: string | null) {
  const [data, setData] = useState<DomainDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!domainName) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        // FIXED: Handle null check before decodeURIComponent
        const decodedDomain = domainName ? decodeURIComponent(domainName) : '';
        const { data: result, error: err } = await supabase.rpc('get_domain_detail', {
          domain_name: decodedDomain,
        });
        if (err) throw err;
        setData(result?.[0] || null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching domain detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [domainName]);

  return { data, loading, error };
}

export function useCategoryDetail(categoryName: string | null, limit: number = 50) {
  const [data, setData] = useState<CategoryProductComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categoryName) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        // FIXED: Handle null check before decodeURIComponent
        const decodedCategory = categoryName ? decodeURIComponent(categoryName) : '';
        const { data: result, error: err } = await supabase.rpc('get_category_detail', {
          category_name: decodedCategory,
          limit_products: limit,
        });
        if (err) throw err;
        setData(result || []);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching category detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryName, limit]);

  return { data, loading, error };
}

export function useCitationFullContext(citationId: string | null) {
  const [data, setData] = useState<CitationFullContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!citationId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const { data: result, error: err } = await supabase.rpc('get_citation_full_context', {
          citation_id: citationId,
        });
        if (err) throw err;
        setData(result?.[0] || null);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching citation context:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [citationId]);

  return { data, loading, error };
}

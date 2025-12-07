import { useQuery } from '@tanstack/react-query'
import { useGlobalFilterStore } from '@/store/globalFilterStore'
import type { CitationMetrics } from '@/types/citations'

interface UseCitationMetricsFilters {
  parentBrandId?: string | null
  minCitations?: number
}

export const useCitationMetrics = (filters: UseCitationMetricsFilters = {}) => {
  const { parentBrandId, minCitations = 1 } = filters
  const { filters: globalFilters } = useGlobalFilterStore()

  return useQuery({
    queryKey: ['citationMetrics', parentBrandId, minCitations, globalFilters],
    queryFn: async (): Promise<CitationMetrics> => {
      try {
        if (!parentBrandId) {
          return {
            overall: {
              totalCitations: 0,
              totalDomains: 0,
              totalResponses: 0,
              totalCitedPages: 0,
              responsesWithCitations: 0,
              domainCategoryDistribution: [],
              topCitations: []
            },
            brandSpecific: {
              totalCitations: 0,
              totalDomains: 0,
              totalResponses: 0,
              selectedChildBrandIds: []
            }
          }
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        
        const params = new URLSearchParams({
          brand_id: parentBrandId,  // Changed from parent_brand_id
          min_citations: minCitations.toString()
        })

        if (globalFilters.regions && globalFilters.regions.length > 0) {
          globalFilters.regions.forEach(r => params.append('regions', r))
        }
        if (globalFilters.platforms && globalFilters.platforms.length > 0) {
          globalFilters.platforms.forEach(p => params.append('platforms', p))
        }
        if (globalFilters.dateRange?.from) {
          params.append('start_date', globalFilters.dateRange.from)
        }
        if (globalFilters.dateRange?.to) {
          params.append('end_date', globalFilters.dateRange.to)
        }

        const response = await fetch(`${apiUrl}/citations/analytics/metrics?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch citation metrics')
        }

        const data = await response.json()
        return data

      } catch (error) {
        console.error('Error fetching citation metrics:', error)
        throw error
      }
    },
    enabled: !!parentBrandId,
    refetchOnWindowFocus: false,
  })
}

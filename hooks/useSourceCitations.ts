import { useQuery } from '@tanstack/react-query'
import { useGlobalFilterStore } from '@/store/globalFilterStore'
import type { SourceCitationMetrics } from '@/types/citations'

interface UseSourceCitationsFilters {
  parentBrandId?: string | null
}

export const useSourceCitations = (filters: UseSourceCitationsFilters = {}) => {
  const { parentBrandId } = filters
  const { filters: globalFilters } = useGlobalFilterStore()

  return useQuery({
    queryKey: ['sourceCitations', parentBrandId, globalFilters],
    queryFn: async (): Promise<SourceCitationMetrics> => {
      try {
        if (!parentBrandId) {
          return {
            domainStats: [],
            totalSourceCitations: 0,
            totalDomains: 0,
            totalBrands: 0,
            selectedChildBrandIds: []
          }
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        
        const params = new URLSearchParams({
          brand_id: parentBrandId  // Changed from parent_brand_id
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

        const response = await fetch(`${apiUrl}/citations/analytics/source-citations?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch source citations')
        }

        const data = await response.json()
        return data

      } catch (error) {
        console.error('Error fetching source citations:', error)
        throw error
      }
    },
    enabled: !!parentBrandId,
    refetchOnWindowFocus: false,
  })
}

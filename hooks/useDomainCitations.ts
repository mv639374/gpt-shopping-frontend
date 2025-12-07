import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export interface DomainCitation {
  id: string
  citation_url: string
  anchor_text: string | null
  title: string | null
  created_at: string
  platform: string
  region: string
  response?: string
  prompt?: string
}

export const useDomainCitations = (
  parentBrandId: string | null, 
  domain: string | null,
  topicIds: string[] = [],
  platforms: string[] = [],
  regions: string[] = []
) => {
  return useQuery({
    queryKey: ['domain-citations', parentBrandId, domain, topicIds, platforms, regions],
    queryFn: async (): Promise<DomainCitation[]> => {
      if (!parentBrandId || !domain) return []

      try {
        if (isSupabaseConfigured && supabase) {
          console.log('🔍 Fetching domain citations for:', { parentBrandId, domain, topicIds, platforms, regions })

          // Step 1: Get topics linked to this parent brand (same as citation-metrics function)
          let topicsQuery = supabase
            .from('brand_topics')
            .select('topic_id')
            .eq('parent_brand_id', parentBrandId)
            .eq('is_active', true)

          // Apply topic filter if specified
          if (topicIds.length > 0) {
            topicsQuery = topicsQuery.in('topic_id', topicIds)
          }

          const { data: brandTopics, error: topicsError } = await topicsQuery
          if (topicsError) throw topicsError

          const finalTopicIds = brandTopics?.map(bt => bt.topic_id) || []
          
          if (finalTopicIds.length === 0) {
            console.log('No active topics found for parent brand:', parentBrandId)
            return []
          }

          // Step 2: Get child brands linked to those topics
          const { data: topicChildBrands, error: topicChildBrandsError } = await supabase
            .from('child_brands')
            .select('id')
            .in('topic_id', finalTopicIds)

          if (topicChildBrandsError) throw topicChildBrandsError

          const topicChildBrandIds = topicChildBrands?.map(cb => cb.id) || []

          // Step 3: Get child brands mapped to this parent brand
          const { data: mappedChildBrands, error: mappingError } = await supabase
            .from('brand_mapping')
            .select('child_brand_id')
            .eq('parent_brand_id', parentBrandId)

          if (mappingError) throw mappingError

          const mappedChildBrandIds = mappedChildBrands?.map(m => m.child_brand_id) || []

          // Step 4: Get intersection - child brands that are both topic-linked AND mapped to parent
          const childBrandIds = topicChildBrandIds.filter(id => mappedChildBrandIds.includes(id))
          
          console.log('📄 Domain Citations Debug:', {
            parentBrandId,
            finalTopicIds: finalTopicIds.length,
            topicChildBrandIds: topicChildBrandIds.length,
            mappedChildBrandIds: mappedChildBrandIds.length,
            filteredChildBrandIds: childBrandIds.length
          })

          if (childBrandIds.length === 0) {
            console.log('No child brands found for parent brand:', parentBrandId)
            return []
          }

          // Step 5: Get prompts for the parent brand's topics
          const { data: allPrompts, error: promptsError } = await supabase
            .from('prompts')
            .select('id, prompt')
            .in('topic_id', finalTopicIds)

          if (promptsError) throw promptsError

          if (!allPrompts || allPrompts.length === 0) {
            console.log('No prompts found for topics:', finalTopicIds)
            return []
          }

          const promptIds = allPrompts.map(p => p.id)
          const promptMap = Object.fromEntries(
            allPrompts.map(p => [p.id, p.prompt])
          )

          // Step 6: Get responses for these prompts with filters
          let responsesQuery = supabase
            .from('prompts_responses')
            .select('id, platform, region, response, prompt_id')
            .in('prompt_id', promptIds)

          if (platforms.length > 0) {
            responsesQuery = responsesQuery.in('platform', platforms)
          }
          
          if (regions.length > 0) {
            responsesQuery = responsesQuery.in('region', regions)
          }

          const { data: responses, error: responsesError } = await responsesQuery
          if (responsesError) throw responsesError

          if (!responses || responses.length === 0) {
            console.log('No matching responses found')
            return []
          }

          const responseIds = responses.map(r => r.id)

          // Step 7: Get brand mentions for ALL child brands from these responses
          let allBrandMentions: any[] = []
          const BRAND_CHUNK_SIZE = 15
          const RESPONSE_CHUNK_SIZE = 15

          // Chunk the childBrandIds to avoid URL length issues
          for (let i = 0; i < childBrandIds.length; i += BRAND_CHUNK_SIZE) {
            const childBrandChunk = childBrandIds.slice(i, i + BRAND_CHUNK_SIZE)
            
            // Also chunk responseIds if needed
            for (let j = 0; j < responseIds.length; j += RESPONSE_CHUNK_SIZE) {
              const responseChunk = responseIds.slice(j, j + RESPONSE_CHUNK_SIZE)
              
              const { data: brandMentions, error: mentionsError } = await supabase
                .from('response_brand_mentions')
                .select('prompt_response_id, brand_id')
                .in('brand_id', childBrandChunk)
                .in('prompt_response_id', responseChunk)

              if (mentionsError) throw mentionsError

              if (brandMentions) {
                allBrandMentions = allBrandMentions.concat(brandMentions)
              }
            }
          }

          const relevantResponseIds = [...new Set(allBrandMentions.map(m => m.prompt_response_id))]
          
          if (relevantResponseIds.length === 0) {
            console.log('No brand mentions found')
            return []
          }
          // Step 8: Get citations for this domain and these responses
          let allCitations: any[] = []
          
          // Chunk the response IDs to avoid URL length issues
          for (let i = 0; i < relevantResponseIds.length; i += RESPONSE_CHUNK_SIZE) {
            const responseChunk = relevantResponseIds.slice(i, i + RESPONSE_CHUNK_SIZE)
            
            const { data: citations, error: citationsError } = await supabase
              .from('citations')
              .select('id, citation_url, text, title, prompt_response_id, created_at')
              .eq('citation_domain', domain)
              .in('prompt_response_id', responseChunk)
              .order('id', { ascending: false })

            if (citationsError) throw citationsError

            if (citations) {
              allCitations = allCitations.concat(citations)
            }
          }

          // Create mapping from response ID to response data
          const responseMap = Object.fromEntries(
            responses.map(r => [r.id, r])
          )

          console.log(`📄 Found ${allCitations.length} citations for domain ${domain}`)

          return allCitations.map(citation => {
            const responseData = responseMap[citation.prompt_response_id]
            const promptText = responseData?.prompt_id ? promptMap[responseData.prompt_id] : undefined
            return {
              id: citation.id,
              citation_url: citation.citation_url || '',
              anchor_text: citation.text || '',
              title: citation.title || '',
              created_at: citation.created_at || new Date().toISOString(),
              platform: responseData?.platform || 'Unknown',
              region: responseData?.region || 'Unknown',
              response: responseData?.response || undefined,
              prompt: promptText || undefined
            }
          })

        } else {
          // Return empty data when Supabase is not configured
          console.log('⚠️ Supabase not configured, returning empty domain citations data')
          return []
        }
      } catch (error) {
        console.error('Error fetching domain citations:', error)
        return []
      }
    },
    enabled: !!parentBrandId && !!domain,
    refetchOnWindowFocus: false,
  })
}

// Mock data generation removed - using real database data only

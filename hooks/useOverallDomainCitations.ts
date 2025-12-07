import { useQuery } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { DomainCitation } from './useDomainCitations'

export const useOverallDomainCitations = (
  parentBrandId: string | null, 
  domain: string | null,
  topicIds: string[] = [],
  platforms: string[] = [],
  regions: string[] = []
) => {
  return useQuery({
    queryKey: ['overall-domain-citations', parentBrandId, domain, topicIds, platforms, regions],
    queryFn: async (): Promise<DomainCitation[]> => {
      if (!parentBrandId || !domain) return []

      try {
        if (isSupabaseConfigured && supabase) {
          console.log('🔍 Fetching overall domain citations for:', { parentBrandId, domain, topicIds, platforms, regions })

          // Step 1: Get topics linked to this parent brand
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

          // Step 2: Get ALL prompts for these topics (not filtered by brand mentions)
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

          // Step 3: Get ALL responses for these prompts (not filtered by brand mentions)
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

          // Step 4: Get ALL citations for this domain from ALL responses (not filtered by brand mentions)
          let allCitations: any[] = []
          const RESPONSE_CHUNK_SIZE = 15
          
          // Chunk the response IDs to avoid URL length issues
          for (let i = 0; i < responseIds.length; i += RESPONSE_CHUNK_SIZE) {
            const responseChunk = responseIds.slice(i, i + RESPONSE_CHUNK_SIZE)
            
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

          console.log(`📄 Found ${allCitations.length} overall citations for domain ${domain}`)

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
        console.error('Error fetching overall domain citations:', error)
        return []
      }
    },
    enabled: !!parentBrandId && !!domain,
    refetchOnWindowFocus: false,
  })
}

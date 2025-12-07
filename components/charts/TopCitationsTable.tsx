import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import type { TopCitationPage } from '@/types/citations'

interface TopCitationsTableProps {
  citations: TopCitationPage[]
  isLoading?: boolean
}

export function TopCitationsTable({ citations, isLoading }: TopCitationsTableProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  const getDomainCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      'Company': 'bg-blue-100 text-blue-800',
      'UGC': 'bg-green-100 text-green-800',
      '3rd party media': 'bg-amber-100 text-amber-800',
      'High trusted media': 'bg-purple-100 text-purple-800',
      'Marketplace': 'bg-red-100 text-red-800',
    }
    return colors[category || 'Unknown'] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading citations...</p>
        </div>
      </div>
    )
  }

  if (citations.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No citations found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              URL
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Domain
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Citations
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {citations.map((citation) => (
            <tr key={citation.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="max-w-md">
                  <p className="text-sm text-gray-900 truncate" title={citation.url}>
                    {citation.title || citation.url}
                  </p>
                  {citation.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {citation.description}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {citation.domain}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDomainCategoryColor(citation.domainCategory)}`}>
                  {citation.domainCategory || 'Unknown'}
                </span>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                {citation.citationCount}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => copyToClipboard(citation.url)}
                    className="text-gray-600 hover:text-gray-800"
                    title="Copy URL"
                  >
                    {copiedUrl === citation.url ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

import React, { useState, useMemo, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownCheckbox } from '@/components/ui/dropdown-checkbox'
import type { DropdownOption } from '@/components/ui/dropdown-checkbox'
import { 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Globe,
  FileText,
  Tag
} from 'lucide-react'
import type { CitationLeaderboardEntry, TopCitationPage, DomainSourceStats } from '@/types/citations'
import { useDomainCitations } from '@/hooks/useDomainCitations'
import { useOverallDomainCitations } from '@/hooks/useOverallDomainCitations'
import { useGlobalFilterStore } from '@/store/globalFilterStore'
import { useBrandStore } from '@/store/brandStore'
import { PlatformIcon, getIconUrlFromDomain } from '@/utils/platformUtils'
import { ImprovedDomainUrlsDialog } from './ImprovedDomainUrlsDialog'
import { cn } from '@/lib/utils'

interface UnifiedSourceTableProps {
  citationType: 'all' | 'referring'
  domainData: CitationLeaderboardEntry[]
  pageData: TopCitationPage[]
  sourceCitationData: DomainSourceStats[]
  isLoading?: boolean
}

type ViewMode = 'domains' | 'pages'
type SortField = 'citations' | 'platforms' | 'category'
type SortDirection = 'asc' | 'desc'

export function UnifiedSourceTable({ citationType, domainData, pageData, sourceCitationData, isLoading }: UnifiedSourceTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('domains')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortField, setSortField] = useState<SortField>('citations')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDomainCategories, setSelectedDomainCategories] = useState<string[]>([])
  
  // Get current brand and filters for domain citations
  const { currentBrandId } = useBrandStore()
  const { filters: globalFilters } = useGlobalFilterStore()
  
  // Fetch brand-specific domain citations when a domain is selected (for referring citations)
  // Only enabled when citationType is 'referring' to avoid unnecessary queries
  const { 
    data: brandDomainCitations = [], 
    isLoading: isBrandDomainCitationsLoading,
    isError: isBrandDomainCitationsError 
  } = useDomainCitations(
    citationType === 'referring' ? (currentBrandId ?? null) : null,
    citationType === 'referring' ? selectedDomain : null,
    globalFilters.topics,
    globalFilters.platforms,
    globalFilters.regions
  )
  
  // Fetch overall domain citations when a domain is selected (for all citations)
  // Only enabled when citationType is 'all' to avoid unnecessary queries
  const { 
    data: overallDomainCitations = [], 
    isLoading: isOverallDomainCitationsLoading,
    isError: isOverallDomainCitationsError 
  } = useOverallDomainCitations(
    citationType === 'all' ? (currentBrandId ?? null) : null,
    citationType === 'all' ? selectedDomain : null,
    globalFilters.topics,
    globalFilters.platforms,
    globalFilters.regions
  )
  
  // Use appropriate citations based on citation type
  const domainCitations = citationType === 'all' ? overallDomainCitations : brandDomainCitations
  const isDomainCitationsLoading = citationType === 'all' ? isOverallDomainCitationsLoading : isBrandDomainCitationsLoading
  const isDomainCitationsError = citationType === 'all' ? isOverallDomainCitationsError : isBrandDomainCitationsError
  
  // Convert source citation data to match the format of domainData
  const convertedSourceDomainData = useMemo((): CitationLeaderboardEntry[] => {
    return sourceCitationData.map(source => ({
      domain: source.domain,
      citationCount: source.citationCount,
      uniqueResponses: 0, // Not available in source data
      platforms: source.platforms || [], // Now available from backend
      regions: source.regions || [], // Now available from backend
      domainCategory: source.domainCategory || 'Unknown',
      utmCount: 0,
      utmPercentage: 0,
      aliveCount: 0,
      deadCount: 0,
      topUtmSource: null,
      recentCitation: source.recentCitation || new Date().toISOString()
    }))
  }, [sourceCitationData])
  
  // Convert source citation data URLs to page format using urlDetails from backend
  const convertedSourcePageData = useMemo((): TopCitationPage[] => {
    const pages: TopCitationPage[] = []
    
    sourceCitationData.forEach(source => {
      // Use urlDetails if available (new backend format), otherwise fall back to urls array
      if (source.urlDetails && source.urlDetails.length > 0) {
        source.urlDetails.forEach((urlDetail, index) => {
          pages.push({
            id: `${source.domain}-${index}`,
            url: urlDetail.url,
            title: null,
            description: null,
            domain: source.domain,
            citationCount: urlDetail.citationCount,
            domainCategory: source.domainCategory || 'Unknown',
            citationType: null,
            utmSource: null,
            isAlive: null,
            createdAt: source.recentCitation || new Date().toISOString(),
            text: null
          })
        })
      } else {
        // Fallback to old format
        source.urls.forEach((url, index) => {
          pages.push({
            id: `${source.domain}-${index}`,
            url,
            title: null,
            description: null,
            domain: source.domain,
            citationCount: 1,
            domainCategory: source.domainCategory || 'Unknown',
            citationType: null,
            utmSource: null,
            isAlive: null,
            createdAt: source.recentCitation || new Date().toISOString(),
            text: null
          })
        })
      }
    })
    
    return pages
  }, [sourceCitationData])
  
  // Select the appropriate data based on citation type
  const activeDomainData = citationType === 'all' ? domainData : convertedSourceDomainData
  const activePageData = citationType === 'all' ? pageData : convertedSourcePageData
  
  // Extract unique domain categories from active data
  const uniqueDomainCategories = useMemo(() => {
    const categoriesSet = new Set<string>()
    
    activeDomainData.forEach(domain => {
      if (domain.domainCategory) {
        categoriesSet.add(domain.domainCategory)
      }
    })
    
    activePageData.forEach(page => {
      if (page.domainCategory) {
        categoriesSet.add(page.domainCategory)
      }
    })
    
    return Array.from(categoriesSet).sort()
  }, [activeDomainData, activePageData])
  
  // Create dropdown options for domain categories
  const domainCategoryOptions: DropdownOption[] = uniqueDomainCategories.map(category => ({
    label: category,
    value: category
  }))
  
  // Initialize selected domain categories to all when unique categories change
  useEffect(() => {
    if (uniqueDomainCategories.length > 0) {
      setSelectedDomainCategories(prev => {
        // Only update if current selection is empty or doesn't match available categories
        if (prev.length === 0) {
          return uniqueDomainCategories
        }
        // Keep current selection but filter out any categories that no longer exist
        const validSelection = prev.filter(cat => uniqueDomainCategories.includes(cat))
        return validSelection.length > 0 ? validSelection : uniqueDomainCategories
      })
    }
  }, [uniqueDomainCategories])
  
  // Handle sorting for domains
  const sortedDomains = useMemo(() => {
    return [...activeDomainData].sort((a, b) => {
      let aVal: number | string, bVal: number | string
      
      switch (sortField) {
        case 'citations':
          aVal = a.citationCount
          bVal = b.citationCount
          break
        case 'platforms':
          aVal = a.platforms?.length || 0
          bVal = b.platforms?.length || 0
          break
        case 'category':
          // Sort alphabetically by category
          aVal = a.domainCategory || 'Unknown'
          bVal = b.domainCategory || 'Unknown'
          return sortDirection === 'asc' 
            ? String(aVal).localeCompare(String(bVal))
            : String(bVal).localeCompare(String(aVal))
        default:
          aVal = a.citationCount
          bVal = b.citationCount
      }
      
      return sortDirection === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
    })
  }, [activeDomainData, sortField, sortDirection])
  
  // Handle sorting for pages
  const sortedPages = useMemo(() => {
    return [...activePageData].sort((a, b) => {
      const aVal = a.citationCount || 0
      const bVal = b.citationCount || 0
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [activePageData, sortDirection])
  
  // Apply domain category filter
  const filteredDomains = useMemo(() => {
    if (selectedDomainCategories.length === 0 || selectedDomainCategories.length === uniqueDomainCategories.length) {
      return sortedDomains
    }
    return sortedDomains.filter(domain => 
      domain.domainCategory && selectedDomainCategories.includes(domain.domainCategory)
    )
  }, [sortedDomains, selectedDomainCategories, uniqueDomainCategories])
  
  const filteredPages = useMemo(() => {
    if (selectedDomainCategories.length === 0 || selectedDomainCategories.length === uniqueDomainCategories.length) {
      return sortedPages
    }
    return sortedPages.filter(page => 
      page.domainCategory && selectedDomainCategories.includes(page.domainCategory)
    )
  }, [sortedPages, selectedDomainCategories, uniqueDomainCategories])
  
  // Pagination logic
  const displayData = viewMode === 'domains' ? filteredDomains : filteredPages
  const totalPages = Math.ceil(displayData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = displayData.slice(startIndex, endIndex)

  // Reset to page 1 when view mode or sort changes
  const [prevViewMode, setPrevViewMode] = useState(viewMode)
  const [prevSortField, setPrevSortField] = useState(sortField)
  if (prevViewMode !== viewMode || prevSortField !== sortField) {
    setCurrentPage(1)
    setPrevViewMode(viewMode)
    setPrevSortField(sortField)
  }
  
  // Reset to page 1 when citation type changes
  useEffect(() => {
    setCurrentPage(1)
  }, [citationType])
  
  // Reset to page 1 when domain category filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedDomainCategories])

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  // Get sort icon for column header
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const handleDomainClick = (domainName: string) => {
    setSelectedDomain(domainName)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/8 via-blue-500/4 to-transparent dark:from-blue-400/8 dark:via-blue-400/4 rounded-2xl p-8 border border-border/60 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
          </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle and Domain Category Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_-2px_0_rgba(0,0,0,0.1)] border border-border/80 border-b-[3px] overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('domains')}
            className={cn(
              "rounded-none border-0 transition-all duration-200",
              viewMode === 'domains' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            <Globe className="h-4 w-4 mr-2" />
                Domains ({filteredDomains.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('pages')}
            className={cn(
              "rounded-none border-0 transition-all duration-200",
              viewMode === 'pages' ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            <FileText className="h-4 w-4 mr-2" />
                Pages ({filteredPages.length})
          </Button>
        </div>
        
        {/* Domain Category Filter */}
        {domainCategoryOptions.length > 0 && (
          <div className="relative">
            <DropdownCheckbox
              options={domainCategoryOptions}
              selected={selectedDomainCategories}
              onChange={setSelectedDomainCategories}
              placeholder="Domain Categories"
              disabled={isLoading || domainCategoryOptions.length === 0}
              className={`min-w-[180px] rounded-xl transition-all duration-200 border-b-[3px] ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-b-gray-300 dark:border-b-gray-600' 
                  : 'shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_-2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_-2px_0_rgba(0,0,0,0.1)] active:shadow-[0_1px_4px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.15)] active:translate-y-[1px] border-b-border/80'
              }`}
              filterType="Domain Categories"
            />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-blue-500/8 via-blue-500/4 to-transparent dark:from-blue-400/8 dark:via-blue-400/4 rounded-2xl border border-border/60 hover:border-primary/40 transition-all duration-200 bg-card/30 backdrop-blur-sm overflow-hidden">
        {displayData.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No {viewMode === 'domains' ? 'domain' : 'page'} data available</p>
          </div>
        ) : viewMode === 'domains' ? (
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="sticky top-0 z-10 bg-gradient-to-br from-blue-500/8 via-blue-500/4 to-transparent dark:from-blue-400/8 dark:via-blue-400/4 backdrop-blur-sm">
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 pl-8 pr-4 font-semibold text-xs text-muted-foreground w-[80px]">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground w-[40%]">
                    Domain
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors w-[15%]"
                    onClick={() => handleSort('citations')}
                  >
                    <div className="flex items-center gap-2">
                      Citations
                      {getSortIcon('citations')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors w-[25%]"
                    onClick={() => handleSort('platforms')}
                  >
                    <div className="flex items-center gap-2">
                      Platforms
                      {getSortIcon('platforms')}
                    </div>
                  </th>
                  <th 
                    className="text-left py-3 px-4 pr-8 font-semibold text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors w-[15%]"
                    onClick={() => handleSort('category')}
                  >
                          <div className="flex items-center gap-2">
                      Domain Category
                      {getSortIcon('category')}
                    </div>
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {(paginatedData as CitationLeaderboardEntry[]).map((domain, pageIndex) => {
                  const actualIndex = startIndex + pageIndex
                  const faviconUrl = getIconUrlFromDomain(domain.domain)
                  
                  return (
                    <tr 
                      key={domain.domain}
                      className="border-b border-border/30 transition-all duration-200 hover:bg-card/60 cursor-pointer"
                      onClick={() => handleDomainClick(domain.domain)}
                    >
                      {/* Rank */}
                      <td className="py-3 pl-8 pr-4">
                        <div className={`inline-flex items-center justify-center min-w-[40px] h-7 rounded-lg px-2 ${
                          actualIndex === 0 
                            ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold' 
                            : actualIndex === 1
                            ? 'bg-gray-400/20 text-gray-700 dark:text-gray-400 font-bold'
                            : actualIndex === 2
                            ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <span className="text-sm font-semibold">#{actualIndex + 1}</span>
                        </div>
                      </td>
                      
                      {/* Domain */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {faviconUrl ? (
                            <img 
                              src={faviconUrl} 
                              alt={`${domain.domain} icon`}
                              className="w-8 h-8 rounded-lg flex-shrink-0 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {domain.domain.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm text-foreground">
                              {domain.domain}
                            </span>
                          </div>
                          </div>
                      </td>
                      
                      {/* Citations */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {domain.citationCount}
                          </span>
                  </div>
                      </td>
                      
                      {/* Platforms (icons only) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {domain.platforms?.slice(0, 5).map((platform, idx) => (
                            <div 
                              key={idx}
                              className="p-1 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                              title={platform}
                            >
                              <PlatformIcon platform={platform} size={20} />
                            </div>
                          ))}
                          {domain.platforms && domain.platforms.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{domain.platforms.length - 5}
                            </Badge>
                          )}
                        </div>
                      </td>
                      
                      {/* Domain Category */}
                      <td className="py-3 px-4 pr-8">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          <Badge variant="secondary" className="text-xs">
                            {domain.domainCategory || 'Unknown'}
                          </Badge>
              </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Pages View
          <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="sticky top-0 z-10 bg-gradient-to-br from-blue-500/8 via-blue-500/4 to-transparent dark:from-blue-400/8 dark:via-blue-400/4 backdrop-blur-sm">
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 pl-8 pr-4 font-semibold text-xs text-muted-foreground w-[80px]">
                    Rank
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground w-[50%]">
                    Page
                  </th>
                  <th 
                    className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors w-[15%]"
                    onClick={() => handleSort('citations')}
                  >
                    <div className="flex items-center gap-2">
                      Citations
                      {getSortIcon('citations')}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 pr-8 font-semibold text-xs text-muted-foreground w-[30%]">
                    Domain Category
                  </th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody>
                {(paginatedData as TopCitationPage[]).map((page, pageIndex) => {
                  const actualIndex = startIndex + pageIndex
                  const faviconUrl = getIconUrlFromDomain(page.domain)
                  
                  return (
                    <tr 
                      key={page.id}
                      className="border-b border-border/30 transition-all duration-200 hover:bg-card/60"
                    >
                      {/* Rank */}
                      <td className="py-3 pl-8 pr-4">
                        <div className={`inline-flex items-center justify-center min-w-[40px] h-7 rounded-lg px-2 ${
                          actualIndex === 0 
                            ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold' 
                            : actualIndex === 1
                            ? 'bg-gray-400/20 text-gray-700 dark:text-gray-400 font-bold'
                            : actualIndex === 2
                            ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold'
                            : 'bg-muted/50 text-muted-foreground'
                        }`}>
                          <span className="text-sm font-semibold">#{actualIndex + 1}</span>
                  </div>
                      </td>
                      
                      {/* Page */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {faviconUrl ? (
                            <img 
                              src={faviconUrl} 
                              alt={`${page.domain} icon`}
                              className="w-8 h-8 rounded-lg flex-shrink-0 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {page.domain.charAt(0).toUpperCase()}
                </div>
              )}
                          <div className="flex flex-col flex-1 min-w-0 max-w-[500px]">
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-sm text-blue-600 hover:text-blue-800 truncate block"
                              onClick={(e) => e.stopPropagation()}
                              title={page.title || page.url}
                            >
                              {page.title ? (
                                page.title.length > 60 ? `${page.title.substring(0, 60)}...` : page.title
                              ) : (
                                page.url.length > 60 ? `${page.url.substring(0, 60)}...` : page.url
                              )}
                            </a>
                            {page.title && (
                              <span 
                                className="text-xs text-muted-foreground truncate block" 
                                title={page.url}
                              >
                                {page.url.length > 70 ? `${page.url.substring(0, 70)}...` : page.url}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Citations */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold text-foreground">
                            {page.citationCount || 0}
                          </span>
                        </div>
                      </td>
                      
                      {/* Domain Category */}
                      <td className="py-3 px-4 pr-8">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <Badge variant="secondary" className="text-xs">
                            {page.domainCategory || 'Unknown'}
                            </Badge>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
                      </div>
        )}
              </div>

      {/* Pagination at bottom */}
      {displayData.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, displayData.length)} of {displayData.length} {viewMode}</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
                  </div>
          {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
              <span className="text-sm font-medium text-foreground px-2">
                {currentPage} / {totalPages}
              </span>
                    <Button
                      variant="outline"
                      size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
          )}
                </div>
              )}

      {/* Domain URLs Dialog */}
      {selectedDomain && (
        <ImprovedDomainUrlsDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          domain={selectedDomain}
          citations={domainCitations}
          isLoading={isDomainCitationsLoading}
          isError={isDomainCitationsError}
        />
      )}
    </div>
  )
}

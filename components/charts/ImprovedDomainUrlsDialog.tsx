import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, Globe, ChevronDown, ChevronUp, MessageSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { PlatformIcon, getIconUrlFromDomain } from '@/utils/platformUtils'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DomainCitation {
  citation_url: string
  title?: string | null
  platform?: string
  region?: string
  response?: string
  prompt?: string
}

interface ImprovedDomainUrlsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  domain: string
  citations: DomainCitation[]
  isLoading?: boolean
  isError?: boolean
}

interface GroupedCitation {
  url: string
  count: number
  citations: DomainCitation[]
  mostRecent: DomainCitation
}

export function ImprovedDomainUrlsDialog({ 
  isOpen, 
  onOpenChange, 
  domain, 
  citations, 
  isLoading = false,
  isError = false 
}: ImprovedDomainUrlsDialogProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const [expandedUrl, setExpandedUrl] = useState<string | null>(null)
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const faviconUrl = getIconUrlFromDomain(domain)
  const itemsPerPage = 10

  // Group citations by URL and sort by frequency
  const groupedCitations = useMemo(() => {
    const groups: { [url: string]: GroupedCitation } = {}
    
    citations.forEach((citation) => {
      const url = citation.citation_url
      if (!groups[url]) {
        groups[url] = {
          url,
          count: 0,
          citations: [],
          mostRecent: citation
        }
      }
      groups[url].count++
      groups[url].citations.push(citation)
    })

    // Sort by frequency (count) descending
    return Object.values(groups).sort((a, b) => b.count - a.count)
  }, [citations])

  // Pagination
  const totalPages = Math.ceil(groupedCitations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCitations = groupedCitations.slice(startIndex, endIndex)

  // Reset state when dialog opens or domain changes
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
      setExpandedUrl(null)
      setExpandedRowIndex(null)
    }
  }, [isOpen, domain])

  // Check if content is scrollable
  useEffect(() => {
    const checkScrollable = () => {
      if (scrollRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollRef.current
        const isScrollable = scrollHeight > clientHeight
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5
        setShowScrollIndicator(isScrollable && !isAtBottom)
      }
    }

    if (isOpen && !isLoading) {
      setTimeout(checkScrollable, 100)
      const scrollElement = scrollRef.current
      scrollElement?.addEventListener('scroll', checkScrollable)
      return () => {
        scrollElement?.removeEventListener('scroll', checkScrollable)
      }
    }
  }, [isOpen, isLoading, paginatedCitations.length])

  const handleUrlClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const toggleUrlExpansion = (url: string, index: number) => {
    if (expandedUrl === url) {
      setExpandedUrl(null)
      setExpandedRowIndex(null)
    } else {
      setExpandedUrl(url)
      setExpandedRowIndex(index)
    }
  }

  const toggleRowExpansion = (index: number) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/60 shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 pb-4 space-y-3">
          <DialogTitle className="flex items-center gap-3">
            <div className="relative">
              {faviconUrl ? (
                <img 
                  src={faviconUrl} 
                  alt={`${domain} icon`}
                  className="w-10 h-10 rounded-xl flex-shrink-0 object-cover ring-2 ring-primary/20"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0 ring-2 ring-primary/20">
                  {domain.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Globe className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{domain}</span>
              <span className="text-sm text-muted-foreground font-normal">
                {groupedCitations.length} unique URL{groupedCitations.length !== 1 ? 's' : ''} • {citations.length} total citation{citations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">
            Citations sorted by frequency. Most referenced URLs appear first.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Loading Citations</h3>
              <p className="text-sm text-muted-foreground">Fetching data from {domain}...</p>
            </div>
            <div className="w-64">
              <Progress value={66} className="h-2" />
            </div>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Globe className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive">Error Loading Citations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Failed to fetch citations from {domain}. Please try again later.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : citations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
            <Globe className="h-16 w-16 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold">No Citations Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are no citations from {domain} matching your current filters.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Content - Table Design */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              <div className="bg-gradient-to-br from-yellow-500/8 via-yellow-500/4 to-transparent dark:from-yellow-400/8 dark:via-yellow-400/4 rounded-2xl border border-border/60 hover:border-primary/40 transition-all duration-200 bg-card/30 backdrop-blur-sm overflow-hidden flex-1 flex flex-col">
                <table className="w-full">
                  <thead className="bg-gradient-to-br from-yellow-500/8 via-yellow-500/4 to-transparent dark:from-yellow-400/8 dark:via-yellow-400/4 backdrop-blur-sm sticky top-0 z-10">
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 pl-6 pr-4 font-semibold text-xs text-muted-foreground w-[50px]"></th>
                      <th className="text-left py-3 px-4 font-semibold text-xs text-muted-foreground">URL / Page Title</th>
                      <th className="text-center py-3 px-4 font-semibold text-xs text-muted-foreground w-[120px]">Citations</th>
                      <th className="text-center py-3 px-4 font-semibold text-xs text-muted-foreground w-[150px]">Platform</th>
                      <th className="text-center py-3 px-4 pr-6 font-semibold text-xs text-muted-foreground w-[120px]">Actions</th>
                    </tr>
                  </thead>
                </table>
                
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto min-h-0" 
                  style={{ scrollbarWidth: 'thin' }}
                >
                  <table className="w-full">
                    <thead className="invisible">
                      <tr className="border-b border-border/50">
                        <th className="py-3 pl-6 pr-4 w-[50px]"></th>
                        <th className="py-3 px-4">URL / Page Title</th>
                        <th className="py-3 px-4 w-[120px]">Citations</th>
                        <th className="py-3 px-4 w-[150px]">Platform</th>
                        <th className="py-3 px-4 pr-6 w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCitations.map((group, index) => {
                        const citationFavicon = getIconUrlFromDomain(group.url)
                        const isExpanded = expandedUrl === group.url
                        const displayCitation = group.mostRecent
                        
                        return (
                          <React.Fragment key={group.url}>
                            {/* Main Row */}
                            <tr 
                              className={`border-b border-border/30 transition-all duration-200 cursor-pointer ${
                                isExpanded ? 'bg-primary/10' : 'hover:bg-card/60'
                              }`}
                              onClick={() => toggleUrlExpansion(group.url, index)}
                            >
                              {/* Expand Icon */}
                              <td className="py-3 pl-6 pr-4">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-primary" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                )}
                              </td>
                              
                              {/* URL/Title with Favicon */}
                              <td className="py-3 px-4">
                                <div className="flex items-start gap-3">
                                  {citationFavicon ? (
                                    <img 
                                      src={citationFavicon} 
                                      alt="Page icon"
                                      className="w-8 h-8 rounded-lg flex-shrink-0 object-cover ring-2 ring-primary/20 mt-0.5"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                                      {domain.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex flex-col flex-1 min-w-0 max-w-[500px]">
                                    <span 
                                      className="font-semibold text-sm text-foreground line-clamp-2 break-words"
                                      title={displayCitation.title || group.url}
                                    >
                                      {displayCitation.title || group.url}
                                    </span>
                                    {displayCitation.title && (
                                      <span 
                                        className="text-xs text-muted-foreground truncate font-mono mt-0.5"
                                        title={group.url}
                                      >
                                        {group.url}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              
                              {/* Citations Count */}
                              <td className="py-3 px-4 text-center">
                                <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-base px-3 py-1">
                                  {group.count}
                                </Badge>
                              </td>
                              
                              {/* Platform */}
                              <td className="py-3 px-4 text-center">
                                {displayCitation.platform && (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <PlatformIcon platform={displayCitation.platform} size={20} />
                                  </div>
                                )}
                              </td>
                              
                              {/* Actions */}
                              <td className="py-3 px-4 pr-6 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUrlClick(group.url)
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                            
                            {/* Expanded Row - All Citations Table */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={5} className="p-0">
                                  <div className="bg-gradient-to-br from-muted/50 to-muted/30 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="p-6">
                                      <div className="flex items-center gap-2 mb-4">
                                        <MessageSquare className="h-5 w-5 text-primary" />
                                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                                          All {group.count} Citation{group.count > 1 ? 's' : ''} - Prompt & Response Pairs
                                        </h3>
                                      </div>
                                      
                                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                                        {group.citations.map((citation, citIndex) => (
                                          <Card key={citIndex} className="border-2 border-border/40">
                                            <CardContent className="p-4">
                                              <div className="space-y-3">
                                                {/* Citation Header */}
                                                <div className="flex items-center justify-between pb-2 border-b border-border/30">
                                                  <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="font-semibold">
                                                      #{citIndex + 1}
                                                    </Badge>
                                                    {citation.platform && (
                                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
                                                        <PlatformIcon platform={citation.platform} size={16} />
                                                        <span className="text-xs font-medium">{citation.platform}</span>
                                                      </div>
                                                    )}
                                                    {citation.region && (
                                                      <Badge variant="outline" className="text-xs">
                                                        📍 {citation.region}
                                                      </Badge>
                                                    )}
                                                  </div>
                                                </div>
                                                
                                                {/* Prompt */}
                                                {citation.prompt && (
                                                  <div>
                                                    <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                                                      Prompt
                                                    </div>
                                                    <div className="text-sm text-foreground bg-background/70 p-3 rounded-lg border border-border/30 leading-relaxed">
                                                      {citation.prompt}
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {/* Response */}
                                                {citation.response && (
                                                  <div>
                                                    <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                                                      AI Response
                                                    </div>
                                                    <div className="text-sm text-foreground bg-background/70 p-3 rounded-lg border border-border/30 leading-relaxed max-h-60 overflow-y-auto">
                                                      {citation.response}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Scroll Indicator */}
              {showScrollIndicator && (
                <div className="absolute bottom-2 right-4 pointer-events-none z-20">
                  <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg animate-pulse">
                    <ChevronDown className="h-3 w-3 animate-bounce" />
                    <span className="font-medium">More below</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t text-sm flex-shrink-0">
                <span className="text-muted-foreground font-medium">
                  Showing {startIndex + 1}-{Math.min(endIndex, groupedCitations.length)} of {groupedCitations.length}
                </span>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-9 px-3"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-sm font-medium px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


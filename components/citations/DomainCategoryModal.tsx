// ============================================
// File: components/citations/DomainCategoryModal.tsx
// REPLACE ENTIRE FILE - Enhanced with tabs and detailed data
// ============================================

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Loader2, TrendingUp, Package, Activity, ExternalLink, 
  Search, Calendar, Link as LinkIcon, FileText, CheckCircle, XCircle 
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DomainCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  citationCount: number;
  percentage: number;
}

interface DomainInfo {
  citation_domain: string;
  citation_count: number;
  is_alive_rate: number;
}

interface CitationDetail {
  id: string;
  citation_domain: string;
  citation_url: string;
  title: string;
  description: string;
  text: string;
  citation_type: string;
  utm_source: string;
  is_alive: boolean;
  created_at: string;
}

export function DomainCategoryModal({ 
  isOpen, 
  onClose, 
  categoryName,
  citationCount,
  percentage 
}: DomainCategoryModalProps) {
  const [domains, setDomains] = useState<DomainInfo[]>([]);
  const [citations, setCitations] = useState<CitationDetail[]>([]);
  const [filteredCitations, setFilteredCitations] = useState<CitationDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && categoryName) {
      fetchData();
    }
  }, [isOpen, categoryName]);

  useEffect(() => {
    // Filter citations based on search and selected domain
    let filtered = citations;
    
    if (selectedDomain) {
      filtered = filtered.filter(c => c.citation_domain === selectedDomain);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citation_domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.citation_url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCitations(filtered);
  }, [searchTerm, selectedDomain, citations]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all citation details for this category
      const { data, error } = await supabase
        .from('citations')
        .select(`
          id,
          citation_domain,
          citation_url,
          title,
          description,
          text,
          citation_type,
          utm_source,
          is_alive,
          created_at,
          domain_category
        `)
        .eq('domain_category', categoryName)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Process citations
      const citationDetails: CitationDetail[] = data.map((row: any) => ({
        id: row.id,
        citation_domain: row.citation_domain,
        citation_url: row.citation_url,
        title: row.title,
        description: row.description,
        text: row.text,
        citation_type: row.citation_type,
        utm_source: row.utm_source,
        is_alive: row.is_alive,
        created_at: row.created_at,
      }));

      setCitations(citationDetails);
      setFilteredCitations(citationDetails);

      // Aggregate domains
      const domainMap = new Map<string, { count: number; aliveCount: number }>();
      
      data.forEach((row: any) => {
        const domain = row.citation_domain;
        if (!domainMap.has(domain)) {
          domainMap.set(domain, { count: 0, aliveCount: 0 });
        }
        const stat = domainMap.get(domain)!;
        stat.count++;
        if (row.is_alive) stat.aliveCount++;
      });

      const domainList = Array.from(domainMap.entries())
        .map(([domain, stat]) => ({
          citation_domain: domain,
          citation_count: stat.count,
          is_alive_rate: (stat.aliveCount / stat.count) * 100,
        }))
        .sort((a, b) => b.citation_count - a.citation_count);

      setDomains(domainList);
    } catch (error) {
      console.error('Error fetching domain details:', error);
    } finally {
      setLoading(false);
    }
  };

  const aliveCount = citations.filter(c => c.is_alive).length;
  const aliveRate = citations.length > 0 ? (aliveCount / citations.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {categoryName}
            <Badge variant="secondary">{citationCount} citations</Badge>
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis of citations from this source category
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-muted-foreground">Total Citations</span>
              </div>
              <div className="text-xl font-bold">{citationCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-muted-foreground">Market Share</span>
              </div>
              <div className="text-xl font-bold text-green-600">{percentage.toFixed(1)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <LinkIcon className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-muted-foreground">Unique Domains</span>
              </div>
              <div className="text-xl font-bold text-purple-600">{domains.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Activity className={`h-4 w-4 ${aliveRate > 80 ? 'text-green-600' : 'text-orange-600'}`} />
                <span className="text-xs font-medium text-muted-foreground">Alive Rate</span>
              </div>
              <div className={`text-xl font-bold ${aliveRate > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                {aliveRate.toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="domains" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="domains">Domains Overview</TabsTrigger>
            <TabsTrigger value="citations">Citation Details</TabsTrigger>
          </TabsList>

          {/* Tab 1: Domains Overview */}
          <TabsContent value="domains" className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                {domains.map((domain, idx) => (
                  <Card
                    key={idx}
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      selectedDomain === domain.citation_domain ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedDomain(
                      selectedDomain === domain.citation_domain ? null : domain.citation_domain
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-muted-foreground mr-2">#{idx + 1}</span>
                          <span className="font-semibold text-sm truncate block">{domain.citation_domain}</span>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {domain.citation_count}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          {domain.is_alive_rate > 80 ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <XCircle className="h-3 w-3 text-orange-600" />
                          )}
                          <span className="text-muted-foreground">
                            {domain.is_alive_rate.toFixed(0)}% alive
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Citation Details */}
          <TabsContent value="citations" className="space-y-3">
            {/* Search and Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, domain, or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {selectedDomain && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedDomain(null)}>
                  {selectedDomain} ✕
                </Badge>
              )}
            </div>

            {/* Citation List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredCitations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No citations found matching your search
                </div>
              ) : (
                filteredCitations.map((citation, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {citation.is_alive ? (
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm">{citation.citation_domain}</span>
                            {citation.citation_type && (
                              <Badge variant="outline" className="text-xs">
                                {citation.citation_type}
                              </Badge>
                            )}
                          </div>
                          {citation.title && (
                            <p className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                              {citation.title}
                            </p>
                          )}
                          {citation.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {citation.description}
                            </p>
                          )}
                        </div>
                        <a
                          href={citation.citation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(citation.created_at).toLocaleDateString()}</span>
                        </div>
                        {citation.utm_source && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span className="truncate">UTM: {citation.utm_source}</span>
                          </div>
                        )}
                      </div>

                      {citation.text && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            <span className="font-semibold">Snippet: </span>
                            {citation.text}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

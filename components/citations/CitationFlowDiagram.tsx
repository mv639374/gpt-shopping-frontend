// ============================================
// File: components/citations/CitationFlowDiagram.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import type { CitationFlowData } from '@/types/citations';

interface CitationFlowDiagramProps {
  data: CitationFlowData[];
  onNodeClick?: (nodeName: string) => void;
  loading?: boolean;
}

export function CitationFlowDiagram({ data, onNodeClick, loading }: CitationFlowDiagramProps) {
  if (loading) {
    return (
      <Card className="h-[400px]">
        <CardHeader className="pb-2">
          <div className="h-5 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-full bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Group data by node type
  const categoryToDomain = data.filter(d => d.node_type === 'category_to_domain');
  const domainToRank = data.filter(d => d.node_type === 'domain_to_rank');

  // Get unique nodes
  const categories = [...new Set(categoryToDomain.map(d => d.source_node))].slice(0, 8);
  const domains = [...new Set([
    ...categoryToDomain.map(d => d.target_node),
    ...domainToRank.map(d => d.source_node)
  ])];
  const ranks = [...new Set(domainToRank.map(d => d.target_node))];

  // Calculate total flows for width calculation
  const maxFlow = Math.max(...data.map(d => d.flow_value));

  // Colors
  const nodeColors: Record<string, string> = {
    'Company': 'bg-blue-500',
    '3rd party media': 'bg-green-500',
    'UGC': 'bg-purple-500',
    'Rank 1-3': 'bg-emerald-500',
    'Rank 4-7': 'bg-yellow-500',
    'Rank 8+': 'bg-orange-500',
    'No Rank': 'bg-red-500',
  };

  const getNodeColor = (node: string) => {
    return nodeColors[node] || 'bg-gray-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-[400px] flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Citation Flow Diagram</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Flow: Product Category → Citation Domain → Marketplace Rank. 
                  Width shows citation volume. Click nodes to filter.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0 pb-2">
        <div className="grid grid-cols-3 gap-3 h-full">
          {/* Column 1: Categories */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-muted-foreground mb-2 sticky top-0 bg-background">
              Product Category
            </div>
            {categories.map((cat, idx) => {
              const totalFlow = categoryToDomain
                .filter(d => d.source_node === cat)
                .reduce((sum, d) => sum + d.flow_value, 0);
              
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onNodeClick?.(cat)}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-400 text-white px-2 py-1.5 rounded text-[10px] cursor-pointer hover:shadow-md transition-shadow truncate"
                      >
                        {cat}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-semibold">{cat}</p>
                      <p className="text-xs">{totalFlow} citations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Column 2: Citation Domains */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-muted-foreground mb-2 sticky top-0 bg-background">
              Citation Domain
            </div>
            {domains.map((domain, idx) => {
              const totalFlow = [
                ...categoryToDomain.filter(d => d.target_node === domain),
                ...domainToRank.filter(d => d.source_node === domain)
              ].reduce((sum, d) => sum + d.flow_value, 0);
              
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => onNodeClick?.(domain)}
                        className={`${getNodeColor(domain)} text-white px-2 py-1.5 rounded text-[10px] cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        {domain}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-semibold">{domain}</p>
                      <p className="text-xs">{totalFlow} citations</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Column 3: Rank Categories */}
          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-muted-foreground mb-2 sticky top-0 bg-background">
              Marketplace Rank
            </div>
            {ranks.map((rank, idx) => {
              const totalFlow = domainToRank
                .filter(d => d.target_node === rank)
                .reduce((sum, d) => sum + d.flow_value, 0);
              
              return (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${getNodeColor(rank)} text-white px-2 py-1.5 rounded text-[10px] cursor-pointer hover:shadow-md transition-shadow`}
                      >
                        {rank}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-semibold">{rank}</p>
                      <p className="text-xs">{totalFlow} products</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>

        {/* Flow Statistics */}
        <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-muted-foreground">Categories</div>
            <div className="text-sm font-bold">{categories.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Domains</div>
            <div className="text-sm font-bold">{domains.length}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">Total Flow</div>
            <div className="text-sm font-bold">
              {data.reduce((sum, d) => sum + d.flow_value, 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

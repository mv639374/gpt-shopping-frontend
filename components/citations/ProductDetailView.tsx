// ============================================
// File: components/citations/ProductDetailView.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, ExternalLink, Activity, Package, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ProductDetail } from '@/types/citations';

interface ProductDetailViewProps {
  data: ProductDetail | null;
  loading?: boolean;
}

export function ProductDetailView({ data, loading }: ProductDetailViewProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Product not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      {/* Product Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{data.product_name}</CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{data.brand_name}</Badge>
                <Badge variant="outline">{data.marketplace}</Badge>
                <Badge className={data.position_rank <= 3 ? 'bg-green-600' : 'bg-orange-600'}>
                  Rank #{data.position_rank}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">₹{data.price?.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Card Rank: #{data.card_rank}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{data.product_description}</p>
        </CardContent>
      </Card>

      {/* Citation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Total Citations</span>
            </div>
            <div className="text-2xl font-bold">{data.total_citations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Company</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.company_citations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">3rd Party</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{data.third_party_citations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-muted-foreground">UGC</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{data.ugc_citations}</div>
          </CardContent>
        </Card>
      </div>

      {/* All Citations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Citations ({data.citations_detail?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto space-y-3">
          {data.citations_detail?.map((citation, idx) => (
            <div key={idx} className="border rounded p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity 
                      className={`h-3 w-3 ${citation.is_alive ? 'text-green-600' : 'text-red-600'}`} 
                    />
                    <span className="font-semibold text-sm">{citation.citation_domain}</span>
                    <Badge 
                      variant={
                        citation.domain_category === 'Company' ? 'default' :
                        citation.domain_category === '3rd party media' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {citation.domain_category}
                    </Badge>
                  </div>
                  {citation.title && (
                    <p className="text-sm font-medium mb-1">{citation.title}</p>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={citation.citation_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Open citation URL</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {citation.text && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mb-2">
                  "{citation.text.substring(0, 300)}..."
                </p>
              )}

              <div className="flex items-center gap-2 text-xs">
                {citation.utm_source && (
                  <Badge variant="outline" className="text-xs">
                    UTM: {citation.utm_source}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {citation.citation_type}
                </Badge>
                <span className="text-muted-foreground">
                  {new Date(citation.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {(!data.citations_detail || data.citations_detail.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No citations found for this product
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

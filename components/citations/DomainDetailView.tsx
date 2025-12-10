// ============================================
// File: components/citations/DomainDetailView.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Package, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DomainDetail } from '@/types/citations';

interface DomainDetailViewProps {
  data: DomainDetail | null;
  loading?: boolean;
}

export function DomainDetailView({ data, loading }: DomainDetailViewProps) {
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
          <p className="text-muted-foreground">Domain not found</p>
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

      {/* Domain Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{data.citation_domain}</CardTitle>
              <Badge 
                variant={
                  data.domain_category === 'Company' ? 'default' :
                  data.domain_category === '3rd party media' ? 'secondary' : 'outline'
                }
              >
                {data.domain_category}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Alive Rate</div>
              <div className={`text-2xl font-bold ${data.alive_rate > 80 ? 'text-green-600' : 'text-orange-600'}`}>
                {data.alive_rate}%
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <span className="text-xs font-medium text-muted-foreground">Unique Products</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.unique_products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">Best Rank</span>
            </div>
            <div className="text-2xl font-bold text-green-600">#{data.best_rank}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Avg Rank</span>
            </div>
            <div className="text-2xl font-bold">{data.avg_product_rank}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Cited */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Products Citing This Domain ({data.products_cited?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <div className="space-y-2">
            {data.products_cited?.map((product, idx) => (
              <Link
                key={idx}
                href={`/citations/products/${product.response_id}`}
                className="block border rounded p-3 hover:shadow-md hover:bg-muted/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{product.product_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{product.brand_name}</Badge>
                      <Badge variant="outline" className="text-xs">{product.marketplace}</Badge>
                    </div>
                  </div>
                  <Badge className={product.rank <= 3 ? 'bg-green-600' : 'bg-orange-600'}>
                    Rank #{product.rank}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

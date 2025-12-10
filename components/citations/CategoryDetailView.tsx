// ============================================
// File: components/citations/CategoryDetailView.tsx
// CREATE NEW FILE
// ============================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, TrendingUp, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { CategoryProductComparison } from '@/types/citations';

interface CategoryDetailViewProps {
  categoryName: string;
  data: CategoryProductComparison[];
  loading?: boolean;
}

export function CategoryDetailView({ categoryName, data, loading }: CategoryDetailViewProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item => 
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate category stats
  const avgCitations = data.length > 0 
    ? (data.reduce((sum, p) => sum + p.total_citations, 0) / data.length).toFixed(1)
    : '0';
  const topProduct = data[0];
  const avgRank = data.length > 0
    ? (data.reduce((sum, p) => sum + p.amazon_rank, 0) / data.length).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded w-40 animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
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

      {/* Category Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Category: {categoryName}</CardTitle>
          <p className="text-sm text-muted-foreground">{data.length} products found</p>
        </CardHeader>
      </Card>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-muted-foreground">Avg Citations</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{avgCitations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-muted-foreground">Top Product</span>
            </div>
            <div className="text-sm font-bold text-green-600 truncate">
              {topProduct?.product_name || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">{topProduct?.total_citations || 0} citations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Avg Rank</span>
            </div>
            <div className="text-2xl font-bold">{avgRank}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Products ({filteredData.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">Product</th>
                  <th className="text-center py-2 px-3 font-semibold">Rank</th>
                  <th className="text-center py-2 px-3 font-semibold">Total</th>
                  <th className="text-center py-2 px-3 font-semibold">Company</th>
                  <th className="text-center py-2 px-3 font-semibold">3rd Party</th>
                  <th className="text-center py-2 px-3 font-semibold">UGC</th>
                  <th className="text-center py-2 px-3 font-semibold">Domains</th>
                  <th className="text-center py-2 px-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="max-h-[500px] overflow-y-auto">
                {filteredData.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-2 px-3">
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand_name}</p>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Badge className={product.amazon_rank <= 3 ? 'bg-green-600' : 'bg-orange-600'}>
                        #{product.amazon_rank}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{product.total_citations}</td>
                    <td className="py-2 px-3 text-center text-blue-600">{product.company_citations}</td>
                    <td className="py-2 px-3 text-center text-green-600">{product.third_party_citations}</td>
                    <td className="py-2 px-3 text-center text-purple-600">{product.ugc_citations}</td>
                    <td className="py-2 px-3 text-center">
                      <Badge variant="outline" className="text-xs">
                        {product.citation_domains?.length || 0}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Link href={`/citations/products/${product.response_id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No products found matching your search
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

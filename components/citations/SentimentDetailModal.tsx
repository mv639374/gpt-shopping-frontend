'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingDown, TrendingUp, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { CitationSentimentImpact } from '@/types/citations';

interface ProductDetail {
  prompt_response_id: string;
  product_name: string;
  brand_name: string;
  amazon_rank: number | null;
  citation_count: number;
}

interface SentimentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentimentData: CitationSentimentImpact;
}

export function SentimentDetailModal({
  isOpen,
  onClose,
  sentimentData,
}: SentimentDetailModalProps) {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sentimentData) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sentimentData]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const sentiment = sentimentData.sentiment_category;

      // 1) Get all prompt_response_ids for this sentiment
      const { data: rbmRows, error: rbmError } = await supabase
        .from('response_brand_mentions')
        .select('prompt_response_id')
        .eq('overall_sentiment', sentiment);

      if (rbmError) throw rbmError;

      const responseIdList: string[] = (rbmRows ?? []).map(
        (r: any) => r.prompt_response_id as string,
      );

      if (responseIdList.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // Limit to keep queries sane
      const limitedIds = responseIdList.slice(0, 500);

      // 2) Citation counts per prompt_response_id
      const { data: citationRows, error: citError } = await supabase
        .from('citations')
        .select('prompt_response_id')
        .in('prompt_response_id', limitedIds);

      if (citError) throw citError;

      const citationMap: Record<string, number> = {};
      (citationRows ?? []).forEach((c: any) => {
        const id = c.prompt_response_id as string;
        citationMap[id] = (citationMap[id] ?? 0) + 1;
      });

      // 3) Product details from card-data-3 + best Amazon rank from marketplace-data-4
      const { data: cardRows, error: cardError } = await supabase
        .from('card-data-3')
        .select(
          `
          id,
          response_id,
          product_name,
          brand_name,
          marketplace-data-4 (
            position_rank,
            marketplace
          )
        `,
        )
        .in('response_id', limitedIds);

      if (cardError) throw cardError;

      const productMap: Record<string, ProductDetail> = {};

      (cardRows ?? []).forEach((card: any) => {
        const prId = card.response_id as string;
        const productName = card.product_name ?? 'Unknown product';
        const brandName = card.brand_name ?? 'Unknown brand';
        const marketplaceRows: any[] = card['marketplace-data-4'] ?? [];

        const amazonRanks = marketplaceRows
          .filter(
            (m: any) =>
              m.marketplace &&
              m.marketplace.toLowerCase().includes('amazon'),
          )
          .map((m: any) => m.position_rank)
          .filter((r: any) => r != null);

        const bestRank =
          amazonRanks.length > 0 ? Math.min(...amazonRanks) : null;

        const existing = productMap[prId];

        // Keep best (lowest) rank if multiple cards map to same prompt_response_id
        if (!existing) {
          productMap[prId] = {
            prompt_response_id: prId,
            product_name: productName,
            brand_name: brandName,
            amazon_rank: bestRank,
            citation_count: citationMap[prId] ?? 0,
          };
        } else {
          const newBest =
            bestRank == null
              ? existing.amazon_rank
              : existing.amazon_rank == null
              ? bestRank
              : Math.min(existing.amazon_rank, bestRank);

          productMap[prId] = {
            ...existing,
            amazon_rank: newBest,
          };
        }
      });

      const productList: ProductDetail[] = Object.values(productMap);

      // Sort: no rank first, then by worse rank, then by citations
      productList.sort((a, b) => {
        if (a.amazon_rank == null && b.amazon_rank != null) return -1;
        if (a.amazon_rank != null && b.amazon_rank == null) return 1;
        if (a.amazon_rank != null && b.amazon_rank != null) {
          if (a.amazon_rank !== b.amazon_rank) {
            return b.amazon_rank - a.amazon_rank;
          }
        }
        return b.citation_count - a.citation_count;
      });

      setProducts(productList);
    } catch (err: any) {
      console.error('Error fetching products for sentiment modal:', err);
      setError(err.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = () => {
    const sentiment = sentimentData.sentiment_category?.toLowerCase() ?? '';
    if (sentiment.includes('positive'))
      return 'text-green-600 bg-green-50 dark:bg-green-950/20';
    if (sentiment.includes('negative'))
      return 'text-red-600 bg-red-50 dark:bg-red-950/20';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20';
  };

  const getRankBadgeVariant = (rank: number | null) => {
    if (rank == null) return 'destructive' as const;
    if (rank <= 3) return 'default' as const;
    if (rank <= 7) return 'secondary' as const;
    return 'outline' as const;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-lg font-semibold ${getSentimentColor()}`}
            >
              {sentimentData.sentiment_category} Sentiment
            </span>
            <span className="text-muted-foreground text-sm">
              {sentimentData.products_affected} products
            </span>
          </DialogTitle>
          <DialogDescription>
            Products whose responses carry{' '}
            {sentimentData.sentiment_category?.toLowerCase()} citations and
            their Amazon rankings.
          </DialogDescription>
        </DialogHeader>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3 pb-4 border-b flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {sentimentData.citation_count}
            </div>
            <div className="text-xs text-muted-foreground">Citations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {sentimentData.avg_amazon_rank != null
                ? sentimentData.avg_amazon_rank.toFixed(1)
                : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Avg Amazon Rank</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {sentimentData.low_rank_products}
            </div>
            <div className="text-xs text-muted-foreground">Low Rank (8+)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {sentimentData.no_rank_products}
            </div>
            <div className="text-xs text-muted-foreground">No Rank</div>
          </div>
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto pr-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold">Error loading products</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No products found for this sentiment.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product.prompt_response_id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">
                          {product.product_name}
                        </span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {product.brand_name}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Response: {product.prompt_response_id.slice(0, 8)}…
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-center">
                        <div className="text-sm font-bold">
                          {product.citation_count}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          citations
                        </div>
                      </div>

                      <Badge
                        variant={getRankBadgeVariant(product.amazon_rank)}
                        className="min-w-[90px] justify-center"
                      >
                        {product.amazon_rank == null ? (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            No Rank
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            {product.amazon_rank <= 7 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            #{product.amazon_rank}
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

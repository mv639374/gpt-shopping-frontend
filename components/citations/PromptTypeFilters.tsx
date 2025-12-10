// ============================================
// File: components/citations/PromptTypeFilters.tsx
// REPLACE ENTIRE FILE - FILTER OUT EMPTY VALUES
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { FilterOption, CitationFilters } from '@/types/citations';

interface PromptTypeFiltersProps {
  filterOptions: FilterOption[];
  onFiltersChange: (filters: CitationFilters) => void;
  loading?: boolean;
}

export function PromptTypeFilters({ filterOptions, onFiltersChange, loading }: PromptTypeFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>('__all__');

  // Filter out empty strings and null values
  const categories = filterOptions
    .filter(f => f.filter_type === 'category' && f.filter_value && f.filter_value.trim() !== '')
    .slice(0, 20);
  
  const marketplaces = filterOptions
    .filter(f => f.filter_type === 'marketplace' && f.filter_value && f.filter_value.trim() !== '')
    .slice(0, 15);

  useEffect(() => {
    onFiltersChange({
      category: selectedCategory === '__all__' ? undefined : selectedCategory,
      marketplace: selectedMarketplace === '__all__' ? undefined : selectedMarketplace,
    });
  }, [selectedCategory, selectedMarketplace]);

  const handleClearFilters = () => {
    setSelectedCategory('__all__');
    setSelectedMarketplace('__all__');
  };

  const hasActiveFilters = selectedCategory !== '__all__' || selectedMarketplace !== '__all__';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-2">
            <div className="h-8 bg-muted rounded w-40 animate-pulse" />
            <div className="h-8 bg-muted rounded w-40 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Filters:</span>
          
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue placeholder="Product Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categories.map((cat, idx) => (
                <SelectItem key={`cat-${idx}-${cat.filter_value}`} value={cat.filter_value} className="text-xs">
                  {cat.filter_value} ({cat.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Marketplace Filter */}
          <Select value={selectedMarketplace} onValueChange={setSelectedMarketplace}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="Marketplace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Marketplaces</SelectItem>
              {marketplaces.map((mkt, idx) => (
                <SelectItem key={`mkt-${idx}-${mkt.filter_value}`} value={mkt.filter_value} className="text-xs">
                  {mkt.filter_value} ({mkt.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs bg-muted hover:bg-muted/80 rounded flex items-center gap-1 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex gap-1 ml-2">
              {selectedCategory !== '__all__' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {selectedCategory}
                </Badge>
              )}
              {selectedMarketplace !== '__all__' && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                  {selectedMarketplace}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

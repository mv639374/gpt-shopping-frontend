"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Package, Users, Trophy, TrendingUp, ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarketplaceSelector } from "@/components/MarketplaceSelector";
import { KPICard } from "@/components/KPICard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/stores/useAppStore";
import { useApi } from "@/hooks/useApi";
import type { CategoryAnalytics } from "@/types";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const category = decodeURIComponent(params.category as string);
  const { selectedMarketplace } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [open, setOpen] = useState(false);
  
  const { data, loading, fetchData } = useApi<CategoryAnalytics>(
    `/analytics/category/${encodeURIComponent(selectedCategory)}/${selectedMarketplace}`
  );

  const { data: categoriesData } = useApi<{ categories: string[] }>("/analytics/categories");

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedMarketplace, fetchData]);

  if (loading) {
    return <LoadingSpinner message="Loading category analytics..." />;
  }

  // Calculate max product count for chart scaling
  const maxProductCount = data?.marketplace_rankings.reduce(
    (max, ranking) => Math.max(max, ranking.product_coverage),
    0
  ) || 1;

  return (
    <div className="space-y-6">
      {/* Header with Back Button and Selectors */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <MarketplaceSelector />
        </div>

        {/* Category Selector with Search */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[240px] justify-between"
            >
              <span className="truncate">{selectedCategory}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList className="max-h-[300px]">
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  {categoriesData?.categories.map((cat) => (
                    <CommandItem
                      key={cat}
                      value={cat}
                      onSelect={(currentValue) => {
                        setSelectedCategory(currentValue);
                        setOpen(false);
                      }}
                    >
                      {cat}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-foreground">{selectedCategory}</h1>
        <p className="text-muted-foreground">
          Category analytics for <span className="font-semibold text-primary">{selectedMarketplace}</span>
        </p>
      </motion.div>

      {data && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPICard
              title="Total Products"
              value={data.kpis.total_products}
              subtitle={`${selectedMarketplace} appears in`}
              icon={Package}
              color="text-blue-600"
              bgColor="bg-blue-50 dark:bg-blue-950"
              delay={0.2}
              isPercentage={false}
            />
            <KPICard
              title="Marketplaces"
              value={data.kpis.total_marketplaces}
              subtitle="in this category"
              icon={Users}
              color="text-purple-600"
              bgColor="bg-purple-50 dark:bg-purple-950"
              delay={0.25}
              isPercentage={false}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-yellow-50 dark:bg-yellow-950 border-none shadow-md h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg text-yellow-600 bg-opacity-10">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground">Top Marketplace</h3>
                    <p className="text-lg font-bold text-foreground truncate">
                      {data.kpis.top_marketplace}
                    </p>
                    <p className="text-xs text-muted-foreground">#1 in category</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <Card className="bg-green-50 dark:bg-green-950 border-none shadow-md h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg text-green-600 bg-opacity-10">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground">Your Rank</h3>
                    <p className="text-2xl font-bold text-foreground">
                      {data.kpis.selected_marketplace_rank ? `#${data.kpis.selected_marketplace_rank}` : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{selectedMarketplace}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Products Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>
                  Products in this Category ({data.products.length})
                </CardTitle>
                <CardDescription>
                  Products where {selectedMarketplace} appears (out of {data.total_category_products} total products)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {data.products.map((product, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: idx * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-muted/30 rounded-lg border border-border hover:border-primary transition-all cursor-pointer"
                      onClick={() => {
                        router.push(`/dashboard/product/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(product)}`);
                      }}

                    >
                      <p className="text-xs font-medium line-clamp-2" title={product}>
                        {product}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Marketplace Rankings Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Complete Marketplace Rankings</CardTitle>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="focus:outline-none">
                          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="text-sm">
                          Rankings are based on <strong>normalized scores</strong> calculated from marketplace visibility, 
                          position, and frequency across all products in this category.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardDescription>
                  Product coverage by marketplace (out of {data.total_category_products} total products)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto pb-2">
                  <div 
                    className="flex items-end gap-4 min-w-max relative"  
                    style={{ paddingBottom: '10px', paddingLeft: '10px', minHeight: '450px' }}  // I changed here
                  >
                    {data.marketplace_rankings.map((ranking, idx) => {
                      const barHeight = (ranking.product_coverage / maxProductCount) * 280;
                      const barColor = 
                        ranking.rank === 1 ? 'bg-yellow-500 hover:bg-yellow-600' :
                        ranking.rank === 2 ? 'bg-gray-400 hover:bg-gray-500' :
                        ranking.rank === 3 ? 'bg-orange-600 hover:bg-orange-700' :
                        'bg-primary hover:bg-primary/80';

                      return (
                        <motion.div
                          key={idx}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          transition={{ duration: 0.5, delay: idx * 0.03 }}
                          className="flex flex-col items-center justify-end"
                          style={{ minWidth: '80px', height: '100%' }}
                        >
                          {/* Label positioned just above bar */}
                          <div className="flex-none mb-2 text-sm font-bold text-foreground">
                            {ranking.product_coverage}/{ranking.total_products}
                          </div>

                          {/* Bar with tooltip */}
                          <div className="group relative flex-none">
                            <div
                              className={cn(
                                "w-16 rounded-t-lg cursor-pointer transition-all duration-200",
                                barColor
                              )}
                              style={{ height: `${barHeight}px`, minHeight: '20px' }}
                            />

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-popover border rounded-md p-2 shadow-lg z-10 whitespace-nowrap">
                              <p className="text-xs font-semibold">{ranking.marketplace}</p>
                              <p className="text-xs text-muted-foreground">
                                Rank #{ranking.rank}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ranking.product_coverage}/{ranking.total_products} products
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ({Math.round((ranking.product_coverage / ranking.total_products) * 100)}%)
                              </p>
                            </div>
                          </div>

                          {/* Bottom section: Fixed space below baseline */}
                          <div className="flex flex-col items-center justify-start" style={{ height: '60px', marginTop: '8px' }}>
                            {/* Marketplace name (horizontal, expands downward) */}
                            <div className="w-20 text-center">
                              <p className="text-xs font-medium text-foreground line-clamp-3" title={ranking.marketplace}>
                                {ranking.marketplace}
                              </p>
                            </div>

                            {/* Rank number */}
                            <div className="mt-1 text-xs font-semibold text-muted-foreground">
                              #{ranking.rank}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}

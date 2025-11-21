"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MarketplacePodium } from "@/components/MarketplacePodium";
import { useApi } from "@/hooks/useApi";
import type { ProductAnalytics } from "@/types";

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const category = decodeURIComponent(params.category as string);
  const product = decodeURIComponent(params.product as string);

  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedProduct, setSelectedProduct] = useState(product);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const { data: categoriesData } = useApi<{ categories: string[] }>("/analytics/categories");
  const { data: productsData, fetchData: fetchProducts } = useApi<{ products: string[] }>(
    `/analytics/products/${encodeURIComponent(selectedCategory)}`
  );
  const { data, loading, fetchData } = useApi<ProductAnalytics>(
    `/analytics/product/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedProduct)}`
  );

  // Fetch products when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory, fetchProducts]);

  // Auto-select first product when products data loads or category changes
  useEffect(() => {
    if (productsData?.products && productsData.products.length > 0) {
      // Automatically select the first product
      const firstProduct = productsData.products[0];
      setSelectedProduct(firstProduct);
    }
  }, [productsData]);

  // Fetch product analytics when product changes
  useEffect(() => {
    if (selectedCategory && selectedProduct) {
      fetchData();
    }
  }, [selectedCategory, selectedProduct, fetchData]);

  if (loading) {
    return <LoadingSpinner message="Loading product analytics..." />;
  }

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

          {/* Product Selector */}
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={productOpen}
                className="w-[280px] justify-between"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="truncate">{selectedProduct}</span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0">
              <Command>
                <CommandInput placeholder="Search product..." />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>No product found.</CommandEmpty>
                  <CommandGroup>
                    {productsData?.products.map((prod) => (
                      <CommandItem
                        key={prod}
                        value={prod}
                        onSelect={(currentValue) => {
                          setSelectedProduct(currentValue);
                          setProductOpen(false);
                        }}
                      >
                        {prod}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Category Selector */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
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
                        setCategoryOpen(false);
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
        <h1 className="text-4xl font-bold mb-2 text-foreground">{selectedProduct}</h1>
        <p className="text-muted-foreground">
          Product analytics for <span className="font-semibold">{selectedCategory}</span> category
        </p>
      </motion.div>

      {/* Marketplace Podium */}
      {data && data.marketplace_podium.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MarketplacePodium podium={data.marketplace_podium} />
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No marketplace data available for this product</p>
        </div>
      )}
    </div>
  );
}

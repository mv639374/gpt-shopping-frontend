"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketplaceSelector } from "@/components/MarketplaceSelector";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAppStore } from "@/stores/useAppStore";
import { useApi } from "@/hooks/useApi";
import type { DetailedHeatmapData } from "@/types";

export default function DetailedHeatmapPage() {
  const router = useRouter();
  const { selectedMarketplace } = useAppStore();
  const [showAll, setShowAll] = useState(false);
  
  const { data, loading, fetchData } = useApi<DetailedHeatmapData>(
    `/analytics/detailed-heatmap/${selectedMarketplace}?show_all=${showAll}`
  );

  useEffect(() => {
    fetchData();
  }, [selectedMarketplace, showAll, fetchData]);

  const handleCategoryClick = (category: string) => {
    router.push(`/dashboard/category/${encodeURIComponent(category)}`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading detailed heatmap..." />;
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Selector */}
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-foreground">Detailed Heatmap</h1>
        <p className="text-muted-foreground">
          Complete marketplace rankings across all product categories
        </p>
      </motion.div>

      {/* Detailed Heatmap */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-muted z-10">
                    <tr className="border-b-2">
                      <th className="text-left p-3 font-semibold text-foreground w-1/6">
                        Category
                      </th>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => (
                        <th
                          key={rank}
                          className="text-center p-3 font-semibold text-foreground"
                        >
                          #{rank}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.categories.map((category, idx) => (
                      <motion.tr
                        key={category.category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.02 }}
                        className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => handleCategoryClick(category.category)}
                      >
                        <td className="p-3 font-medium text-foreground bg-muted/10">
                          {category.category}
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rank) => {
                          const marketplace = category.marketplaces.find(
                            (m) => m.rank === rank
                          );

                          if (!marketplace) {
                            return (
                              <td
                                key={rank}
                                className="text-center p-3 text-muted-foreground"
                              >
                                -
                              </td>
                            );
                          }

                          return (
                            <td
                              key={rank}
                              className={`text-center p-3 text-xs ${
                                marketplace.is_rank_1 && !marketplace.is_selected
                                  ? "bg-red-100 dark:bg-red-900/40 font-bold text-red-700 dark:text-red-400"
                                  : marketplace.is_selected
                                  ? "bg-primary/20 font-semibold text-primary"
                                  : "text-foreground"
                              }`}
                            >
                              {marketplace.name}
                            </td>
                          );
                        })}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Show More/Less Button */}
              <div className="p-4 border-t flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  className="gap-2"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Show Less ({data.showing_categories} of {data.total_categories})
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show All Categories ({data.showing_categories} of {data.total_categories})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

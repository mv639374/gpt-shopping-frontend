"use client";

import { motion } from "framer-motion";
import { Trophy, DollarSign, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MarketplacePodiumItem } from "@/types";
import { cn } from "@/lib/utils";

interface PodiumProps {
  podium: MarketplacePodiumItem[];
}

export function MarketplacePodium({ podium }: PodiumProps) {
  // Get top 3 for podium display
  const top3 = podium.slice(0, 3);
  const rest = podium.slice(3);

  // Podium heights (in pixels)
  const podiumHeights = {
    1: 220, // Gold - tallest
    2: 180, // Silver
    3: 140, // Bronze
  };

  const podiumColors = {
    1: "from-yellow-400 to-yellow-600",
    2: "from-gray-300 to-gray-500",
    3: "from-orange-500 to-orange-700",
  };

  const rankLabels = {
    1: { emoji: "🥇", text: "1st" },
    2: { emoji: "🥈", text: "2nd" },
    3: { emoji: "🥉", text: "3rd" },
  };

  // Reorder for visual podium: [2nd, 1st, 3rd]
  const podiumOrder = top3.length >= 2 ? [top3[1], top3[0], top3[2]].filter(Boolean) : top3;

  return (
    <div className="space-y-8">
      {/* Podium Display */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-4 px-4">
          {podiumOrder.map((item, idx) => {
            if (!item) return null;
            
            const rank = item.rank as 1 | 2 | 3;
            const height = podiumHeights[rank];
            const gradient = podiumColors[rank];
            const label = rankLabels[rank];

            return (
              <motion.div
                key={item.marketplace}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="flex flex-col items-center"
                style={{ width: '200px' }}
              >
                {/* Marketplace Card */}
                <Card className="mb-4 w-full shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    {/* Rank Badge */}
                    <div className="mb-3">
                      <span className="text-4xl">{label.emoji}</span>
                    </div>

                    {/* Marketplace Name */}
                    <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                      {item.marketplace}
                    </h3>

                    {/* Price */}
                    {item.price && (
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-foreground">
                          {item.currency} {item.price}
                        </span>
                      </div>
                    )}

                    {/* Delivery */}
                    {item.delivery_days && (
                      <div className="flex items-center justify-center gap-1">
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="text-xs text-muted-foreground">
                          {item.delivery_days} days
                        </span>
                      </div>
                    )}

                    {/* Rank Label */}
                    <div className="mt-3 text-xs font-semibold text-muted-foreground">
                      Rank {label.text}
                    </div>
                  </CardContent>
                </Card>

                {/* Podium Block */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}px` }}
                  transition={{ duration: 0.8, delay: idx * 0.2 + 0.3 }}
                  className={cn(
                    "w-full rounded-t-xl bg-gradient-to-b shadow-lg relative overflow-hidden",
                    gradient
                  )}
                >
                  {/* Rank Number on Podium */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold text-white/30">{rank}</span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of Rankings */}
      {rest.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Other Marketplaces</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((item, idx) => (
              <motion.div
                key={item.marketplace}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground line-clamp-1">
                        {item.marketplace}
                      </h4>
                      <span className="text-sm font-bold text-muted-foreground">
                        #{item.rank}
                      </span>
                    </div>

                    {item.price && (
                      <div className="flex items-center gap-1 text-sm mb-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span>{item.currency} {item.price}</span>
                      </div>
                    )}

                    {item.delivery_days && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Truck className="h-3 w-3" />
                        <span>{item.delivery_days} days delivery</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";

// import { motion } from "framer-motion";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { LinkIcon, TrendingUp, TrendingDown } from "lucide-react";
// import { useRouter } from "next/navigation";
// import type { CitationMetrics } from "@/types";

// interface CitationPerformanceCardProps {
//   data: CitationMetrics;
//   delay?: number;
// }

// export function CitationPerformanceCard({ data, delay = 0 }: CitationPerformanceCardProps) {
//   const router = useRouter();

//   const getTrendIcon = (change: number) => {
//     if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
//     if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
//     return null;
//   };

//   const getTrendColor = (change: number) => {
//     if (change > 0) return "text-green-600";
//     if (change < 0) return "text-red-600";
//     return "text-muted-foreground";
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       className="cursor-pointer"
//       onClick={() => router.push("/dashboard/citation-deep-dive")}
//     >
//       <Card className="shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-card to-cyan-50 dark:to-cyan-950/20 border-cyan-200 dark:border-cyan-800">
//         <CardHeader className="pb-3">
//           <div className="flex items-center gap-2">
//             <LinkIcon className="h-5 w-5 text-cyan-600" />
//             <CardTitle className="text-lg">Citation Performance</CardTitle>
//           </div>
//           <CardDescription className="text-xs">
//             How AI responses cite your marketplace
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Citation Share */}
//           <div>
//             <div className="flex items-baseline gap-2 mb-1">
//               <span className="text-3xl font-bold text-cyan-700 dark:text-cyan-500">
//                 {data.citation_share}%
//               </span>
//               {data.trend.citation_share_change !== 0 && (
//                 <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trend.citation_share_change)}`}>
//                   {getTrendIcon(data.trend.citation_share_change)}
//                   <span>{Math.abs(data.trend.citation_share_change)}%</span>
//                 </div>
//               )}
//             </div>
//             <p className="text-xs text-muted-foreground">Citation Share</p>
//           </div>

//           {/* Citation Rank */}
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-2xl font-bold text-foreground">
//                 {data.citation_rank ? `#${data.citation_rank}` : "N/A"}
//               </p>
//               <p className="text-xs text-muted-foreground">Citation Rank</p>
//             </div>
//             <div className="text-right">
//               <p className="text-lg font-semibold text-foreground">
//                 {data.response_inclusion_rate}%
//               </p>
//               <p className="text-xs text-muted-foreground">Response Rate</p>
//             </div>
//           </div>

//           {/* Divider */}
//           <div className="border-t border-cyan-200 dark:border-cyan-800" />

//           {/* Top Citation Sources */}
//           <div>
//             <p className="text-xs font-semibold text-foreground mb-2">Top Citation Sources</p>
//             <div className="space-y-2">
//               {data.top_citation_sources.slice(0, 3).map((source, idx) => (
//                 <div key={source.domain} className="flex items-center justify-between">
//                   <div className="flex items-center gap-2 flex-1 min-w-0">
//                     <div className={`w-1 h-8 rounded-full ${
//                       idx === 0 ? 'bg-cyan-600' :
//                       idx === 1 ? 'bg-cyan-500' :
//                       'bg-cyan-400'
//                     }`} />
//                     <span className="text-xs text-foreground truncate" title={source.domain}>
//                       {source.domain}
//                     </span>
//                   </div>
//                   <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-500">
//                     {source.share}%
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Click to explore */}
//           <div className="pt-2 text-center">
//             <p className="text-xs text-cyan-700 dark:text-cyan-500 font-medium">
//               Click to explore detailed analysis →
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

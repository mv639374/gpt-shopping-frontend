// "use client";

// import { motion } from "framer-motion";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { MessageSquare, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import type { PromptIntelligence } from "@/types";

// interface PromptIntelligenceCardProps {
//   data: PromptIntelligence;
//   delay?: number;
// }

// export function PromptIntelligenceCard({ data, delay = 0 }: PromptIntelligenceCardProps) {
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
//       onClick={() => router.push("/dashboard/prompt-intelligence")}
//     >
//       <Card className="shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-card to-blue-50 dark:to-blue-950/20 border-blue-200 dark:border-blue-800">
//         <CardHeader className="pb-3">
//           <div className="flex items-center gap-2">
//             <MessageSquare className="h-5 w-5 text-blue-600" />
//             <CardTitle className="text-lg">Prompt Intelligence</CardTitle>
//           </div>
//           <CardDescription className="text-xs">
//             Share of Voice & topic insights
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Share of Voice */}
//           <div>
//             <div className="flex items-baseline gap-2 mb-1">
//               <span className="text-3xl font-bold text-blue-700 dark:text-blue-500">
//                 {data.share_of_voice}%
//               </span>
//               {data.trend.sov_change !== 0 && (
//                 <div className={`flex items-center gap-1 text-sm ${getTrendColor(data.trend.sov_change)}`}>
//                   {getTrendIcon(data.trend.sov_change)}
//                   <span>{Math.abs(data.trend.sov_change)}%</span>
//                 </div>
//               )}
//             </div>
//             <p className="text-xs text-muted-foreground">Share of Voice (SoV)</p>
//           </div>

//           {/* SoV Rank & Avg Rank */}
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-2xl font-bold text-foreground">
//                 {data.sov_rank ? `#${data.sov_rank}` : "N/A"}
//               </p>
//               <p className="text-xs text-muted-foreground">SoV Rank</p>
//             </div>
//             <div className="text-right">
//               <p className="text-lg font-semibold text-foreground">
//                 {data.average_rank.toFixed(1)}
//               </p>
//               <p className="text-xs text-muted-foreground">Avg Rank</p>
//             </div>
//           </div>

//           {/* Divider */}
//           <div className="border-t border-blue-200 dark:border-blue-800" />

//           {/* Top Trigger Topics */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-xs font-semibold text-green-700 dark:text-green-500">
//                 ✓ Top Topics
//               </p>
//               <ChevronRight className="h-3 w-3 text-muted-foreground" />
//             </div>
//             <div className="space-y-1">
//               {data.top_trigger_topics.map((topic, idx) => (
//                 <div key={idx} className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 rounded px-2 py-1">
//                   <span className="text-xs text-foreground truncate" title={topic.topic}>
//                     {topic.topic}
//                   </span>
//                   <span className="text-xs font-semibold text-green-700 dark:text-green-500">
//                     #{topic.avg_rank.toFixed(1)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Weakness Topics */}
//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-xs font-semibold text-red-700 dark:text-red-500">
//                 ⚠ Needs Improvement
//               </p>
//               <ChevronRight className="h-3 w-3 text-muted-foreground" />
//             </div>
//             <div className="space-y-1">
//               {data.weakness_topics.slice(0, 2).map((topic, idx) => (
//                 <div key={idx} className="flex items-center justify-between bg-red-50 dark:bg-red-950/30 rounded px-2 py-1">
//                   <span className="text-xs text-foreground truncate" title={topic.topic}>
//                     {topic.topic}
//                   </span>
//                   <span className="text-xs font-semibold text-red-700 dark:text-red-500">
//                     #{topic.avg_rank.toFixed(1)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Click to explore */}
//           <div className="pt-2 text-center">
//             <p className="text-xs text-blue-700 dark:text-blue-500 font-medium">
//               Click to explore detailed insights →
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }

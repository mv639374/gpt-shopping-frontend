// "use client";

// import { useEffect } from "react";
// import { useApi } from "@/hooks/useApi";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { LoaderCircle } from "lucide-react";
// import { useAppStore } from "@/stores/useAppStore";
// import { useRouter } from "next/navigation";
// import type { PromptIntelligence } from "@/types";

// export default function PromptIntelligencePage() {
//   const { selectedMarketplace } = useAppStore();
//   const { data, loading, fetchData } = useApi<PromptIntelligence>(
//     `/analytics/prompt-intelligence/${selectedMarketplace}`
//   );
//   const router = useRouter();

//   useEffect(() => { fetchData(); }, [selectedMarketplace, fetchData]);

//   if (loading || !data)
//     return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin" /></div>;

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 p-4">
//       <h1 className="text-3xl font-bold mb-4">Prompt Intelligence</h1>

//       <Card className="mb-6">
//         <CardHeader>
//           <CardTitle>Summary Metrics</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
//             <div>
//               <p className="text-4xl font-semibold">{data.share_of_voice.toFixed(2)}%</p>
//               <p className="text-muted-foreground">Share of Voice</p>
//             </div>
//             <div>
//               <p className="text-4xl font-semibold">{data.sov_rank ?? "N/A"}</p>
//               <p className="text-muted-foreground">SoV Rank</p>
//             </div>
//             <div>
//               <p className="text-4xl font-semibold">{data.total_unique_prompts}</p>
//               <p className="text-muted-foreground">Unique Prompts</p>
//             </div>
//             <div>
//               <p className="text-4xl font-semibold">{data.average_rank.toFixed(2)}</p>
//               <p className="text-muted-foreground">Average Rank</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Top Trigger Topics</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="list-disc ml-5 space-y-1 text-lg">
//             {data.top_trigger_topics.map((topic, idx) => (
//               <li key={idx} title={`${topic.topic} - Avg Rank: ${topic.avg_rank}`}>
//                 <strong>{topic.topic}</strong> (Avg Rank: {topic.avg_rank.toFixed(2)})
//               </li>
//             ))}
//           </ul>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Weakness Topics</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="list-disc ml-5 space-y-1 text-lg">
//             {data.weakness_topics.map((topic, idx) => (
//               <li key={idx} title={`${topic.topic} - Avg Rank: ${topic.avg_rank}`}>
//                 <strong>{topic.topic}</strong> (Avg Rank: {topic.avg_rank.toFixed(2)})
//               </li>
//             ))}
//           </ul>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// "use client";

// import { useEffect } from "react";
// import { useApi } from "@/hooks/useApi";
// import { useParams } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { LoaderCircle } from "lucide-react";
// import { useAppStore } from "@/stores/useAppStore";

// export default function PromptDetailPage() {
//   const params = useParams();
//   const prompt = decodeURIComponent(params.prompt as string);
//   const { selectedMarketplace } = useAppStore();

//   const { data, loading, fetchData } = useApi<any>(
//     `/analytics/prompt-detail/${selectedMarketplace}?prompt=${encodeURIComponent(prompt)}`
//   );

//   useEffect(() => { fetchData(); }, [selectedMarketplace, prompt, fetchData]);

//   if (loading || !data)
//     return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin" /></div>;

//   return (
//     <div className="max-w-5xl mx-auto p-4 space-y-8">
//       <h1 className="text-2xl font-bold">{prompt}</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle>Marketplace Podium for This Prompt</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="space-y-2">
//             {data.podium.map((item: any, idx: number) => (
//               <li key={idx}>
//                 <strong>{item.marketplace}</strong> - Rank #{item.rank}
//               </li>
//             ))}
//           </ul>
//           <p>Total mentions: {data.total_mentions}</p>
//           <p>Your rank: {data.our_rank ?? "N/A"}</p>
//         </CardContent>
//       </Card>

//       {/* Optional: Show snippets, citations, sentiment here */}
//     </div>
//   );
// }

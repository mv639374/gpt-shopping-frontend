// "use client";
// import { useEffect } from "react";
// import { useApi } from "@/hooks/useApi";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useAppStore } from "@/stores/useAppStore";
// import { LoaderCircle } from "lucide-react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import type { CitationMetrics, CitationSource } from "@/types";

// export default function CitationDeepDivePage() {
//   const { selectedMarketplace } = useAppStore();
//   const { data, loading, error, fetchData } = useApi<CitationMetrics>(
//     `/analytics/citation-detail/${selectedMarketplace}`
//   );
//   const router = useRouter();

//   useEffect(() => { fetchData(); }, [selectedMarketplace, fetchData]);

//   if (loading || !data)
//     return <div className="flex items-center justify-center h-64"><LoaderCircle className="animate-spin" /></div>;

//   return (
//     <div className="space-y-8">
//       <h1 className="text-3xl font-bold text-cyan-800">Citation Deep Dive</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         <Card className="bg-gradient-to-br from-cyan-50 to-emerald-50">
//           <CardHeader>
//             <CardTitle className="text-cyan-700">Citation KPIs</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="space-y-2">
//               <li>Citation Share: <span className="text-cyan-700 font-bold">{data.citation_share}%</span></li>
//               <li>Citation Rank: <span className="text-cyan-700 font-bold">{data.citation_rank ?? 'N/A'}</span></li>
//               <li>Top Citation Sources: 
//                 <ul>
//                   {data.top_citation_sources.map((src: CitationSource) => (
//                     <li key={src.domain} className="ml-2">
//                       <span className="text-teal-800">{src.domain}</span> <span className="text-cyan-600">({src.share}%)</span>
//                     </li>
//                   ))}
//                 </ul>
//               </li>
//               <li>Response Inclusion: <span className="text-cyan-700 font-bold">{data.response_inclusion_rate}%</span></li>
//             </ul>
//           </CardContent>
//         </Card>
//         <Card className="bg-gradient-to-br from-cyan-50 to-blue-50">
//           <CardHeader>
//             <CardTitle className="text-cyan-700">Top Cited Pages</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ul className="space-y-2" >
//               {data.top_cited_pages?.map((pg: {url:string, count:number, domain:string}) => (
//                 <li key={pg.url} className="flex items-center gap-2">
//                   <span className="w-2 h-2 bg-cyan-400 rounded-full" />
//                   <a
//                     className="text-cyan-700 underline"
//                     href={pg.url}
//                     target="_blank" rel="noopener noreferrer" 
//                     title={pg.url}
//                   >
//                     {pg.url.length > 50 ? pg.url.slice(0,50) + "..." : pg.url}
//                   </a>
//                   <span className="text-xs text-cyan-600">{pg.count} cites</span>
//                   <button
//                     className="ml-auto text-sm text-cyan-500 hover:underline"
//                     onClick={() => router.push(`/dashboard/citation-source/${encodeURIComponent(pg.domain)}`)}
//                   >
//                     {pg.domain}
//                   </button>
//                 </li>
//               )) || <li>No citation pages found</li>}
//             </ul>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

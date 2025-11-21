// "use client";

// import { useEffect } from "react";
// import { useApi } from "@/hooks/useApi";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useParams } from "next/navigation";
// import { LoaderCircle } from "lucide-react";

// export default function CitationSourcePage() {
//   const params = useParams();
//   const domain = decodeURIComponent(params.domain as string);

//   const { data, loading, fetchData } = useApi<any>(`/analytics/citation-source/${domain}`);

//   useEffect(() => { fetchData(); }, [domain, fetchData]);

//   if (loading || !data)
//     return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin" /></div>;

//   return (
//     <div className="max-w-5xl mx-auto p-4 space-y-6">
//       <h1 className="text-2xl font-bold">{domain} Citation Details</h1>

//       <Card>
//         <CardHeader>
//           <CardTitle>Top Cites from This Domain</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ul className="space-y-2 max-h-[500px] overflow-y-auto">
//             {data.citations.map((c: any, idx: number) => (
//               <li key={idx}>
//                 <a href={c.cit_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
//                   {c.cit_url}
//                 </a>, Category: <strong>{c.category || "Unknown"}</strong>, Prompt: {c.prompt || "N/A"}
//               </li>
//             ))}
//           </ul>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

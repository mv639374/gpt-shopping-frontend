// "use client";

// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Smile, Frown, Meh } from "lucide-react";

// interface SentimentMiniDashboardProps {
//   data: {
//     score: number;
//     breakdown: {
//       positive: number;
//       neutral: number;
//       negative: number;
//       total: number;
//     };
//     by_category: {
//       [category: string]: {
//         positive: number;
//         neutral: number;
//         negative: number;
//         total: number;
//       };
//     };
//   };
// }

// export function SentimentMiniDashboard({ data }: SentimentMiniDashboardProps) {
//   const { score, breakdown, by_category } = data;

//   return (
//     <Card className="shadow-xl bg-gradient-to-br from-green-50 to-red-50 border-green-200">
//       <CardHeader>
//         <CardTitle>Sentiment Dashboard</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex gap-4 items-center my-4">
//           <Smile className="text-green-500" /> <span>{breakdown.positive}</span>
//           <Meh className="text-gray-500" /> <span>{breakdown.neutral}</span>
//           <Frown className="text-red-500" /> <span>{breakdown.negative}</span>
//           <div className="pl-6 text-lg font-bold">
//             Net:{" "}
//             <span
//               className={
//                 score > 0
//                   ? "text-green-700"
//                   : score < 0
//                   ? "text-red-700"
//                   : "text-gray-600"
//               }
//             >
//               {score}%
//             </span>
//           </div>
//         </div>
//         <div>
//           <h4 className="mb-2 font-medium">By Category</h4>
//           <div className="grid grid-cols-3 gap-2 text-xs">
//             {Object.entries(by_category).map(([cat, v]) => (
//               <div key={cat} className="flex flex-col bg-card rounded p-2">
//                 <span className="font-semibold">{cat}</span>
//                 <div
//                   aria-label="Positive sentiment"
//                   className="h-1 rounded bg-green-500 mb-1"
//                   style={{ width: `${(v.positive / v.total) * 100}%` }}
//                 />
//                 <div
//                   aria-label="Neutral sentiment"
//                   className="h-1 rounded bg-gray-400 mb-1"
//                   style={{ width: `${(v.neutral / v.total) * 100}%` }}
//                 />
//                 <div
//                   aria-label="Negative sentiment"
//                   className="h-1 rounded bg-red-500"
//                   style={{ width: `${(v.negative / v.total) * 100}%` }}
//                 />
//                 <span>
//                   +{v.positive} | ={v.neutral} | -{v.negative}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

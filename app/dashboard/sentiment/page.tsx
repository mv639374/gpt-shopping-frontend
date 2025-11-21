// "use client";

// import { useEffect } from "react";
// import { useApi } from "@/hooks/useApi";
// import { SentimentMiniDashboard } from "@/components/SentimentMiniDashboard";
// import { LoaderCircle } from "lucide-react";
// import { useAppStore } from "@/stores/useAppStore";

// export default function SentimentPage() {
//   const { selectedMarketplace } = useAppStore();

//   const { data, loading, fetchData } = useApi<any>(
//     `/analytics/sentiment-dashboard/${selectedMarketplace}`
//   );

//   useEffect(() => { fetchData(); }, [selectedMarketplace, fetchData]);

//   if (loading || !data) {
//     return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin" /></div>;
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-green-700">Sentiment Mini Dashboard</h1>
//       <SentimentMiniDashboard data={data} />
//     </div>
//   );
// }

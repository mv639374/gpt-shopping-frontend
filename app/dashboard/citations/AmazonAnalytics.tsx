'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Package,
  Store,
  MessageSquare,
  Search,
  BarChart3,
  XCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
  ArrowLeft,
  Target,
  PieChart,
  Activity,
  Zap,
  Eye,
  ShoppingCart
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { supabase } from '@/lib/supabase/client';

const COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  red: '#ef4444',
  orange: '#ff6b35',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899'
};

interface CategoryData {
  name: string;
  shortName: string;
  promptCount: number;
  rank1: number;
  rank2_3: number;
  lowRank: number;
  noRank: number;
  total: number;
  winRate: number;
  topPosition: number;
  problemAreas: number;
}

interface GlobalStats {
  categoryData: CategoryData[];
  totals: {
    rank1: number;
    rank2_3: number;
    lowRank: number;
    noRank: number;
    prompts: number;
  };
}

interface PromptDetail {
  id: string;
  text: string;
  properties: any;
  total_products: number;
  amazon_products: number;
  amazon_best_rank: number | null;
  marketplace_data: Array<{
    marketplace: string;
    position_rank: number;
    price: number;
  }>;
}

export default function AmazonAnalytics() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicDetails, setTopicDetails] = useState<PromptDetail[]>([]);
  const [activeView, setActiveView] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch global statistics
  useEffect(() => {
    fetchGlobalStats();
  }, []);

  // Fetch topic details when selected
  useEffect(() => {
    if (selectedTopic) {
      fetchTopicDetails(selectedTopic);
    } else {
      setTopicDetails([]);
    }
  }, [selectedTopic]);

  async function fetchGlobalStats() {
    try {
      setLoading(true);

      const { data: categoryPerf, error } = await supabase.rpc('get_category_performance');
      
      if (error) throw error;

      const categoryData: CategoryData[] = categoryPerf.map((cat: any) => ({
        name: cat.category,
        shortName: cat.category.length > 10 ? cat.category.slice(0, 10) + '...' : cat.category,
        promptCount: cat.total_prompts,
        rank1: cat.rank_1,
        rank2_3: cat.rank_2 + cat.rank_3,
        lowRank: cat.low_rank,
        noRank: cat.prompts_without_amazon,
        total: cat.rank_1 + cat.rank_2 + cat.rank_3 + cat.low_rank,
        winRate: Math.round(cat.win_rate),
        topPosition: cat.rank_1 + cat.rank_2 + cat.rank_3,
        problemAreas: cat.low_rank + cat.prompts_without_amazon
      }));

      const totals = categoryData.reduce((acc, c) => ({
        rank1: acc.rank1 + c.rank1,
        rank2_3: acc.rank2_3 + c.rank2_3,
        lowRank: acc.lowRank + c.lowRank,
        noRank: acc.noRank + c.noRank,
        prompts: acc.prompts + c.promptCount
      }), { rank1: 0, rank2_3: 0, lowRank: 0, noRank: 0, prompts: 0 });

      setGlobalStats({ categoryData, totals });
    } catch (err: any) {
      console.error('Error fetching global stats:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopicDetails(topic: string) {
    try {
      const { data, error } = await supabase.rpc('get_category_details', { p_category: topic });
      
      if (error) throw error;
      
      setTopicDetails(data?.prompts || []);
    } catch (err: any) {
      console.error('Error fetching topic details:', err);
    }
  }

  const filteredPrompts = useMemo(() => {
    if (!topicDetails) return [];
    
    let filtered = topicDetails;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by active view
    if (activeView === 'low-rank') {
      filtered = filtered.filter(p => p.amazon_best_rank && p.amazon_best_rank > 3);
    } else if (activeView === 'no-rank') {
      filtered = filtered.filter(p => !p.amazon_best_rank || p.amazon_products === 0);
    } else if (activeView === 'winning') {
      filtered = filtered.filter(p => p.amazon_best_rank === 1);
    }

    return filtered;
  }, [topicDetails, searchQuery, activeView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading GPT Shopping Analytics...</p>
      </div>
    );
  }

  // Detail View (when category is selected)
  if (selectedTopic) {
    const categoryStats = globalStats?.categoryData.find(c => c.name === selectedTopic);
    
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => {
            setSelectedTopic(null);
            setActiveView('all');
            setSearchQuery('');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Overview
        </button>

        {/* Category Header with Stats */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedTopic}</h2>
              <p className="text-muted-foreground">
                Analyzing {categoryStats?.promptCount} prompts in this category
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{categoryStats?.winRate}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{categoryStats?.rank1}</div>
              <div className="text-xs text-muted-foreground">Rank #1</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{categoryStats?.rank2_3}</div>
              <div className="text-xs text-muted-foreground">Rank #2-3</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">{categoryStats?.lowRank}</div>
              <div className="text-xs text-muted-foreground">Low Rank</div>
            </div>
            <div className="bg-background rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">{categoryStats?.noRank}</div>
              <div className="text-xs text-muted-foreground">Missing</div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="bg-card border rounded-lg p-1 flex gap-1">
          {[
            { id: 'all', label: 'All Prompts', icon: Layers, count: topicDetails.length },
            { id: 'winning', label: 'Rank #1', icon: TrendingUp, count: topicDetails.filter(p => p.amazon_best_rank === 1).length },
            { id: 'low-rank', label: 'Low Rank (4+)', icon: TrendingDown, count: topicDetails.filter(p => p.amazon_best_rank && p.amazon_best_rank > 3).length },
            { id: 'no-rank', label: 'Not Appearing', icon: AlertTriangle, count: topicDetails.filter(p => !p.amazon_best_rank || p.amazon_products === 0).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all ${
                activeView === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-transparent text-muted-foreground hover:bg-secondary'
              }`}
            >
              <tab.icon size={16} />
              <span className="font-medium">{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeView === tab.id 
                  ? 'bg-primary-foreground/20' 
                  : 'bg-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
        </div>

        {/* Prompt Cards */}
        <div className="space-y-3">
          {filteredPrompts.map(prompt => (
            <div key={prompt.id} className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="font-medium flex-1 leading-relaxed">{prompt.text}</p>
                {prompt.amazon_best_rank ? (
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      prompt.amazon_best_rank === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      prompt.amazon_best_rank <= 3 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      Rank #{prompt.amazon_best_rank}
                    </span>
                  </div>
                ) : (
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Not Listed
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Package size={14} />
                  <span>{prompt.total_products} total products</span>
                </div>
                <div className="flex items-center gap-1">
                  <Store size={14} />
                  <span>{prompt.amazon_products} from Amazon</span>
                </div>
              </div>

              {/* Marketplace breakdown */}
              {prompt.marketplace_data && prompt.marketplace_data.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Top Marketplaces:</p>
                  <div className="flex flex-wrap gap-2">
                    {prompt.marketplace_data
                      .sort((a, b) => a.position_rank - b.position_rank)
                      .slice(0, 6)
                      .map((m, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs px-2 py-1 bg-secondary rounded border">
                          <span className="font-medium">{m.marketplace}</span>
                          <span className="text-muted-foreground">#{m.position_rank}</span>
                          {m.price > 0 && (
                            <span className="text-muted-foreground">• ₹{m.price.toLocaleString()}</span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredPrompts.length === 0 && (
            <div className="text-center py-16 bg-secondary/30 rounded-lg">
              <MessageSquare className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-lg font-medium text-muted-foreground">No prompts found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Global Overview Page
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart size={28} className="text-primary" />
          <h1 className="text-3xl font-bold">Amazon's Position in GPT Shopping</h1>
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
            Amazon View
          </span>
        </div>
        <p className="text-muted-foreground text-lg">
          Consolidated analysis across <strong>{globalStats?.categoryData.length}</strong> product categories and <strong>{globalStats?.totals.prompts}</strong> search prompts
        </p>
      </div>

      {/* Key Metrics Row - 4 Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-green-600 dark:bg-green-500 rounded-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-bold text-green-900 dark:text-green-100">Winning</span>
          </div>
          <div className="text-5xl font-bold text-green-900 dark:text-green-100 mb-2">
            {globalStats?.totals.rank1}
          </div>
          <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Rank #1 Positions</div>
          <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
            {Math.round((globalStats?.totals.rank1! / (globalStats?.totals.rank1! + globalStats?.totals.rank2_3! + globalStats?.totals.lowRank!)) * 100)}% win rate
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
              <Target size={20} className="text-white" />
            </div>
            <span className="font-bold text-blue-900 dark:text-blue-100">Competitive</span>
          </div>
          <div className="text-5xl font-bold text-blue-900 dark:text-blue-100 mb-2">
            {globalStats?.totals.rank2_3}
          </div>
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Rank #2-3 Positions</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Close to winning</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-yellow-600 dark:bg-yellow-500 rounded-lg">
              <TrendingDown size={20} className="text-white" />
            </div>
            <span className="font-bold text-yellow-900 dark:text-yellow-100">Needs Work</span>
          </div>
          <div className="text-5xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            {globalStats?.totals.lowRank}
          </div>
          <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Low Rank (4+)</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">Opportunity to improve</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-600 dark:bg-red-500 rounded-lg">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <span className="font-bold text-red-900 dark:text-red-100">Missing</span>
          </div>
          <div className="text-5xl font-bold text-red-900 dark:text-red-100 mb-2">
            {globalStats?.totals.noRank}
          </div>
          <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Not Appearing</div>
          <div className="text-xs text-red-600 dark:text-red-400 font-semibold">Critical gaps</div>
        </div>
      </div>

      {/* Charts Row - Donut Chart & Horizontal Bar Chart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DONUT Chart - Overall Position Distribution */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart size={20} />
            Overall Position Distribution
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <RechartsPie>
              <Pie
                data={[
                  { name: 'Rank #1', value: globalStats?.totals.rank1, fill: COLORS.green },
                  { name: 'Rank #2-3', value: globalStats?.totals.rank2_3, fill: COLORS.blue },
                  { name: 'Low Rank', value: globalStats?.totals.lowRank, fill: COLORS.yellow },
                  { name: 'No Rank', value: globalStats?.totals.noRank, fill: COLORS.red }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              />
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        {/* HORIZONTAL Bar Chart - Category Performance */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Category Performance Comparison
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={globalStats?.categoryData.slice(0, 8).map(cat => ({
                name: cat.shortName,
                'Low Rank': cat.lowRank,
                'No Rank': cat.noRank,
                'Rank #1': cat.rank1,
                'Rank #2-3': cat.rank2_3
              }))}
              layout="horizontal"
              margin={{ top: 5, right: 10, left: 10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Rank #1" fill={COLORS.green} />
              <Bar dataKey="Rank #2-3" fill={COLORS.blue} />
              <Bar dataKey="Low Rank" fill={COLORS.yellow} />
              <Bar dataKey="No Rank" fill={COLORS.red} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LINE Chart - Win Rate by Category */}
      <div className="bg-card border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity size={20} />
          Win Rate by Category (% at Rank #1)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={globalStats?.categoryData
              .sort((a, b) => b.winRate - a.winRate)
              .slice(0, 15)
              .map(cat => ({
                name: cat.shortName,
                winRate: cat.winRate
              }))}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis label={{ value: 'Win Rate (%)', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="winRate" 
              stroke={COLORS.purple} 
              strokeWidth={3}
              dot={{ fill: COLORS.purple, r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Deep Dive Cards */}
      <div>
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Layers size={24} />
          Dive Deep into Categories
        </h3>
        <p className="text-muted-foreground mb-6">Click on a category to explore detailed analytics</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {globalStats?.categoryData.map(category => (
            <button
              key={category.name}
              onClick={() => setSelectedTopic(category.name)}
              className="bg-card border-2 border-border hover:border-primary rounded-lg p-5 text-left hover:shadow-xl transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {category.name}
                </h4>
                <ChevronRight size={24} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-bold rounded">
                  #1: {category.rank1}
                </span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded">
                  #2-3: {category.rank2_3}
                </span>
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                  Low: {category.lowRank}
                </span>
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-bold rounded">
                  Missing: {category.noRank}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{category.promptCount} prompts</span>
                <span className="font-bold text-primary">{category.winRate}% win rate</span>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                  style={{ width: `${category.winRate}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Items */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border-2 border-primary/30 rounded-xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary rounded-lg">
            <Zap size={24} className="text-primary-foreground" />
          </div>
          <h3 className="text-xl font-bold">Quick Action Items</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg flex-shrink-0">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="font-bold text-base mb-1">Improve Rankings</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Focus on <strong className="text-foreground">{globalStats?.totals.lowRank}</strong> low-ranked items to boost visibility
                </p>
                <button className="text-xs text-primary font-semibold hover:underline">
                  View opportunities →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg flex-shrink-0">
                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
              </div>
              <div>
                <p className="font-bold text-base mb-1">Fill Critical Gaps</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Address <strong className="text-foreground">{globalStats?.totals.noRank}</strong> missing listings to capture lost traffic
                </p>
                <button className="text-xs text-primary font-semibold hover:underline">
                  Identify gaps →
                </button>
              </div>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur rounded-lg p-5 border border-primary/20 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <Target className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="font-bold text-base mb-1">Optimize Top Performers</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Maintain <strong className="text-foreground">{globalStats?.totals.rank1}</strong> #1 positions and defend market share
                </p>
                <button className="text-xs text-primary font-semibold hover:underline">
                  Review leaders →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

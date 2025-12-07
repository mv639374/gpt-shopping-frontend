import { useState, useEffect, useMemo } from 'react'
import { 
  ChevronDown, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
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
  ShoppingCart
} from 'lucide-react'
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
  AreaChart,
  Area
} from 'recharts'
import './App.css'

const COLORS = {
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  red: '#ef4444',
  orange: '#ff6b35',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  pink: '#ec4899'
}

interface Prompt {
  id: string
  topic: string
  text: string
  properties?: Record<string, string>
}

interface Product {
  id: string
  prompt_id: string
  topic: string
  name: string
  brand?: string
  description?: string
}

interface MarketplaceEntry {
  id: string
  prompt_id: string
  card_id: string
  topic: string
  marketplace: string
  position_rank: number | null
  price?: number
}

interface Topic {
  name: string
  prompt_count: number
}

interface DataStructure {
  topics: Topic[]
  prompts: Prompt[]
  products: Product[]
  marketplace_entries: MarketplaceEntry[]
}

interface AmazonSummary {
  [key: string]: {
    total_appearances: number
    rank_1: number
    rank_2: number
    rank_3: number
    low_rank: number
    prompts_with_amazon_count: number
    prompts_without_amazon_count: number
    prompts_with_amazon: string[]
    prompts_without_amazon: string[]
  }
}

interface CategoryData {
  name: string
  shortName: string
  promptCount: number
  rank1: number
  rank2_3: number
  lowRank: number
  noRank: number
  total: number
  winRate: number
  topPosition: number
  problemAreas: number
}

interface PieDataItem {
  name: string
  value: number
  color: string
}

interface GlobalStats {
  categoryData: CategoryData[]
  totals: {
    rank1: number
    rank2_3: number
    lowRank: number
    noRank: number
    prompts: number
  }
  pieData: PieDataItem[]
}

interface ProductCardEntry extends MarketplaceEntry {
  product: Product | undefined
  prompt: Prompt | undefined
}

function App() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [amazonSummary, setAmazonSummary] = useState<AmazonSummary | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'low-rank' | 'no-rank' | 'competitors' | 'prompts'>('low-rank')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data.json').then(r => r.json()),
      fetch('/amazon_summary.json').then(r => r.json())
    ]).then(([dataRes, amazonRes]) => {
      setData(dataRes)
      setAmazonSummary(amazonRes)
      setLoading(false)
    })
  }, [])

  const globalStats = useMemo((): GlobalStats | null => {
    if (!data || !amazonSummary) return null

    const categoryData = data.topics.map(topic => {
      const amazonData = amazonSummary[topic.name] || {}
      const prompts = data.prompts.filter(p => p.topic === topic.name)
      const marketplaceEntries = data.marketplace_entries.filter(m => m.topic === topic.name)
      const amazonEntries = marketplaceEntries.filter(m => m.marketplace === 'Amazon')
      
      const rank1 = amazonEntries.filter(e => e.position_rank === 1).length
      const rank2_3 = amazonEntries.filter(e => e.position_rank && e.position_rank >= 2 && e.position_rank <= 3).length
      const lowRank = amazonEntries.filter(e => e.position_rank && e.position_rank > 3).length
      
      const promptsWithAmazon = new Set(amazonEntries.map(e => e.prompt_id))
      const noRank = prompts.filter(p => !promptsWithAmazon.has(p.id)).length

      return {
        name: topic.name,
        shortName: topic.name.length > 10 ? topic.name.slice(0, 10) + '...' : topic.name,
        promptCount: topic.prompt_count,
        rank1,
        rank2_3,
        lowRank,
        noRank,
        total: rank1 + rank2_3 + lowRank,
        winRate: rank1 > 0 ? Math.round((rank1 / (rank1 + rank2_3 + lowRank + noRank)) * 100) : 0,
        topPosition: rank1 + rank2_3,
        problemAreas: lowRank + noRank
      }
    })

    const totals = categoryData.reduce((acc, c) => ({
      rank1: acc.rank1 + c.rank1,
      rank2_3: acc.rank2_3 + c.rank2_3,
      lowRank: acc.lowRank + c.lowRank,
      noRank: acc.noRank + c.noRank,
      prompts: acc.prompts + c.promptCount
    }), { rank1: 0, rank2_3: 0, lowRank: 0, noRank: 0, prompts: 0 })

    const pieData = [
      { name: 'Rank #1', value: totals.rank1, color: COLORS.green },
      { name: 'Rank #2-3', value: totals.rank2_3, color: COLORS.blue },
      { name: 'Low Rank', value: totals.lowRank, color: COLORS.yellow },
      { name: 'No Rank', value: totals.noRank, color: COLORS.red }
    ]

    return { categoryData, totals, pieData }
  }, [data, amazonSummary])

  const topicData = useMemo(() => {
    if (!data || !selectedTopic || !amazonSummary) return null

    const topicInfo = data.topics.find(t => t.name === selectedTopic)
    const prompts = data.prompts.filter(p => p.topic === selectedTopic)
    const products = data.products.filter(p => p.topic === selectedTopic)
    const marketplaceEntries = data.marketplace_entries.filter(m => m.topic === selectedTopic)
    const amazonData = amazonSummary[selectedTopic] || {}

    const promptsByProperty: Record<string, Prompt[]> = {}
    prompts.forEach(p => {
      const propKey = Object.entries(p.properties || {})
        .filter(([k, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ') || 'General'
      
      if (!promptsByProperty[propKey]) {
        promptsByProperty[propKey] = []
      }
      promptsByProperty[propKey].push(p)
    })

    const amazonEntries: ProductCardEntry[] = marketplaceEntries
      .filter(m => m.marketplace === 'Amazon')
      .map(m => {
        const product = products.find(p => p.id === m.card_id && p.prompt_id === m.prompt_id)
        const prompt = prompts.find(p => p.id === m.prompt_id)
        return { ...m, product, prompt }
      })
      .filter(e => e.product && e.prompt) as ProductCardEntry[]

    const rank1 = amazonEntries.filter(e => e.position_rank === 1)
    const rank2 = amazonEntries.filter(e => e.position_rank === 2)
    const rank3 = amazonEntries.filter(e => e.position_rank === 3)
    const lowRank = amazonEntries.filter(e => e.position_rank && e.position_rank > 3)

    const promptsWithAmazon = new Set(amazonEntries.map(e => e.prompt_id))
    const promptsWithoutAmazon = prompts.filter(p => !promptsWithAmazon.has(p.id))

    const competitorStats: Record<string, number> = {}
    
    lowRank.forEach(e => {
      const promptMarketplaces = marketplaceEntries.filter(
        m => m.prompt_id === e.prompt_id && m.position_rank === 1 && m.marketplace !== 'Amazon'
      )
      promptMarketplaces.forEach(pm => {
        competitorStats[pm.marketplace] = (competitorStats[pm.marketplace] || 0) + 1
      })
    })

    promptsWithoutAmazon.forEach(p => {
      const promptMarketplaces = marketplaceEntries.filter(
        m => m.prompt_id === p.id && m.position_rank === 1
      )
      promptMarketplaces.forEach(pm => {
        competitorStats[pm.marketplace] = (competitorStats[pm.marketplace] || 0) + 1
      })
    })

    const topCompetitors = Object.entries(competitorStats)
      .slice()
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      topicInfo,
      prompts,
      products,
      marketplaceEntries,
      amazonData,
      promptsByProperty,
      amazonEntries,
      rank1,
      rank2,
      rank3,
      lowRank,
      promptsWithoutAmazon,
      topCompetitors
    }
  }, [data, selectedTopic, amazonSummary])

  const filteredData = useMemo(() => {
    if (!topicData || !searchQuery) return topicData

    const query = searchQuery.toLowerCase()
    
    return {
      ...topicData,
      lowRank: topicData.lowRank.filter(e => 
        e.product?.name?.toLowerCase().includes(query) ||
        e.prompt?.text?.toLowerCase().includes(query)
      ),
      promptsWithoutAmazon: topicData.promptsWithoutAmazon.filter(p =>
        p.text?.toLowerCase().includes(query)
      )
    }
  }, [topicData, searchQuery])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading GPT Shopping Analytics...</p>
      </div>
    )
  }

  if (!selectedTopic) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-left">
            <ShoppingCart size={24} className="header-icon" />
            <h1>GPT Shopping Analytics</h1>
            <span className="header-badge">Amazon View</span>
          </div>
        </header>

        <main className="overview-page">
          <section className="hero-section">
            <div className="hero-content">
              <h2>Amazon's Position in GPT Shopping</h2>
              <p>Consolidated analysis across {globalStats?.categoryData.length} product categories and {globalStats?.totals.prompts} search prompts</p>
            </div>
          </section>

          <section className="key-metrics">
            <div className="metric-card-large green">
              <div className="metric-header">
                <TrendingUp size={24} />
                <span>Winning</span>
              </div>
              <div className="metric-value-large">{globalStats?.totals.rank1}</div>
              <div className="metric-subtitle">Rank #1 Positions</div>
              <div className="metric-percent">
                {Math.round((globalStats?.totals.rank1 || 0) / ((globalStats?.totals.rank1 || 0) + (globalStats?.totals.rank2_3 || 0) + (globalStats?.totals.lowRank || 0)) * 100)}% win rate
              </div>
            </div>

            <div className="metric-card-large blue">
              <div className="metric-header">
                <Target size={24} />
                <span>Competitive</span>
              </div>
              <div className="metric-value-large">{globalStats?.totals.rank2_3}</div>
              <div className="metric-subtitle">Rank #2-3 Positions</div>
              <div className="metric-percent">Close to winning</div>
            </div>

            <div className="metric-card-large yellow">
              <div className="metric-header">
                <TrendingDown size={24} />
                <span>Needs Work</span>
              </div>
              <div className="metric-value-large">{globalStats?.totals.lowRank}</div>
              <div className="metric-subtitle">Low Rank (4+)</div>
              <div className="metric-percent">Opportunity to improve</div>
            </div>

            <div className="metric-card-large red">
              <div className="metric-header">
                <AlertTriangle size={24} />
                <span>Missing</span>
              </div>
              <div className="metric-value-large">{globalStats?.totals.noRank}</div>
              <div className="metric-subtitle">Not Appearing</div>
              <div className="metric-percent">Critical gaps</div>
            </div>
          </section>

          <section className="charts-section">
            <div className="chart-card">
              <h3>
                <PieChart size={18} />
                Overall Position Distribution
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={globalStats?.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {globalStats?.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a24', 
                        border: '1px solid #2a2a3a',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-card">
              <h3>
                <BarChart3 size={18} />
                Category Performance Comparison
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={globalStats?.categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                    <XAxis type="number" stroke="#606070" />
                    <YAxis dataKey="shortName" type="category" stroke="#606070" width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a24', 
                        border: '1px solid #2a2a3a',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="rank1" stackId="a" fill={COLORS.green} name="Rank #1" />
                    <Bar dataKey="rank2_3" stackId="a" fill={COLORS.blue} name="Rank #2-3" />
                    <Bar dataKey="lowRank" stackId="a" fill={COLORS.yellow} name="Low Rank" />
                    <Bar dataKey="noRank" stackId="a" fill={COLORS.red} name="No Rank" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="win-rate-section">
            <div className="chart-card full-width">
              <h3>
                <Activity size={18} />
                Win Rate by Category (% at Rank #1)
              </h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={globalStats?.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                    <XAxis dataKey="shortName" stroke="#606070" />
                    <YAxis stroke="#606070" />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#1a1a24', 
                        border: '1px solid #2a2a3a',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [`${value}%`, 'Win Rate']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke={COLORS.orange} 
                      fill={`${COLORS.orange}33`}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="categories-section">
            <h3>
              <Layers size={18} />
              Dive Deep into Categories
            </h3>
            <p className="section-subtitle">Click on a category to explore detailed analytics</p>
            
            <div className="category-cards">
              {globalStats?.categoryData.map(category => (
                <div 
                  key={category.name} 
                  className="category-card"
                  onClick={() => setSelectedTopic(category.name)}
                >
                  <div className="category-card-header">
                    <h4>{category.name}</h4>
                    <span className="prompt-badge">{category.promptCount} prompts</span>
                  </div>
                  
                  <div className="category-stats">
                    <div className="mini-stat green">
                      <span className="mini-stat-value">{category.rank1}</span>
                      <span className="mini-stat-label">#1</span>
                    </div>
                    <div className="mini-stat blue">
                      <span className="mini-stat-value">{category.rank2_3}</span>
                      <span className="mini-stat-label">#2-3</span>
                    </div>
                    <div className="mini-stat yellow">
                      <span className="mini-stat-value">{category.lowRank}</span>
                      <span className="mini-stat-label">Low</span>
                    </div>
                    <div className="mini-stat red">
                      <span className="mini-stat-value">{category.noRank}</span>
                      <span className="mini-stat-label">None</span>
                    </div>
                  </div>

                  <div className="category-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill green" 
                        style={{ width: `${(category.rank1 / category.promptCount) * 100}%` }}
                      ></div>
                      <div 
                        className="progress-fill blue" 
                        style={{ width: `${(category.rank2_3 / category.promptCount) * 100}%` }}
                      ></div>
                      <div 
                        className="progress-fill yellow" 
                        style={{ width: `${(category.lowRank / category.promptCount) * 100}%` }}
                      ></div>
                      <div 
                        className="progress-fill red" 
                        style={{ width: `${(category.noRank / category.promptCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="category-action">
                    <span>View Details</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="problem-summary">
            <div className="problem-card">
              <div className="problem-header">
                <Zap size={20} />
                <h3>Quick Action Items</h3>
              </div>
              <div className="problem-list">
                {globalStats?.categoryData
                  .slice()
                  .sort((a, b) => b.problemAreas - a.problemAreas)
                  .slice(0, 3)
                  .map(cat => (
                    <div key={cat.name} className="problem-item" onClick={() => setSelectedTopic(cat.name)}>
                      <div className="problem-info">
                        <span className="problem-name">{cat.name}</span>
                        <span className="problem-detail">
                          {cat.lowRank} low rank + {cat.noRank} missing = {cat.problemAreas} issues
                        </span>
                      </div>
                      <ChevronRight size={16} />
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <button className="back-button" onClick={() => setSelectedTopic(null)}>
            <ArrowLeft size={20} />
          </button>
          <Store size={24} className="header-icon" />
          <h1>{selectedTopic}</h1>
          <span className="header-badge">Category Analysis</span>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search products or prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="category-detail">
        {topicData && filteredData && (
          <>
            <section className="category-overview">
              <div className="overview-stats">
                <div className="stat-box green">
                  <TrendingUp size={20} />
                  <div className="stat-content">
                    <span className="stat-value">{topicData.rank1.length}</span>
                    <span className="stat-label">Rank #1</span>
                  </div>
                </div>
                <div className="stat-box blue">
                  <CheckCircle2 size={20} />
                  <div className="stat-content">
                    <span className="stat-value">{topicData.rank2.length + topicData.rank3.length}</span>
                    <span className="stat-label">Rank #2-3</span>
                  </div>
                </div>
                <div className="stat-box yellow">
                  <TrendingDown size={20} />
                  <div className="stat-content">
                    <span className="stat-value">{topicData.lowRank.length}</span>
                    <span className="stat-label">Low Rank</span>
                  </div>
                </div>
                <div className="stat-box red">
                  <XCircle size={20} />
                  <div className="stat-content">
                    <span className="stat-value">{topicData.promptsWithoutAmazon.length}</span>
                    <span className="stat-label">No Rank</span>
                  </div>
                </div>
              </div>

              <div className="mini-chart">
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={[{
                    name: selectedTopic,
                    rank1: topicData.rank1.length,
                    rank2_3: topicData.rank2.length + topicData.rank3.length,
                    lowRank: topicData.lowRank.length,
                    noRank: topicData.promptsWithoutAmazon.length
                  }]} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" hide />
                    <Bar dataKey="rank1" stackId="a" fill={COLORS.green} />
                    <Bar dataKey="rank2_3" stackId="a" fill={COLORS.blue} />
                    <Bar dataKey="lowRank" stackId="a" fill={COLORS.yellow} />
                    <Bar dataKey="noRank" stackId="a" fill={COLORS.red} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <div className="view-tabs">
              <button 
                className={`tab ${activeView === 'low-rank' ? 'active' : ''}`}
                onClick={() => setActiveView('low-rank')}
              >
                <TrendingDown size={16} />
                Low Rank ({filteredData.lowRank.length})
              </button>
              <button 
                className={`tab ${activeView === 'no-rank' ? 'active' : ''}`}
                onClick={() => setActiveView('no-rank')}
              >
                <XCircle size={16} />
                No Rank ({filteredData.promptsWithoutAmazon.length})
              </button>
              <button 
                className={`tab ${activeView === 'competitors' ? 'active' : ''}`}
                onClick={() => setActiveView('competitors')}
              >
                <Store size={16} />
                Competitors
              </button>
              <button 
                className={`tab ${activeView === 'prompts' ? 'active' : ''}`}
                onClick={() => setActiveView('prompts')}
              >
                <Layers size={16} />
                Prompt Clusters
              </button>
            </div>

            {activeView === 'low-rank' && (
              <div className="list-view">
                <div className="list-header">
                  <h2>Low Rank Products (Position 4+)</h2>
                  <p>Products where Amazon appears but not in top 3 positions</p>
                </div>
                
                <div className="product-list">
                  {filteredData.lowRank.map((entry, idx) => (
                    <ProductCard 
                      key={`${entry.id}-${idx}`} 
                      entry={entry} 
                      marketplaceEntries={topicData.marketplaceEntries}
                    />
                  ))}
                  {filteredData.lowRank.length === 0 && (
                    <div className="empty-state">
                      <CheckCircle2 size={48} />
                      <p>No low-rank entries found</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'no-rank' && (
              <div className="list-view">
                <div className="list-header">
                  <h2>Prompts Without Amazon</h2>
                  <p>Search queries where Amazon doesn't appear in results</p>
                </div>
                
                <div className="prompt-list">
                  {filteredData.promptsWithoutAmazon.map((prompt) => (
                    <PromptCard 
                      key={prompt.id} 
                      prompt={prompt}
                      marketplaceEntries={topicData.marketplaceEntries}
                      products={topicData.products}
                    />
                  ))}
                  {filteredData.promptsWithoutAmazon.length === 0 && (
                    <div className="empty-state">
                      <CheckCircle2 size={48} />
                      <p>Amazon appears in all prompts!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeView === 'competitors' && (
              <div className="competitors-view">
                <div className="list-header">
                  <h2>Competitor Analysis</h2>
                  <p>Who's winning when Amazon isn't?</p>
                </div>

                <div className="competitors-chart">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={topicData.topCompetitors.map(([name, count]) => ({ name, count }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                      <XAxis type="number" stroke="#606070" />
                      <YAxis dataKey="name" type="category" stroke="#606070" width={150} />
                      <Tooltip 
                        contentStyle={{ 
                          background: '#1a1a24', 
                          border: '1px solid #2a2a3a',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`${value} times`, 'At #1 Position']}
                      />
                      <Bar dataKey="count" fill={COLORS.orange} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="competitors-list">
                  {topicData.topCompetitors.map(([name, count], idx) => (
                    <div key={name} className="competitor-item">
                      <span className="competitor-rank">#{idx + 1}</span>
                      <span className="competitor-name">{name}</span>
                      <span className="competitor-count">{count} times at #1</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'prompts' && (
              <div className="prompts-view">
                <div className="list-header">
                  <h2>Prompt Variations by Property</h2>
                  <p>Grouped by intent, persona, or product attributes</p>
                </div>
                
                <div className="property-groups">
                  {Object.entries(topicData.promptsByProperty)
                    .slice()
                    .sort((a, b) => b[1].length - a[1].length)
                    .map(([propKey, prompts]) => (
                      <PropertyGroup 
                        key={propKey}
                        propKey={propKey}
                        prompts={prompts}
                        marketplaceEntries={topicData.marketplaceEntries}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

interface ProductCardProps {
  entry: ProductCardEntry
  marketplaceEntries: MarketplaceEntry[]
}

function ProductCard({ entry, marketplaceEntries }: ProductCardProps) {
  const [expanded, setExpanded] = useState(false)

  const topMarketplaces = marketplaceEntries
    .filter(m => m.prompt_id === entry.prompt_id && m.position_rank && m.position_rank <= 3)
    .slice()
    .sort((a, b) => (a.position_rank || 0) - (b.position_rank || 0))
    .slice(0, 3)

  return (
    <div className={`product-card ${expanded ? 'expanded' : ''}`}>
      <div className="product-main" onClick={() => setExpanded(!expanded)}>
        <div className="product-rank-badge low">
          #{entry.position_rank}
        </div>
        <div className="product-info">
          <h4>{entry.product?.name || 'Unknown Product'}</h4>
          <p className="product-brand">{entry.product?.brand || 'Unknown Brand'}</p>
          <p className="product-prompt">
            <MessageSquare size={12} />
            {entry.prompt?.text?.slice(0, 80)}...
          </p>
        </div>
        <div className="product-meta">
          {entry.price && (
            <span className="product-price">₹{entry.price.toLocaleString()}</span>
          )}
          <ChevronRight size={16} className={`expand-icon ${expanded ? 'rotated' : ''}`} />
        </div>
      </div>

      {expanded && (
        <div className="product-details">
          <div className="detail-section">
            <h5>Full Prompt</h5>
            <p>{entry.prompt?.text}</p>
            {entry.prompt?.properties && Object.keys(entry.prompt.properties).length > 0 && (
              <div className="prompt-properties">
                {Object.entries(entry.prompt.properties).map(([k, v]) => (
                  <span key={k} className="property-tag">{k}: {v}</span>
                ))}
              </div>
            )}
          </div>

          <div className="detail-section">
            <h5>Top Marketplaces for this Query</h5>
            <div className="marketplace-list">
              {topMarketplaces.map((m) => (
                <div key={m.id} className={`marketplace-item ${m.marketplace === 'Amazon' ? 'amazon' : ''}`}>
                  <span className="mp-rank">#{m.position_rank}</span>
                  <span className="mp-name">{m.marketplace}</span>
                  {m.price && <span className="mp-price">₹{m.price.toLocaleString()}</span>}
                </div>
              ))}
            </div>
          </div>

          {entry.product?.description && (
            <div className="detail-section">
              <h5>Product Description</h5>
              <p>{entry.product.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PromptCardProps {
  prompt: Prompt
  marketplaceEntries: MarketplaceEntry[]
  products: Product[]
}

function PromptCard({ prompt, marketplaceEntries, products }: PromptCardProps) {
  const [expanded, setExpanded] = useState(false)

  const promptMarketplaces = marketplaceEntries
    .filter(m => m.prompt_id === prompt.id)
    .slice()
    .sort((a, b) => (a.position_rank || 999) - (b.position_rank || 999))

  const topMarketplaces: MarketplaceEntry[] = []
  const seen = new Set<string>()
  promptMarketplaces.forEach(m => {
    if (!seen.has(m.marketplace) && m.position_rank && m.position_rank <= 3) {
      seen.add(m.marketplace)
      topMarketplaces.push(m)
    }
  })

  return (
    <div className={`prompt-card ${expanded ? 'expanded' : ''}`}>
      <div className="prompt-main" onClick={() => setExpanded(!expanded)}>
        <div className="prompt-icon">
          <XCircle size={20} />
        </div>
        <div className="prompt-info">
          <p className="prompt-text">{prompt.text}</p>
          {prompt.properties && Object.keys(prompt.properties).length > 0 && (
            <div className="prompt-properties">
              {Object.entries(prompt.properties).map(([k, v]) => (
                <span key={k} className="property-tag">{k}: {v}</span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight size={16} className={`expand-icon ${expanded ? 'rotated' : ''}`} />
      </div>

      {expanded && (
        <div className="prompt-details">
          <div className="detail-section">
            <h5>Who's Ranking Instead?</h5>
            <div className="marketplace-list">
              {topMarketplaces.slice(0, 5).map((m) => {
                const product = products.find(p => p.id === m.card_id && p.prompt_id === m.prompt_id)
                return (
                  <div key={m.id} className="marketplace-item">
                    <span className="mp-rank">#{m.position_rank}</span>
                    <span className="mp-name">{m.marketplace}</span>
                    {product && <span className="mp-product">{product.name?.slice(0, 40)}...</span>}
                    {m.price && <span className="mp-price">₹{m.price.toLocaleString()}</span>}
                  </div>
                )
              })}
              {topMarketplaces.length === 0 && (
                <p className="no-data">No marketplace data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PropertyGroupProps {
  propKey: string
  prompts: Prompt[]
  marketplaceEntries: MarketplaceEntry[]
}

function PropertyGroup({ propKey, prompts, marketplaceEntries }: PropertyGroupProps) {
  const [expanded, setExpanded] = useState(false)

  const promptIds = new Set(prompts.map(p => p.id))
  const amazonInGroup = marketplaceEntries.filter(
    m => promptIds.has(m.prompt_id) && m.marketplace === 'Amazon'
  )
  const amazonRank1 = amazonInGroup.filter(m => m.position_rank === 1).length
  const amazonPresence = amazonInGroup.length

  return (
    <div className={`property-group ${expanded ? 'expanded' : ''}`}>
      <div className="group-header" onClick={() => setExpanded(!expanded)}>
        <div className="group-info">
          <h4>{propKey}</h4>
          <span className="group-count">{prompts.length} prompts</span>
        </div>
        <div className="group-stats">
          <span className={`stat ${amazonRank1 > 0 ? 'good' : 'bad'}`}>
            {amazonRank1} at #1
          </span>
          <span className="stat">{amazonPresence} total Amazon</span>
        </div>
        <ChevronDown size={16} className={`expand-icon ${expanded ? 'rotated' : ''}`} />
      </div>

      {expanded && (
        <div className="group-content">
          {prompts.map(p => {
            const amazonEntry = marketplaceEntries.find(
              m => m.prompt_id === p.id && m.marketplace === 'Amazon'
            )
            return (
              <div key={p.id} className="group-prompt">
                <div className="gp-text">{p.text}</div>
                <div className="gp-status">
                  {amazonEntry ? (
                    <span className={`rank-badge ${(amazonEntry.position_rank || 0) <= 3 ? 'good' : 'low'}`}>
                      #{amazonEntry.position_rank}
                    </span>
                  ) : (
                    <span className="rank-badge none">No Amazon</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default App
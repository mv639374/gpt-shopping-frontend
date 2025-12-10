// ============================================
// File: components/citations/DomainDistributionChart.tsx
// REPLACE ENTIRE FILE - Fixed label position and font size
// ============================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip, Sector } from 'recharts';
import { DomainCategoryModal } from './DomainCategoryModal';
import type { DomainDistribution } from '@/types/citations';

interface DomainDistributionChartProps {
  data: DomainDistribution[];
  onDomainClick?: (domain: string) => void;
  loading?: boolean;
}

const COLORS = [
  'hsl(221, 83%, 53%)', // Blue - Company
  'hsl(142, 76%, 36%)', // Green - 3rd Party
  'hsl(262, 83%, 58%)', // Purple - UGC
  'hsl(24, 95%, 53%)',  // Orange - Marketplace
  'hsl(339, 82%, 56%)', // Pink - High Trusted
  'hsl(199, 89%, 48%)', // Cyan - Others
];

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// Custom label CLOSER to pie with BIGGER font
const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percentage, fill } = props;
  const RADIAN = Math.PI / 180;
  
  // REDUCED distance - closer to pie (was 35, now 20)
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percentage < 3) return null;

  return (
    <text
      x={x}
      y={y}
      fill={fill}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="font-bold text-base" // INCREASED from text-xs to text-base
      style={{ fontSize: '15px', fontWeight: 700 }} // Explicit size
    >
      {`${percentage.toFixed(1)}%`}
    </text>
  );
};

export function DomainDistributionChart({ data, onDomainClick, loading }: DomainDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    name: string;
    count: number;
    percentage: number;
  } | null>(null);

  const chartData = data.map((item) => ({
    name: item.domain_category || 'Unknown',
    value: item.citation_count,
    percentage: item.percentage,
    avgRank: item.avg_amazon_rank,
  }));

  if (loading) {
    return (
      <Card className="h-[450px]">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-48 animate-pulse" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[370px]">
          <div className="w-64 h-64 bg-muted rounded-full animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const handleChartClick = (data: any, index: number) => {
    const categoryName = data.name;
    
    setSelectedCategory({
      name: categoryName,
      count: data.value,
      percentage: data.percentage,
    });
    setModalOpen(true);
    
    if (onDomainClick) {
      onDomainClick(categoryName);
    }
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow h-[450px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Citation Source Distribution</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Distribution of citations by source type for Amazon products only.
                    Click any segment to see detailed domain breakdown.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="48%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomLabel}
                labelLine={false}
                onClick={handleChartClick}
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                className="cursor-pointer focus:outline-none"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={3}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
                        <p className="font-semibold text-sm mb-1">{data.name}</p>
                        <div className="space-y-0.5 text-xs text-muted-foreground">
                          <p>Citations: <span className="font-medium text-foreground">{data.value.toLocaleString()}</span></p>
                          <p>Percentage: <span className="font-medium text-foreground">{data.percentage.toFixed(2)}%</span></p>
                          <p>Avg Amazon Rank: <span className="font-medium text-foreground">{data.avgRank ? data.avgRank.toFixed(1) : 'N/A'}</span></p>
                          <p className="text-blue-600 mt-1 font-medium">Click to see domains →</p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={50}
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
                formatter={(value, entry: any) => {
                  const payload = entry.payload;
                  return (
                    <span className="text-sm hover:text-primary transition-colors cursor-pointer">
                      {value} ({payload.value.toLocaleString()} citations)
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedCategory && (
        <DomainCategoryModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoryName={selectedCategory.name}
          citationCount={selectedCategory.count}
          percentage={selectedCategory.percentage}
        />
      )}
    </>
  );
}

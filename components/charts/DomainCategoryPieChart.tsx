import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { PieChart as PieChartIcon, Info } from 'lucide-react'
import type { DomainCategoryDistribution } from '@/types/citations'

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

interface DomainCategoryPieChartProps {
  data: DomainCategoryDistribution[]
  isLoading?: boolean
}

export function DomainCategoryPieChart({ data, isLoading }: DomainCategoryPieChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: item.count,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  })).filter(item => item.value > 0)

  const totalCitations = chartData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{data.percentage.toFixed(1)}% of total</p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No citation data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>Citation distribution by domain category.</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, payload }) => {
              const percentage = (payload.value / totalCitations) * 100;
              return `${name}: ${percentage.toFixed(1)}%`;
            }}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-sm">
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="text-center text-sm text-gray-500">
        Total Citations: {totalCitations.toLocaleString()}
      </div>
    </div>
  )
}

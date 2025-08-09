'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface ChartProps {
  data: ChartData[]
  type: 'line' | 'area' | 'bar' | 'pie' | 'composed'
  title?: string
  height?: number
  colors?: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function DashboardChart({
  data,
  type,
  title,
  height = 300,
  colors = COLORS,
}: ChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${((percent || 0) * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )

      case 'composed':
        return (
          <ComposedChart data={data} height={height}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              fill="#8884d8"
              stroke="#8884d8"
              fillOpacity={0.3}
            />
            <Bar dataKey="value2" fill="#82ca9d" />
            <Line type="monotone" dataKey="value3" stroke="#ff7300" />
          </ComposedChart>
        )

      default:
        return <div>不支持的图表类型</div>
    }
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

// 流量趋势图表
export function TrafficTrendChart({ data }: { data: any[] }) {
  return (
    <DashboardChart data={data} type="line" title="流量趋势" height={300} />
  )
}

// 用户行为图表
export function BehaviorChart({ data }: { data: any[] }) {
  return (
    <DashboardChart data={data} type="bar" title="用户交互统计" height={300} />
  )
}

// 设备分布图表
export function DeviceDistributionChart({ data }: { data: any[] }) {
  return <DashboardChart data={data} type="pie" title="设备分布" height={300} />
}

// 性能趋势图表
export function PerformanceChart({ data }: { data: any[] }) {
  return (
    <DashboardChart data={data} type="composed" title="性能趋势" height={300} />
  )
}

// 实时活动图表
export function RealtimeActivityChart({ data }: { data: any[] }) {
  return (
    <DashboardChart data={data} type="area" title="实时活动" height={300} />
  )
}
 
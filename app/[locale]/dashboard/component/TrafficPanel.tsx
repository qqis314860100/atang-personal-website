import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LineChart, PieChart } from 'lucide-react'
import React from 'react'

export default function TrafficPanel({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            流量趋势
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            图表组件开发中...
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            流量来源
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            图表组件开发中...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

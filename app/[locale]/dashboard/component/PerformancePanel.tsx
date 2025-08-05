import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Zap, Activity, CheckCircle } from 'lucide-react'
import React from 'react'

export default function PerformancePanel({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            加载时间
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {data.performance.loadTime}s
            </p>
            <p className="text-sm text-gray-500">平均页面加载时间</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            响应时间
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {data.performance.responseTime}s
            </p>
            <p className="text-sm text-gray-500">API 响应时间</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            运行时间
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {data.performance.uptime}%
            </p>
            <p className="text-sm text-gray-500">服务可用性</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

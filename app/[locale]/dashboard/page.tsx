'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Eye,
  AlertCircle,
  Download,
  Share2,
  Smartphone,
} from 'lucide-react'
import { tracker } from '@/lib/analytics/simple-tracker'
import dynamic from 'next/dynamic'

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  conversionRate: number
  topPages: Array<{ page: string; views: number }>
  userInteractions: Array<{ action: string; count: number }>
  deviceTypes: Array<{ device: string; percentage: number }>
  realTimeUsers: number
  errors: number
  performance: {
    loadTime: number
    responseTime: number
    uptime: number
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    bounceRate: 0,
    avgSessionDuration: 0,
    conversionRate: 0,
    topPages: [],
    userInteractions: [],
    deviceTypes: [],
    realTimeUsers: 0,
    errors: 0,
    performance: {
      loadTime: 0,
      responseTime: 0,
      uptime: 0,
    },
  })
  const [isTracking, setIsTracking] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)

  // 初始化埋点系统
  useEffect(() => {
    tracker.initialize()
    tracker.trackPageView('analytics', 'main')

    // 模拟数据加载
    loadAnalyticsData()

    // 追踪性能指标
    const loadTime = performance.now()
    tracker.trackPerformance('page_load_time', loadTime)
  }, [])

  const loadAnalyticsData = () => {
    setIsLoading(true)
    // 模拟API调用延迟
    setTimeout(() => {
      setData({
        pageViews: 15420,
        uniqueVisitors: 3240,
        bounceRate: 23.5,
        avgSessionDuration: 245,
        conversionRate: 8.7,
        topPages: [
          { page: '/dashboard', views: 5420 },
          { page: '/blog', views: 3240 },
          { page: '/project', views: 2180 },
          { page: '/about', views: 1560 },
        ],
        userInteractions: [
          { action: 'click', count: 12450 },
          { action: 'scroll', count: 8920 },
          { action: 'hover', count: 5670 },
          { action: 'form_submit', count: 890 },
        ],
        deviceTypes: [
          { device: 'Desktop', percentage: 65 },
          { device: 'Mobile', percentage: 28 },
          { device: 'Tablet', percentage: 7 },
        ],
        realTimeUsers: 42,
        errors: 12,
        performance: {
          loadTime: 1.2,
          responseTime: 0.8,
          uptime: 99.9,
        },
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    tracker.trackUserInteraction('click', 'tab', 'analytics', { tab: value })
  }

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range)
    tracker.trackUserInteraction('click', 'time_range', 'analytics', { range })
  }

  const toggleTracking = () => {
    setIsTracking(!isTracking)
    if (!isTracking) {
      tracker.trackTimeTracking('start', 'analytics-dashboard')
    } else {
      tracker.trackTimeTracking('stop', 'analytics-dashboard')
    }
  }

  const handleDataView = (chartType: string, dataSource: string) => {
    tracker.trackDataView(chartType, dataSource)
  }

  const handleExport = () => {
    tracker.trackUserInteraction('click', 'export_button', 'analytics')
    tracker.trackNotification('info', '数据导出功能开发中...')
  }

  const handleShare = () => {
    tracker.trackUserInteraction('click', 'share_button', 'analytics')
    tracker.trackNotification('info', '分享功能开发中...')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载数据分析中...</p>
          </div>
        </div>
      </div>
    )
  }

  // 动态加载次要功能区块
  const TrafficPanel = dynamic(() => import('./component/TrafficPanel'), {
    ssr: false,
  })
  const BehaviorPanel = dynamic(() => import('./component/BehaviorPanel'), {
    ssr: false,
  })
  const PerformancePanel = dynamic(
    () => import('./component/PerformancePanel'),
    { ssr: false }
  )
  const RealtimePanel = dynamic(() => import('./component/RealtimePanel'), {
    ssr: false,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTimeRangeChange('7d')}
              className={timeRange === '7d' ? 'bg-blue-50 border-blue-200' : ''}
            >
              7天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTimeRangeChange('30d')}
              className={
                timeRange === '30d' ? 'bg-blue-50 border-blue-200' : ''
              }
            >
              30天
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTimeRangeChange('90d')}
              className={
                timeRange === '90d' ? 'bg-blue-50 border-blue-200' : ''
              }
            >
              90天
            </Button>
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>

        {/* 实时状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">实时用户</p>
                  <p className="text-2xl font-bold">{data.realTimeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">页面浏览量</p>
                  <p className="text-2xl font-bold">
                    {data.pageViews.toLocaleString()}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">转化率</p>
                  <p className="text-2xl font-bold">{data.conversionRate}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">错误数</p>
                  <p className="text-2xl font-bold">{data.errors}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="traffic">流量分析</TabsTrigger>
            <TabsTrigger value="behavior">用户行为</TabsTrigger>
            <TabsTrigger value="performance">性能监控</TabsTrigger>
            <TabsTrigger value="realtime">实时数据</TabsTrigger>
          </TabsList>

          {/* 概览标签页 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 关键指标 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    关键指标
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">独立访客</span>
                    <span className="font-semibold">
                      {data.uniqueVisitors.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">跳出率</span>
                    <span className="font-semibold">{data.bounceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">平均会话时长</span>
                    <span className="font-semibold">
                      {data.avgSessionDuration}秒
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* 设备分布 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    设备分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.deviceTypes.map((device, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {device.device}
                        </span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={device.percentage}
                            className="w-20"
                          />
                          <span className="text-sm font-medium">
                            {device.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 热门页面 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  热门页面
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topPages.map((page, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium">{page.page}</span>
                      <Badge variant="secondary">
                        {page.views.toLocaleString()} 次浏览
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 流量分析标签页 */}
          <TabsContent value="traffic" className="space-y-6">
            <TrafficPanel data={data} />
          </TabsContent>

          {/* 用户行为标签页 */}
          <TabsContent value="behavior" className="space-y-6">
            <BehaviorPanel data={data} />
          </TabsContent>

          {/* 性能监控标签页 */}
          <TabsContent value="performance" className="space-y-6">
            <PerformancePanel data={data} />
          </TabsContent>

          {/* 实时数据标签页 */}
          <TabsContent value="realtime" className="space-y-6">
            <RealtimePanel
              data={data}
              isTracking={isTracking}
              toggleTracking={toggleTracking}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

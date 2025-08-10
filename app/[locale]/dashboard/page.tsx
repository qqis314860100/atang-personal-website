'use client'

import { useI18n } from '@/app/hooks/use-i18n'
import { useLoading } from '@/app/hooks/use-loading'
import {
  useErrorDetail,
  usePageHeatmapData,
  usePerformanceHeatmapData,
  useSmartAnalyticsData,
} from '@/lib/query-hook/use-analytics'
import { useCallback, useEffect, useState } from 'react'
import { AnalyticsCards } from './components/AnalyticsCards'
import { AnalyticsSkeleton } from './components/AnalyticsSkeleton'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import { ErrorDetailModal } from './components/ErrorDetailModal'
import { ErrorLogs } from './components/ErrorLogs'
import { PageHeatmap } from './components/PageHeatmap'
import { PerformanceHeatmap } from './components/PerformanceHeatmap'
import { RealTimeToggle } from './components/RealTimeToggle'

export default function AnalyticsPage() {
  const [timeRange] = useState('7d')
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const t = useI18n()

  const { showLoading, hideLoading } = useLoading()

  // 使用React Query hooks获取数据
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useSmartAnalyticsData(timeRange)
  const { data: pageHeatmapData, isLoading: isPageHeatmapLoading } =
    usePageHeatmapData(timeRange)

  const { data: performanceHeatmapData } = usePerformanceHeatmapData(timeRange)
  const {
    data: errorDetail,
    isLoading: isErrorDetailLoading,
    isFetched,
  } = useErrorDetail(selectedErrorId)

  const handleErrorClick = (errorId: string) => {
    setSelectedErrorId(errorId)
    showLoading('', t.dashboard('请稍候...'))
  }

  // 监听错误详情请求完成
  useEffect(() => {
    if (selectedErrorId && isFetched && !isErrorDetailLoading) {
      hideLoading()
      setShowErrorModal(true)
    }
  }, [selectedErrorId, isFetched, isErrorDetailLoading, hideLoading])

  const handleCloseErrorModal = useCallback(() => {
    setShowErrorModal(false)
    setSelectedErrorId(null)
    hideLoading()
  }, [hideLoading])

  // 显示骨架屏
  if (isAnalyticsLoading || isPageHeatmapLoading) {
    return <DashboardSkeleton />
  }

  // 显示错误状态
  if (analyticsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-red-400 font-medium">
            {t.dashboard('加载数据失败')}
          </p>
          <p className="text-gray-500 text-sm">{t.dashboard('请稍后重试')}</p>
        </div>
      </div>
    )
  }

  // 确保数据存在
  if (!analyticsData) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="min-h-screen">
      {/* 实时更新控制 */}
      <RealTimeToggle />
      <div className="p-6 space-y-8">
        {/* 顶部核心指标卡片 */}
        <AnalyticsCards data={analyticsData} />

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 左侧：设备分布热力图 */}
          {/* <DeviceHeatmap data={deviceHeatmapData || []} /> */}

          {/* 性能指标 */}
          <PerformanceHeatmap data={performanceHeatmapData || {}} />

          {/* 中间：热门页面热力图 */}
          <PageHeatmap data={pageHeatmapData || []} />
        </div>

        <ErrorLogs
          data={analyticsData.errorLogs}
          onErrorClick={handleErrorClick}
        />

        {/* 错误日志详情模态框 */}
        <ErrorDetailModal
          error={errorDetail}
          isOpen={showErrorModal}
          onClose={handleCloseErrorModal}
        />
      </div>
    </div>
  )
}

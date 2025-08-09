'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Clock,
  Users,
  Eye,
  MousePointer,
  List,
  Grid3X3,
} from 'lucide-react'
import { useState } from 'react'
import {
  HeatmapView,
  getDefaultHeatmapColor,
} from '@/app/components/heatmap/heatmap-view'
import { FullscreenCard } from '@/app/components/full-screen'

interface PageHeatmapData {
  page: string
  views: number
  avgTime: number
  intensity: number
  // 简化的页面信息
  pageDetails?: {
    uniqueVisitors: number
    deviceDistribution: { device: string; count: number }[]
    browserDistribution: { browser: string; count: number }[]
    pathInfo?: {
      originalPath: string
    }
  }
}

interface PageHeatmapProps {
  data: PageHeatmapData[]
}

export function PageHeatmap({ data }: PageHeatmapProps) {
  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'heatmap'>('list')

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500'
    if (intensity >= 0.6) return 'bg-orange-500'
    if (intensity >= 0.4) return 'bg-yellow-500'
    if (intensity >= 0.2) return 'bg-blue-500'
    return 'bg-gray-500'
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const renderListView = () => (
    <div className="space-y-4">
      {data.length > 0 ? (
        data.map((page, index) => {
          const isExpanded = expandedPage === page.page

          return (
            <div key={index} className="space-y-2">
              <div
                className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                onClick={() => setExpandedPage(isExpanded ? null : page.page)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${getHeatmapColor(
                      page.intensity
                    )}`}
                  >
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {page.pageDetails?.pathInfo?.originalPath || page.page}
                    </p>
                    <p className="text-xs text-gray-400">
                      平均浏览 {formatTime(page.avgTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {page.views}
                    </p>
                    <p className="text-xs text-gray-400">浏览量</p>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full ${getHeatmapColor(
                      page.intensity
                    )}`}
                  ></div>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {isExpanded && (
                <div className="ml-8 p-4 bg-gray-800/30 rounded-lg space-y-4">
                  {/* 完整路径 */}
                  <div>
                    <p className="text-xs font-medium text-gray-300 mb-2">
                      完整路径
                    </p>
                    <div className="text-xs">
                      <span className="text-blue-400 font-mono">
                        {page.page}
                      </span>
                    </div>
                  </div>

                  {/* 基础统计信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-400">独立访客</p>
                        <p className="text-sm font-medium text-white">
                          {page.pageDetails?.uniqueVisitors ||
                            Math.floor(page.views * 0.8)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      <div>
                        <p className="text-xs text-gray-400">浏览量</p>
                        <p className="text-sm font-medium text-white">
                          {page.views}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <div>
                        <p className="text-xs text-gray-400">停留时间</p>
                        <p className="text-sm font-medium text-white">
                          {formatTime(page.avgTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 设备分布 */}
                  {page.pageDetails?.deviceDistribution && (
                    <div>
                      <p className="text-xs font-medium text-gray-300 mb-2">
                        设备分布
                      </p>
                      <div className="space-y-2">
                        {page.pageDetails.deviceDistribution.map(
                          (device, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="text-xs text-gray-400">
                                {device.device}
                              </span>
                              <span className="text-xs text-white">
                                {device.count} 次
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 浏览器分布 */}
                  {page.pageDetails?.browserDistribution && (
                    <div>
                      <p className="text-xs font-medium text-gray-300 mb-2">
                        浏览器分布
                      </p>
                      <div className="space-y-2">
                        {page.pageDetails.browserDistribution.map(
                          (browser, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <span className="text-xs text-gray-400">
                                {browser.browser}
                              </span>
                              <span className="text-xs text-white">
                                {browser.count} 次
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-400">暂无页面数据</p>
        </div>
      )}
    </div>
  )

  const renderHeatmapView = () => {
    const renderPageItem = (
      page: PageHeatmapData,
      index: number,
      isExpanded: boolean
    ) => (
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{index + 1}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-white truncate max-w-[180px]">
              {page.pageDetails?.pathInfo?.originalPath || page.page}
            </p>
            <p className="text-xs text-white/80">{formatTime(page.avgTime)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white">{page.views}</p>
          <p className="text-xs text-white/80">次</p>
        </div>
      </div>
    )

    const renderExpandedContent = (page: PageHeatmapData) => (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-white mb-2">页面统计</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">独立访客</p>
              <p className="text-white">
                {page.pageDetails?.uniqueVisitors || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-400">平均停留</p>
              <p className="text-white">{formatTime(page.avgTime)}</p>
            </div>
          </div>
        </div>
      </div>
    )

    return (
      <HeatmapView
        data={data.map((page) => ({ ...page, id: page.page }))}
        viewMode="grid"
        expandedItem={expandedPage}
        onItemClick={(pageId) =>
          setExpandedPage(expandedPage === pageId ? null : pageId)
        }
        onItemExpand={setExpandedPage}
        renderItem={renderPageItem}
        renderExpandedContent={renderExpandedContent}
        gridCols={1}
        itemHeight="h-16"
        getHeatmapColor={getDefaultHeatmapColor}
        emptyIcon={<TrendingUp className="w-6 h-6 text-gray-400" />}
        emptyText="暂无页面数据"
      />
    )
  }

  return (
    <FullscreenCard
      title={
        <>
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          热门页面热力图
        </>
      }
      actions={
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('heatmap')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'heatmap'
                ? 'bg-purple-500/20 text-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            title="热力图视图"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      }
    >
      {viewMode === 'list' ? renderListView() : renderHeatmapView()}
    </FullscreenCard>
  )
}

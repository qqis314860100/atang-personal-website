'use client'

import { FullscreenCard } from '@/app/components/full-screen'
import {
  HeatmapView,
  getDefaultHeatmapColor,
} from '@/app/components/heatmap/heatmap-view'
import { ThemeTextSM, ThemeTextXS } from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import { getThemeClasses } from '@/lib/theme/colors'
import { Clock, Eye, Grid3X3, List, TrendingUp, Users } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

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
  const t = useI18n()
  const { theme: currentTheme } = useTheme()

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
    return `${minutes}${t.dashboard('分')}${remainingSeconds}${t.dashboard(
      '秒'
    )}`
  }

  const renderListView = () => (
    <div className="space-y-2">
      {data.length > 0 ? (
        data.map((page, index) => {
          const isExpanded = expandedPage === page.page

          return (
            <div key={index} className="space-y-2">
              <div
                className={getThemeClasses(
                  'flex items-center justify-between p-4 rounded-lg cursor-pointer transition-colors',
                  (currentTheme as 'light' | 'dark') || 'light',
                  {
                    card: 'glass',
                    border: 'primary',
                    gradient: 'primary',
                    shadow: 'glass',
                    hover: 'primary',
                  }
                )}
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
                    <ThemeTextSM weight="medium" variant="primary">
                      {page.pageDetails?.pathInfo?.originalPath || page.page}
                    </ThemeTextSM>
                    <ThemeTextXS variant="tertiary">
                      {t.dashboard('平均浏览 {time}', {
                        params: { time: formatTime(page.avgTime) },
                      })}
                    </ThemeTextXS>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <ThemeTextSM weight="medium" variant="primary">
                      {page.views}
                    </ThemeTextSM>
                    <ThemeTextXS variant="tertiary">
                      {t.dashboard('浏览量')}
                    </ThemeTextXS>
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
                <div
                  className={getThemeClasses(
                    'p-4 rounded-lg space-y-4',
                    (currentTheme as 'light' | 'dark') || 'light',
                    {
                      card: 'tertiary',
                      border: 'primary',
                      gradient: 'primary',
                      shadow: 'glass',
                    }
                  )}
                >
                  {/* 完整路径 */}
                  <div>
                    <ThemeTextXS
                      weight="medium"
                      variant="secondary"
                      className="mb-2"
                    >
                      {t.dashboard('完整路径')}
                    </ThemeTextXS>
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
                      <div className="flex items-center gap-2">
                        <ThemeTextXS variant="tertiary">
                          {t.dashboard('独立访客')}
                        </ThemeTextXS>
                        <ThemeTextSM weight="medium" variant="primary">
                          {page.pageDetails?.uniqueVisitors ||
                            Math.floor(page.views * 0.8)}
                        </ThemeTextSM>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      <div className="flex items-center gap-2">
                        <ThemeTextXS variant="tertiary">
                          {t.dashboard('浏览量')}
                        </ThemeTextXS>
                        <ThemeTextSM weight="medium" variant="primary">
                          {page.views}
                        </ThemeTextSM>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <div className="flex items-center gap-2">
                        <ThemeTextXS variant="tertiary">
                          {t.dashboard('平均停留')}
                        </ThemeTextXS>
                        <ThemeTextSM weight="medium" variant="primary">
                          {formatTime(page.avgTime)}
                        </ThemeTextSM>
                      </div>
                    </div>
                  </div>

                  {/* 设备分布 */}
                  {page.pageDetails?.deviceDistribution && (
                    <div>
                      <ThemeTextXS
                        weight="medium"
                        variant="secondary"
                        className="mb-2"
                      >
                        {t.dashboard('设备分布')}
                      </ThemeTextXS>
                      <div className="space-y-2">
                        {page.pageDetails.deviceDistribution.map(
                          (device, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <ThemeTextXS variant="tertiary">
                                {device.device}
                              </ThemeTextXS>
                              <ThemeTextXS variant="primary">
                                {device.count} {t.dashboard('次')}
                              </ThemeTextXS>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 浏览器分布 */}
                  {page.pageDetails?.browserDistribution && (
                    <div>
                      <ThemeTextXS
                        weight="medium"
                        variant="secondary"
                        className="mb-2"
                      >
                        {t.dashboard('浏览器分布')}
                      </ThemeTextXS>
                      <div className="space-y-2">
                        {page.pageDetails.browserDistribution.map(
                          (browser, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between"
                            >
                              <ThemeTextXS variant="tertiary">
                                {browser.browser}
                              </ThemeTextXS>
                              <ThemeTextXS variant="primary">
                                {browser.count} {t.dashboard('次')}
                              </ThemeTextXS>
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
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
              currentTheme === 'dark' ? 'bg-gray-500/20' : 'bg-gray-400/20'
            }`}
          >
            <TrendingUp
              className={`w-6 h-6 ${
                currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
          </div>
          <ThemeTextSM variant="muted">
            {t.dashboard('暂无页面数据')}
          </ThemeTextSM>
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
            <ThemeTextXS
              weight="medium"
              variant="primary"
              className="truncate max-w-[180px]"
            >
              {page.pageDetails?.pathInfo?.originalPath || page.page}
            </ThemeTextXS>
            <ThemeTextXS variant="tertiary" className="opacity-80">
              {formatTime(page.avgTime)}
            </ThemeTextXS>
          </div>
        </div>
        <div className="text-right">
          <ThemeTextSM weight="medium" variant="primary">
            {page.views}
          </ThemeTextSM>
          <ThemeTextXS variant="tertiary" className="opacity-80">
            {t.dashboard('次')}
          </ThemeTextXS>
        </div>
      </div>
    )

    const renderExpandedContent = (page: PageHeatmapData) => (
      <div className="space-y-4">
        {/* 完整路径 */}
        <div>
          <ThemeTextXS weight="medium" variant="secondary" className="mb-2">
            {t.dashboard('完整路径')}
          </ThemeTextXS>
          <div className="text-xs">
            <span className="text-blue-400 font-mono">{page.page}</span>
          </div>
        </div>

        {/* 基础统计信息 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <ThemeTextXS variant="tertiary">
                {t.dashboard('独立访客')}
              </ThemeTextXS>
              <ThemeTextSM weight="medium" variant="primary">
                {page.pageDetails?.uniqueVisitors ||
                  Math.floor(page.views * 0.8)}
              </ThemeTextSM>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            <div>
              <ThemeTextXS variant="tertiary">
                {t.dashboard('浏览量')}
              </ThemeTextXS>
              <ThemeTextSM weight="medium" variant="primary">
                {page.views}
              </ThemeTextSM>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <div>
              <ThemeTextXS variant="tertiary">
                {t.dashboard('停留时间')}
              </ThemeTextXS>
              <ThemeTextSM weight="medium" variant="primary">
                {formatTime(page.avgTime)}
              </ThemeTextSM>
            </div>
          </div>
        </div>

        {/* 设备分布 */}
        {page.pageDetails?.deviceDistribution && (
          <div>
            <ThemeTextXS weight="medium" variant="secondary" className="mb-2">
              {t.dashboard('设备分布')}
            </ThemeTextXS>
            <div className="space-y-2">
              {page.pageDetails.deviceDistribution.map((device, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <ThemeTextXS variant="tertiary">{device.device}</ThemeTextXS>
                  <ThemeTextXS variant="primary">
                    {device.count} {t.dashboard('次')}
                  </ThemeTextXS>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 浏览器分布 */}
        {page.pageDetails?.browserDistribution && (
          <div>
            <ThemeTextXS weight="medium" variant="secondary" className="mb-2">
              {t.dashboard('浏览器分布')}
            </ThemeTextXS>
            <div className="space-y-2">
              {page.pageDetails.browserDistribution.map((browser, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <ThemeTextXS variant="tertiary">
                    {browser.browser}
                  </ThemeTextXS>
                  <ThemeTextXS variant="primary">
                    {browser.count} {t.dashboard('次')}
                  </ThemeTextXS>
                </div>
              ))}
            </div>
          </div>
        )}
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
        emptyText={t.dashboard('暂无页面数据')}
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
          {t.dashboard('热门页面')}
        </>
      }
      actions={
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500/20 text-blue-400'
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
                ? 'bg-blue-500/20 text-blue-400'
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

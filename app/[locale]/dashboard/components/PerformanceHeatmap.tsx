'use client'

import { FullscreenCard } from '@/app/components/full-screen'
import { ThemeTextSM, ThemeTextXS } from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import {
  PerformanceHeatmapMetric,
  PerformanceHeatmapResponse,
} from '@/lib/query-hook/use-analytics'
import { getThemeClasses } from '@/lib/theme/colors'
import { cn } from '@/lib/utils'
import {
  ArrowBigDown,
  ArrowBigUp,
  ChartSplineIcon,
  Clock,
  Globe,
  Info,
  MousePointer,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'

interface PerformanceHeatmapProps {
  data: PerformanceHeatmapResponse
}

export function PerformanceHeatmap({ data }: PerformanceHeatmapProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'heatmap' | 'chart'>('list')
  const t = useI18n()
  const { theme: currentTheme } = useTheme()

  const METRIC_LABELS: Record<string, string> = {
    FCP: t.dashboard('FCP'),
    LCP: t.dashboard('LCP'),
    CLS: t.dashboard('CLS'),
    FID: t.dashboard('FID'),
    INP: t.dashboard('INP'),
    TTFB: t.dashboard('TTFB'),
  }

  const METRIC_ICONS: Record<string, React.ReactNode> = {
    FCP: <Clock className="w-4 h-4 text-white" />,
    LCP: <TrendingUp className="w-4 h-4 text-white" />,
    CLS: <MousePointer className="w-4 h-4 text-white" />,
    FID: <Zap className="w-4 h-4 text-white" />,
    INP: <MousePointer className="w-4 h-4 text-white" />,
    TTFB: <Globe className="w-4 h-4 text-white" />,
  }

  const items = Object.values(data).map(
    (m: PerformanceHeatmapMetric & any) => ({
      id: m.key,
      key: m.key,
      intensity: m.intensity,
      stats: m.stats,
      pages: m.pages,
      thresholds: m.thresholds,
      breakdown: m.breakdown,
    })
  )

  const gradeOf = (key: string, avg: number | null) => {
    if (avg === null)
      return { label: t.dashboard('无数据'), color: 'text-gray-400' }

    const thresholds = data[key]?.thresholds
    if (!thresholds)
      return { label: t.dashboard('未知'), color: 'text-gray-400' }

    if (avg <= thresholds.good)
      return { label: t.dashboard('优秀'), color: 'text-green-400' }
    if (avg <= thresholds.needs)
      return { label: t.dashboard('良好'), color: 'text-yellow-400' }
    return { label: t.dashboard('较差'), color: 'text-red-400' }
  }

  const getHeatmapColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-500'
    if (intensity >= 0.6) return 'bg-orange-500'
    if (intensity >= 0.4) return 'bg-yellow-500'
    if (intensity >= 0.2) return 'bg-blue-500'
    return 'bg-gray-500'
  }

  const formatValue = (value: number | null, metric: string) => {
    if (value === null) return '-'
    if (metric === 'CLS') return value.toFixed(3)
    return Math.round(value).toString()
  }

  return (
    <FullscreenCard
      title={
        <>
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <div className="w-5 h-5 bg-blue-400 rounded-full"></div>
          </div>
          {t.dashboard('性能指标')}
          <ThemeTextXS variant="muted" className="flex items-center gap-1">
            <Info className="w-3 h-3" />{' '}
            {t.dashboard('阈值基于 Web Vitals 建议')}
          </ThemeTextXS>
        </>
      }
    >
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => {
            const isExpanded = expandedMetric === item.key
            const { min, max, avg, count } = item.stats
            const g = gradeOf(item.key, avg)
            const thresholds = item.thresholds || {}

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
                  onClick={() =>
                    setExpandedMetric(isExpanded ? null : item.key)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${getHeatmapColor(
                        item.intensity
                      )}`}
                    >
                      {METRIC_ICONS[item.key]}
                    </div>
                    <div>
                      <ThemeTextSM weight="medium" variant="primary">
                        {item.key}
                      </ThemeTextSM>
                      <ThemeTextXS variant="tertiary">
                        {METRIC_LABELS[item.key]}
                      </ThemeTextXS>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <ThemeTextSM weight="medium" variant="primary">
                        {formatValue(avg, item.key)}
                      </ThemeTextSM>
                      <ThemeTextXS variant="tertiary">
                        {t.dashboard('平均值')}
                      </ThemeTextXS>
                    </div>
                    <div className="text-right">
                      <ThemeTextSM weight="medium" variant="primary">
                        {count}
                      </ThemeTextSM>
                      <ThemeTextSM variant="tertiary">
                        {t.dashboard('样本数')}
                      </ThemeTextSM>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          currentTheme === 'dark'
                            ? 'bg-white/10'
                            : 'bg-black/10'
                        } ${g.color}`}
                      >
                        {g.label}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className={cn(
                      getThemeClasses(
                        'p-4 rounded-lg space-y-4',
                        (currentTheme as 'light' | 'dark') || 'light',
                        {
                          card: 'tertiary',
                          border: 'primary',
                          gradient: 'primary',
                          shadow: 'glass',
                        }
                      )
                    )}
                  >
                    {/* 基础统计信息 */}
                    <div className="space-y-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowBigDown className="w-4 h-4 text-green-400" />
                        <div>
                          <ThemeTextXS variant="tertiary">
                            {t.dashboard('最小值')}
                          </ThemeTextXS>
                          <ThemeTextSM weight="medium" variant="primary">
                            {formatValue(min, item.key)}
                          </ThemeTextSM>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowBigUp className="w-4 h-4 text-red-400" />
                        <div>
                          <ThemeTextXS variant="tertiary">
                            {t.dashboard('最大值')}
                          </ThemeTextXS>
                          <ThemeTextSM weight="medium" variant="primary">
                            {formatValue(max, item.key)}
                          </ThemeTextSM>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChartSplineIcon className="w-4 h-4 text-purple-400" />
                        <div>
                          <ThemeTextXS variant="tertiary">
                            {t.dashboard('样本数量')}
                          </ThemeTextXS>
                          <ThemeTextSM weight="medium" variant="primary">
                            {count} {t.dashboard('条记录')}
                          </ThemeTextSM>
                        </div>
                      </div>

                      {/* 阈值信息 */}
                      <div className="flex items-center gap-2">
                        <ThemeTextXS
                          weight="medium"
                          variant="secondary"
                          className="mb-2"
                        >
                          {t.dashboard('性能阈值')}
                        </ThemeTextXS>
                        <div className="text-xs">
                          <span className="text-green-400">
                            ≤{thresholds.good}
                          </span>
                          <ThemeTextXS variant="tertiary">
                            {t.dashboard('优秀')}
                          </ThemeTextXS>
                          <span className="text-yellow-400">
                            ≤{thresholds.needs}
                          </span>
                          <ThemeTextXS variant="tertiary">
                            {t.dashboard('良好')}
                          </ThemeTextXS>
                        </div>
                      </div>
                    </div>

                    {/* 设备分布 */}
                    {item.breakdown?.devices &&
                      item.breakdown.devices.length > 0 && (
                        <div>
                          <ThemeTextXS
                            weight="medium"
                            variant="secondary"
                            className="mb-2"
                          >
                            {t.dashboard('设备分布（平均值）')}
                          </ThemeTextXS>
                          <div className="space-y-2">
                            {item.breakdown.devices.map(
                              (device: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between"
                                >
                                  <ThemeTextXS variant="tertiary">
                                    {device.name}
                                  </ThemeTextXS>
                                  <ThemeTextXS variant="primary">
                                    {formatValue(device.avg, item.key)}
                                  </ThemeTextXS>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* 浏览器分布 */}
                    {item.breakdown?.browsers &&
                      item.breakdown.browsers.length > 0 && (
                        <div>
                          <ThemeTextXS
                            weight="medium"
                            variant="secondary"
                            className="mb-2"
                          >
                            {t.dashboard('浏览器分布（平均值）')}
                          </ThemeTextXS>
                          <div className="space-y-2">
                            {item.breakdown.browsers.map(
                              (browser: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between"
                                >
                                  <ThemeTextXS variant="tertiary">
                                    {browser.name}
                                  </ThemeTextXS>
                                  <ThemeTextXS variant="primary">
                                    {formatValue(browser.avg, item.key)}
                                  </ThemeTextXS>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* 相关页面 */}
                    {item.pages && item.pages.length > 0 && (
                      <div>
                        <ThemeTextXS
                          weight="medium"
                          variant="secondary"
                          className="mb-2"
                        >
                          {t.dashboard('相关页面')}
                        </ThemeTextXS>
                        <div className="space-y-2">
                          {item.pages.slice(0, 8).map((page: any) => (
                            <div key={page.page} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <ThemeTextXS
                                  variant="tertiary"
                                  className="truncate max-w-[60%]"
                                >
                                  {page.page}
                                </ThemeTextXS>
                                <ThemeTextXS variant="primary">
                                  {formatValue(page.avg, item.key)}
                                </ThemeTextXS>
                              </div>
                              <div
                                className={`w-full h-1 rounded ${
                                  currentTheme === 'dark'
                                    ? 'bg-gray-700/60'
                                    : 'bg-gray-300/60'
                                }`}
                              >
                                <div
                                  className="h-full rounded bg-blue-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        5,
                                        ((page.avg ?? 0) /
                                          (item.stats.max || 1)) *
                                          100
                                      )
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
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
              <Info
                className={`w-6 h-6 ${
                  currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </div>
            <ThemeTextSM variant="muted">
              {t.dashboard('暂无性能数据')}
            </ThemeTextSM>
          </div>
        )}
      </div>
    </FullscreenCard>
  )
}

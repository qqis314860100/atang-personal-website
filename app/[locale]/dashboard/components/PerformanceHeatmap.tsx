'use client'

import { useState } from 'react'
import {
  PerformanceHeatmapResponse,
  PerformanceHeatmapMetric,
} from '@/lib/query-hook/use-analytics'
import {
  Info,
  TrendingUp,
  Clock,
  Zap,
  MousePointer,
  Globe,
  ArrowBigUp,
  ArrowBigDown,
  ChartSplineIcon,
  ViewIcon,
} from 'lucide-react'
import { FullscreenCard } from '@/app/components/full-screen'

interface PerformanceHeatmapProps {
  data: PerformanceHeatmapResponse
}

const METRIC_LABELS: Record<string, string> = {
  FCP: '首次内容绘制',
  LCP: '最大内容绘制',
  CLS: '累积布局偏移',
  FID: '首次输入延迟',
  INP: '交互到下次绘制',
  TTFB: '首字节时间',
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
  FCP: <Clock className="w-4 h-4 text-white" />,
  LCP: <TrendingUp className="w-4 h-4 text-white" />,
  CLS: <MousePointer className="w-4 h-4 text-white" />,
  FID: <Zap className="w-4 h-4 text-white" />,
  INP: <MousePointer className="w-4 h-4 text-white" />,
  TTFB: <Globe className="w-4 h-4 text-white" />,
}

export function PerformanceHeatmap({ data }: PerformanceHeatmapProps) {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'heatmap' | 'chart'>('list')

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
    if (avg === null) return { label: '无数据', color: 'text-gray-400' }

    const t = data[key]?.thresholds
    if (!t) return { label: '未知', color: 'text-gray-400' }

    if (avg <= t.good) return { label: '优秀', color: 'text-green-400' }
    if (avg <= t.needs) return { label: '良好', color: 'text-yellow-400' }
    return { label: '较差', color: 'text-red-400' }
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
          性能指标热力图
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Info className="w-3 h-3" /> 阈值基于 Web Vitals 建议
          </span>
        </>
      }
    >
      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => {
            const isExpanded = expandedMetric === item.key
            const { min, max, avg, count } = item.stats
            const g = gradeOf(item.key, avg)
            const t = item.thresholds || {}

            return (
              <div key={index} className="space-y-2">
                <div
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
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
                      <p className="text-sm font-medium text-white">
                        {item.key}
                      </p>
                      <p className="text-xs text-gray-400">
                        {METRIC_LABELS[item.key]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {formatValue(avg, item.key)}
                      </p>
                      <p className="text-xs text-gray-400">平均值</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{count}</p>
                      <p className="text-xs text-gray-400">样本数</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded bg-white/10 ${g.color}`}
                      >
                        {g.label}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="ml-8 p-4 bg-gray-800/30 rounded-lg space-y-4">
                    {/* 基础统计信息 */}
                    <div className="space-y-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowBigDown className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-xs text-gray-400">最小值</p>
                          <p className="text-sm font-medium text-white">
                            {formatValue(min, item.key)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowBigUp className="w-4 h-4 text-red-400" />
                        <div>
                          <p className="text-xs text-gray-400">最大值</p>
                          <p className="text-sm font-medium text-white">
                            {formatValue(max, item.key)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChartSplineIcon className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-xs text-gray-400">样本数量</p>
                          <p className="text-sm font-medium text-white">
                            {count} 条记录
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 阈值信息 */}
                    <div>
                      <p className="text-xs font-medium text-gray-300 mb-2">
                        性能阈值
                      </p>
                      <div className="text-xs">
                        <span className="text-green-400">≤{t.good}</span>
                        <span className="text-gray-400"> 优秀 · </span>
                        <span className="text-yellow-400">≤{t.needs}</span>
                        <span className="text-gray-400"> 良好</span>
                      </div>
                    </div>

                    {/* 设备分布 */}
                    {item.breakdown?.devices &&
                      item.breakdown.devices.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-300 mb-2">
                            设备分布（平均值）
                          </p>
                          <div className="space-y-2">
                            {item.breakdown.devices.map((d: any) => (
                              <div
                                key={d.name}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-gray-400">
                                  {d.name}
                                </span>
                                <span className="text-xs text-white">
                                  {formatValue(d.avg, item.key)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* 浏览器分布 */}
                    {item.breakdown?.browsers &&
                      item.breakdown.browsers.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-300 mb-2">
                            浏览器分布（平均值）
                          </p>
                          <div className="space-y-2">
                            {item.breakdown.browsers.map((b: any) => (
                              <div
                                key={b.name}
                                className="flex items-center justify-between"
                              >
                                <span className="text-xs text-gray-400">
                                  {b.name}
                                </span>
                                <span className="text-xs text-white">
                                  {formatValue(b.avg, item.key)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* 相关页面 */}
                    {item.pages && item.pages.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-300 mb-2">
                          相关页面
                        </p>
                        <div className="space-y-2">
                          {item.pages.slice(0, 8).map((p: any) => (
                            <div key={p.page} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 truncate max-w-[60%]">
                                  {p.page}
                                </span>
                                <span className="text-xs text-white">
                                  {formatValue(p.avg, item.key)}
                                </span>
                              </div>
                              <div className="w-full h-1 bg-gray-700/60 rounded">
                                <div
                                  className="h-full rounded bg-blue-500"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        5,
                                        ((p.avg ?? 0) / (item.stats.max || 1)) *
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
            <div className="w-12 h-12 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-400">暂无性能数据</p>
          </div>
        )}
      </div>
    </FullscreenCard>
  )
}

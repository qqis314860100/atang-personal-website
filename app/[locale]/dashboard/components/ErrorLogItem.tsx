'use client'

import { ThemeTextSM, ThemeTextXS } from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import { Badge } from '@/components/ui/badge'
import { getThemeClasses } from '@/lib/theme/colors'
import { Clock, MapPin, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import React, { useCallback } from 'react'
import toast from 'react-hot-toast'

interface ErrorLog {
  id: string
  type: string
  message: string
  stackTrace: string
  page: string
  count: number
  lastOccurrence: string
  severity: string
  userAgent: string
  ipAddress: string
  timestamp: string
  level: string
  source: string
  traceId?: string
}

interface ErrorLogItemProps {
  error: ErrorLog
  isExpanded: boolean
  onExpand: (errorId: string) => void
  onErrorClick: (errorId: string) => void
  getSeverityColor: (severity: string) => string
  getSeverityIcon: (severity: string) => React.ReactNode
  formatTimestamp: (timestamp: string) => string
  truncateMessage: (message: string, maxLength?: number) => string
}

export function ErrorLogItem({
  error,
  isExpanded,
  onExpand,
  onErrorClick,
  getSeverityColor,
  getSeverityIcon,
  formatTimestamp,
  truncateMessage,
}: ErrorLogItemProps) {
  const t = useI18n()
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  // 使用 useMemo 优化主题样式计算
  const themeStyles = React.useMemo(() => {
    const theme = currentTheme || 'light'
    return {
      mainCard: getThemeClasses('transition-all duration-300', theme, {
        card: 'glass',
        border: 'primary',
        hover: 'primary',
      }),
      badge: getThemeClasses('', theme, {
        card: 'secondary',
        border: 'primary',
        text: 'secondary',
      }),
    }
  }, [currentTheme])

  const handleExpand = useCallback(() => {
    if (error.id && isExpanded) {
      onExpand('')
    } else {
      onExpand(error.id)
    }
  }, [error.id, onExpand, isExpanded])

  const handleErrorClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onErrorClick(error.id)
    },
    [error.id, onErrorClick]
  )

  const handleCopyError = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      navigator.clipboard.writeText(JSON.stringify(error, null, 2))
      toast.success(t.dashboard('错误信息已复制到剪贴板'))
    },
    [error, t]
  )

  return (
    <>
      <div
        className={`${themeStyles.mainCard}border rounded-lg p-6 hover:scale-[1.01] cursor-pointer`}
        onClick={handleExpand}
      >
        <div className="flex items-start justify-between">
          {/* 左侧：错误信息 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <div
                className={`p-1 rounded border ${getSeverityColor(
                  error.severity
                )}`}
              >
                {getSeverityIcon(error.severity)}
              </div>
              <div className="flex items-center gap-2">
                <ThemeTextSM weight="medium" variant="primary">
                  {error.type}
                </ThemeTextSM>
                <Badge
                  variant="outline"
                  className={`text-xs ${themeStyles.badge}`}
                >
                  {error.count} {t.dashboard('次')}
                </Badge>
              </div>
            </div>

            <div className="ml-8">
              <ThemeTextSM variant="secondary" className="leading-relaxed">
                {truncateMessage(error.message)}
              </ThemeTextSM>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <ThemeTextXS variant="tertiary">{error.page}</ThemeTextXS>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <ThemeTextXS variant="tertiary">
                    {formatTimestamp(error.timestamp)}
                  </ThemeTextXS>
                </div>
                <div className="flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  <ThemeTextXS variant="tertiary">
                    {error.source || 'frontend'}
                  </ThemeTextXS>
                </div>
                {error.traceId && (
                  <div className="flex items-center gap-1">
                    <ThemeTextXS variant="tertiary" className="font-mono">
                      {error.traceId}
                    </ThemeTextXS>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：操作和状态 */}
          <div className="flex items-center gap-2 ml-4">
            <Badge
              variant="outline"
              className={`text-xs ${getSeverityColor(error.severity)}`}
            >
              {error.severity}
            </Badge>
          </div>
        </div>
      </div>

      {/* 展开的详细信息 */}
      {isExpanded && (
        <div
          className={`p-4 ${getThemeClasses(
            'border rounded-lg space-y-4',
            currentTheme || 'light',
            {
              card: 'secondary',
              border: 'primary',
            }
          )}`}
        >
          {/* 完整错误信息 */}
          <div className="flex flex-col gap-1">
            <ThemeTextSM weight="medium" variant="primary" className="mb-2">
              {t.dashboard('错误详情')}
            </ThemeTextSM>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <ThemeTextXS variant="muted">
                  {t.dashboard('错误类型:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary" className="font-mono">
                  {error.type}
                </ThemeTextXS>
              </div>
              <div className="flex justify-between text-xs">
                <ThemeTextXS variant="muted">
                  {t.dashboard('错误消息:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary">{error.message}</ThemeTextXS>
              </div>
              <div className="flex justify-between text-xs">
                <ThemeTextXS variant="muted">
                  {t.dashboard('发生次数:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary">
                  {error.count} {t.dashboard('次')}
                </ThemeTextXS>
              </div>
              <div className="flex justify-between text-xs">
                <ThemeTextXS variant="muted">
                  {t.dashboard('最后发生:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary">
                  {formatTimestamp(error.timestamp)}
                </ThemeTextXS>
              </div>
              <div className="flex justify-between text-xs">
                <ThemeTextXS variant="muted">
                  {t.dashboard('严重程度:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary" className="capitalize">
                  {error.severity}
                </ThemeTextXS>
              </div>
            </div>
          </div>

          {/* 堆栈跟踪 */}
          {error.stackTrace && (
            <div>
              <ThemeTextSM weight="medium" variant="primary" className="mb-2">
                {t.dashboard('堆栈跟踪')}
              </ThemeTextSM>
              <pre
                className={`text-xs p-3 rounded border overflow-x-auto ${getThemeClasses(
                  '',
                  currentTheme || 'light',
                  {
                    card: 'tertiary',
                    border: 'primary',
                    text: 'secondary',
                  }
                )}`}
              >
                {error.stackTrace}
              </pre>
            </div>
          )}

          {/* 上下文信息 */}
          <div className="flex flex-col gap-1">
            <ThemeTextSM weight="medium" variant="primary" className="mb-2">
              {t.dashboard('上下文信息')}
            </ThemeTextSM>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <ThemeTextXS variant="muted">
                  {t.dashboard('页面路径:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary" className="ml-2">
                  {error.page}
                </ThemeTextXS>
              </div>
              <div>
                <ThemeTextXS variant="muted">
                  {t.dashboard('错误来源:')}
                </ThemeTextXS>
                <ThemeTextXS variant="secondary" className="ml-2">
                  {error.source || 'frontend'}
                </ThemeTextXS>
              </div>

              {error.traceId && (
                <div>
                  <ThemeTextXS variant="muted">
                    {t.dashboard('追踪ID:')}
                  </ThemeTextXS>
                  <ThemeTextXS variant="secondary" className="ml-2 font-mono">
                    {error.traceId}
                  </ThemeTextXS>
                </div>
              )}
            </div>
          </div>

          {/* 浏览器内核 */}
          {error.userAgent && (
            <div className="flex gap-2 items-center">
              <ThemeTextSM weight="medium" variant="primary" className="mb-2">
                {t.dashboard('浏览器内核')}
              </ThemeTextSM>
              <ThemeTextXS
                variant="secondary"
                className={`p-3 rounded border break-all ${getThemeClasses(
                  '',
                  currentTheme || 'light',
                  {
                    card: 'tertiary',
                    border: 'primary',
                  }
                )}`}
              >
                {error.userAgent}
              </ThemeTextXS>
            </div>
          )}

          {/* 操作按钮 */}
          <div
            className={`flex items-center gap-2 pt-2 border-t ${getThemeClasses(
              '',
              currentTheme || 'light',
              {
                border: 'primary',
              }
            )}`}
          >
            <button
              onClick={handleErrorClick}
              className={`px-3 py-1 text-xs rounded transition-colors cursor-pointer ${getThemeClasses(
                'hover:scale-105',
                currentTheme || 'light',
                {
                  card: 'primary',
                  text: 'primary',
                  hover: 'secondary',
                }
              )}`}
            >
              {t.dashboard('查看完整详情')}
            </button>
            <button
              onClick={handleCopyError}
              className={`px-3 cursor-pointer py-1 text-xs rounded transition-colors hover:scale-105 ${getThemeClasses(
                '',
                currentTheme || 'light',
                {
                  card: 'secondary',
                  text: 'secondary',
                  hover: 'primary',
                }
              )}`}
            >
              {t.dashboard('复制错误信息')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

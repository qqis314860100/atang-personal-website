'use client'

import {
  ThemeText,
  ThemeTextSM,
  ThemeTextXS,
} from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import { Badge } from '@/components/ui/badge'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { getThemeClasses } from '@/lib/theme/colors'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useTheme } from 'next-themes'

interface ErrorDetailModalProps {
  error: any
  isOpen: boolean
  onClose: () => void
}

export function ErrorDetailModal({
  error,
  isOpen,
  onClose,
}: ErrorDetailModalProps) {
  const t = useI18n()
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  if (!isOpen || !error) return null

  // 获取严重程度图标
  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-500/10 border-red-500/20 text-red-600 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400'
      case 'medium':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:bg-yellow-500/20 dark:border-yellow-500/30 dark:text-yellow-400'
      case 'low':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400'
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-600 dark:bg-gray-500/20 dark:border-gray-500/30 dark:text-gray-400'
    }
  }

  // 主题样式
  const modalStyles = getThemeClasses(
    'fixed inset-0 z-50 flex items-center justify-center p-4',
    currentTheme
  )

  const backdropStyles = getThemeClasses(
    'absolute inset-0 bg-black/50 backdrop-blur-sm',
    currentTheme
  )

  const contentStyles = getThemeClasses(
    'relative max-w-2xl w-full max-h-[80vh] overflow-y-auto',
    currentTheme
  )

  return (
    <div className={modalStyles}>
      {/* 背景遮罩 */}
      <div className={backdropStyles} onClick={onClose} />

      {/* 模态框内容 */}
      <div className={contentStyles}>
        <ThemeCard variant="elevated" className="border-0">
          <ThemeCardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSeverityIcon(error.severity)}
                <ThemeCardTitle>{t.dashboard('错误详情')}</ThemeCardTitle>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </ThemeCardHeader>

          <ThemeCardContent className="space-y-6">
            {/* 基本信息网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('错误类型')}
                </ThemeTextSM>
                <ThemeText weight="medium" variant="primary">
                  {error.error_type || '未知'}
                </ThemeText>
              </div>

              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('严重程度')}
                </ThemeTextSM>
                <Badge
                  variant="outline"
                  className={getSeverityColor(error.severity)}
                >
                  {getSeverityIcon(error.severity)}
                  {error.severity || '未知'}
                </Badge>
              </div>

              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('发生页面')}
                </ThemeTextSM>
                <ThemeText weight="medium" variant="primary">
                  {error.page || '未知'}
                </ThemeText>
              </div>

              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('发生时间')}
                </ThemeTextSM>
                <ThemeText weight="medium" variant="primary">
                  {new Date(error.timestamp).toLocaleString('zh-CN')}
                </ThemeText>
              </div>
            </div>

            {/* 错误信息 */}
            <div className="space-y-2">
              <ThemeTextSM variant="muted">
                {t.dashboard('错误信息')}
              </ThemeTextSM>
              <div
                className={getThemeClasses(
                  'rounded-lg p-4 border',
                  currentTheme,
                  { card: 'secondary', border: 'error' }
                )}
              >
                <ThemeTextSM variant="error" className="font-mono">
                  {error.error_message || '无错误信息'}
                </ThemeTextSM>
              </div>
            </div>

            {/* 堆栈跟踪 */}
            {error.stack_trace && (
              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('堆栈跟踪')}
                </ThemeTextSM>
                <div
                  className={getThemeClasses(
                    'rounded-lg p-4 border overflow-x-auto',
                    currentTheme,
                    { card: 'secondary', border: 'primary' }
                  )}
                >
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                    <ThemeTextXS variant="secondary">
                      {error.stack_trace}
                    </ThemeTextXS>
                  </pre>
                </div>
              </div>
            )}

            {/* 环境信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('用户代理')}
                </ThemeTextSM>
                <div
                  className={getThemeClasses(
                    'rounded-lg p-3 border',
                    currentTheme,
                    { card: 'tertiary', border: 'secondary' }
                  )}
                >
                  <ThemeTextXS variant="secondary" className="break-all">
                    {error.user_agent || '未知'}
                  </ThemeTextXS>
                </div>
              </div>

              <div className="space-y-2">
                <ThemeTextSM variant="muted">
                  {t.dashboard('IP地址')}
                </ThemeTextSM>
                <div
                  className={getThemeClasses(
                    'rounded-lg p-3 border',
                    currentTheme,
                    { card: 'tertiary', border: 'secondary' }
                  )}
                >
                  <ThemeTextXS variant="secondary">
                    {error.ip_address || '未知'}
                  </ThemeTextXS>
                </div>
              </div>
            </div>
          </ThemeCardContent>
        </ThemeCard>
      </div>
    </div>
  )
}

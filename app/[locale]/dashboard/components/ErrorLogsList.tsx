'use client'

import { ThemeText, ThemeTextSM } from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import { getThemeClasses } from '@/lib/theme/colors'
import { useTheme } from 'next-themes'
import { ErrorLogItem } from './ErrorLogItem'
import {
  ErrorLog,
  formatTimestamp,
  getSeverityColor,
  getSeverityIcon,
  truncateMessage,
} from './ErrorLogs.utils'

interface ErrorLogsListProps {
  data: ErrorLog[]
  expandedError: string | null
  isLoading?: boolean
  onErrorExpand: (errorId: string) => void
  onErrorClick: (errorId: string) => void
}

export function ErrorLogsList({
  data,
  expandedError,
  isLoading = false,
  onErrorExpand,
  onErrorClick,
}: ErrorLogsListProps) {
  const t = useI18n()
  const { theme, systemTheme } = useTheme()
  const currentTheme = (theme === 'system' ? systemTheme : theme) as
    | 'light'
    | 'dark'
    | undefined

  // 获取主题相关的样式类
  const themeClasses = getThemeClasses(
    'transition-all duration-300',
    currentTheme || 'light',
    {
      card: 'glass',
      border: 'primary',
      text: 'secondary',
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div
          className={`w-6 h-6 border-2 rounded-full animate-spin ${getThemeClasses(
            '',
            currentTheme || 'light',
            {
              border: 'error',
            }
          )}`}
        ></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-32 text-center ${themeClasses}`}
      >
        <ThemeText
          size="lg"
          weight="medium"
          variant="secondary"
          className="mb-2"
        >
          {t.dashboard('暂无错误日志')}
        </ThemeText>
        <ThemeTextSM variant="muted">
          {t.dashboard('当前筛选条件下没有找到相关的错误日志')}
        </ThemeTextSM>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {data.map((error) => (
        <ErrorLogItem
          key={error.id}
          error={error}
          isExpanded={expandedError === error.id}
          onExpand={onErrorExpand}
          onErrorClick={onErrorClick}
          getSeverityColor={getSeverityColor}
          getSeverityIcon={getSeverityIcon}
          formatTimestamp={formatTimestamp}
          truncateMessage={truncateMessage}
        />
      ))}
    </div>
  )
}

'use client'

import { useRealTime } from '@/app/components/providers/RealTimeProvider'
import { ThemeText, ThemeTextXS } from '@/app/components/ui/theme-text'
import { useI18n } from '@/app/hooks/use-i18n'
import { Button } from '@/components/ui/button'
import { getThemeClasses } from '@/lib/theme/colors'
import { cn } from '@/lib/utils'
import { Pause, Wifi } from 'lucide-react'
import { useTheme } from 'next-themes'

export function RealTimeToggle() {
  const { isEnabled, setIsEnabled, lastUpdate } = useRealTime()
  const t = useI18n()
  const { theme } = useTheme()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3  rounded-lg backdrop-blur-sm border border-gray-700/50',
        getThemeClasses(
          'bg-gray-800/50',
          (theme as 'light' | 'dark') || 'light',
          {
            card: 'glass',
            border: 'primary',
          }
        )
      )}
    >
      <Button
        variant={isEnabled ? 'default' : 'secondary'}
        size="sm"
        onClick={() => setIsEnabled(!isEnabled)}
        className="flex items-center gap-2 relative overflow-hidden group cursor-pointer"
      >
        {/* 背景渐变动画 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 图标和文字 */}
        <div className="relative z-10 flex items-center gap-2">
          {isEnabled ? (
            <>
              <ThemeText
                variant="primary"
                className="animate-pulse animate-infinite text-md text-white"
              >
                {t.dashboard('实时更新中')}
              </ThemeText>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 text-gray-300" />
              <ThemeText variant="muted" weight="medium">
                {t.dashboard('已暂停')}
              </ThemeText>
            </>
          )}
        </div>
      </Button>

      <div className="flex items-center gap-3 text-xs">
        {/* 网络状态指示器 */}
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-green-400" />
          <ThemeTextXS variant="muted">{t.dashboard('在线')}</ThemeTextXS>
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-2 text-gray-400">
          {isEnabled ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <ThemeTextXS variant="muted">
                {t.dashboard('最后更新: {time}', {
                  params: { time: formatTime(lastUpdate) },
                })}
              </ThemeTextXS>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <ThemeTextXS variant="muted">
                {t.dashboard('点击启用实时更新')}
              </ThemeTextXS>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

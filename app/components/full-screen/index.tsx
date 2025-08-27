'use client'

import { useFullscreenAnimation } from '@/app/hooks/use-fullscreen-animation'
import { ThemeCard } from '@/components/ui/theme-card'
import { getThemeClasses } from '@/lib/theme/colors'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { ReactNode, useEffect } from 'react'

interface FullscreenCardProps {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  variant?: 'default' | 'glass' | 'elevated' | 'bordered'
}

export function FullscreenCard({
  title,
  actions,
  children,
  className = '',
  header,
  footer,
  variant = 'glass',
}: FullscreenCardProps) {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const {
    isFullscreen,
    isAnimating,
    toggleFullscreen,
    getAnimationStyles,
    getSizeClasses,
    getAnimationStateClasses,
  } = useFullscreenAnimation({
    duration: 400,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    scale: 0.95,
    translateY: 10,
    opacity: 0.9,
  })

  // 全屏时禁用 body 滚动
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // 清理函数
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  // 获取主题相关的样式类
  const themeClasses = getThemeClasses(
    'transition-all duration-300',
    currentTheme || 'light',
    {
      card: variant === 'glass' ? 'glass' : 'primary',
      border: 'primary',
      gradient: 'primary',
      shadow: 'glass',
      hover: 'primary',
    }
  )

  return (
    <div
      className={`${
        isFullscreen
          ? 'fixed inset-0 z-50 p-4 md:p-6 bg-gray-900/95 dark:bg-gray-900/95'
          : ''
      }`}
    >
      <ThemeCard
        variant={variant}
        className={`${themeClasses} h-[400px] flex flex-col ${className} ${getSizeClasses(
          'relative'
        )}`}
        style={getAnimationStyles()}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${getThemeClasses(
            'transition-colors duration-200',
            currentTheme || 'light',
            {
              border: 'primary',
            }
          )}`}
        >
          <div
            className={`flex items-center gap-3 text-lg font-semibold ${getThemeClasses(
              '',
              currentTheme || 'light',
              {
                text: 'primary',
              }
            )}`}
          >
            {title}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-md transition-all duration-200 ${
                isAnimating ? 'scale-95' : ''
              } ${getThemeClasses('hover:scale-105', currentTheme || 'light', {
                card: 'secondary',
                hover: 'primary',
                text: 'primary',
              })}`}
              title={isFullscreen ? '退出全屏' : '全屏'}
              disabled={isAnimating}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {header && (
          <div
            className={`flex-shrink-0 border-b ${getThemeClasses(
              'transition-colors duration-200',
              currentTheme || 'light',
              {
                border: 'primary',
              }
            )}`}
          >
            {header}
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-2">{children}</div>
        </div>

        {footer && (
          <div
            className={`flex-shrink-0 border-t ${getThemeClasses(
              'transition-colors duration-200',
              currentTheme || 'light',
              {
                border: 'primary',
              }
            )}`}
          >
            {footer}
          </div>
        )}
      </ThemeCard>
    </div>
  )
}

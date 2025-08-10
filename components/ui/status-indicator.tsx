'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StatusIndicatorProps {
  type: 'theme' | 'language'
  className?: string
}

export function StatusIndicator({ type, className }: StatusIndicatorProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()

  // 获取当前语言
  const currentLocale = pathname.split('/')[1] || 'zh'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (type === 'theme') {
    if (!mounted) {
      return (
        <Badge
          variant="outline"
          className={cn('text-xs animate-pulse', className)}
        >
          加载中...
        </Badge>
      )
    }

    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs transition-all duration-200',
          theme === 'dark'
            ? 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400'
            : 'border-blue-500/30 text-blue-600 dark:text-blue-400',
          className
        )}
      >
        {theme === 'dark' ? '🌙 深色' : '☀️ 浅色'}
      </Badge>
    )
  }

  if (type === 'language') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs transition-all duration-200',
          'border-green-500/30 text-green-600 dark:text-green-400',
          className
        )}
      >
        {currentLocale === 'zh' ? '🇨🇳 中文' : '🇺🇸 English'}
      </Badge>
    )
  }

  return null
}

// 主题状态指示器
export function ThemeStatusIndicator({ className }: { className?: string }) {
  return <StatusIndicator type="theme" className={className} />
}

// 语言状态指示器
export function LanguageStatusIndicator({ className }: { className?: string }) {
  return <StatusIndicator type="language" className={className} />
}

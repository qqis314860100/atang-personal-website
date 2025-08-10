'use client'

import {
  LanguageStatusIndicator,
  ThemeStatusIndicator,
} from '@/components/ui/status-indicator'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function GlobalStatusBar() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()

  // 获取当前语言
  const currentLocale = pathname.split('/')[1] || 'zh'

  useEffect(() => {
    setMounted(true)
  }, [])

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-4">
            <span className="font-medium">开发模式</span>
            <div className="flex items-center gap-2">
              <span>主题:</span>
              <ThemeStatusIndicator className="text-white border-white/30" />
            </div>
            <div className="flex items-center gap-2">
              <span>语言:</span>
              <LanguageStatusIndicator className="text-white border-white/30" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span>路径:</span>
            <code className="bg-white/20 px-2 py-1 rounded text-xs font-mono">
              {pathname}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

// 简化的状态指示器，用于状态栏
export function StatusBarIndicator({
  type,
  className,
}: {
  type: 'theme' | 'language'
  className?: string
}) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()

  const currentLocale = pathname.split('/')[1] || 'zh'

  useEffect(() => {
    setMounted(true)
  }, [])

  if (type === 'theme') {
    if (!mounted) {
      return <span className={cn('animate-pulse', className)}>加载中...</span>
    }
    return (
      <span className={cn('flex items-center gap-1', className)}>
        {theme === 'dark' ? '🌙' : '☀️'}
        {theme === 'dark' ? '深色' : '浅色'}
      </span>
    )
  }

  if (type === 'language') {
    return (
      <span className={cn('flex items-center gap-1', className)}>
        {currentLocale === 'zh' ? '🇨🇳' : '🇺🇸'}
        {currentLocale === 'zh' ? '中文' : 'English'}
      </span>
    )
  }

  return null
}

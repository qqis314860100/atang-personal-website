'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CN, US } from 'country-flag-icons/react/3x2'
import { GlobeIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface StatusDisplayProps {
  className?: string
  showPath?: boolean
  showIcons?: boolean
  variant?: 'card' | 'inline' | 'minimal'
}

export function StatusDisplay({
  className,
  showPath = true,
  showIcons = true,
  variant = 'card',
}: StatusDisplayProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()

  // 获取当前语言
  const currentLocale = pathname.split('/')[1] || 'zh'

  useEffect(() => {
    setMounted(true)
  }, [])

  const themeInfo = {
    icon:
      mounted && theme === 'dark' ? (
        <MoonIcon className="h-4 w-4" />
      ) : (
        <SunIcon className="h-4 w-4" />
      ),
    text: mounted ? (theme === 'dark' ? '深色模式' : '浅色模式') : '加载中...',
    emoji: mounted && theme === 'dark' ? '🌙' : '☀️',
    color: mounted && theme === 'dark' ? 'text-yellow-500' : 'text-blue-500',
  }

  const languageInfo = {
    icon: <GlobeIcon className="h-4 w-4" />,
    flag:
      currentLocale === 'zh' ? (
        <CN className="h-4 w-6" />
      ) : (
        <US className="h-4 w-6" />
      ),
    text: currentLocale === 'zh' ? '中文' : 'English',
    emoji: currentLocale === 'zh' ? '🇨🇳' : '🇺🇸',
    color: 'text-green-500',
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2 text-xs', className)}>
        <span className={cn('flex items-center gap-1', themeInfo.color)}>
          {showIcons && themeInfo.icon}
          {themeInfo.emoji}
        </span>
        <span className={cn('flex items-center gap-1', languageInfo.color)}>
          {showIcons && languageInfo.flag}
          {languageInfo.emoji}
        </span>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">主题:</span>
          <Badge variant="outline" className={cn('text-xs', themeInfo.color)}>
            {showIcons && themeInfo.icon}
            {themeInfo.emoji} {themeInfo.text}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">语言:</span>
          <Badge
            variant="outline"
            className={cn('text-xs', languageInfo.color)}
          >
            {showIcons && languageInfo.flag}
            {languageInfo.emoji} {languageInfo.text}
          </Badge>
        </div>
        {showPath && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">路径:</span>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {pathname}
            </code>
          </div>
        )}
      </div>
    )
  }

  // 默认卡片样式
  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">当前状态</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">主题模式</span>
          <Badge variant="outline" className={cn('text-xs', themeInfo.color)}>
            {showIcons && themeInfo.icon}
            {themeInfo.emoji} {themeInfo.text}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">界面语言</span>
          <Badge
            variant="outline"
            className={cn('text-xs', languageInfo.color)}
          >
            {showIcons && languageInfo.flag}
            {languageInfo.emoji} {languageInfo.text}
          </Badge>
        </div>
        {showPath && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">当前路径</span>
            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-[200px] truncate">
              {pathname}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

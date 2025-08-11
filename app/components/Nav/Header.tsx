'use client'

import Logon from '@/app/components/Nav/Logon'
import { useI18n } from '@/app/hooks/use-i18n'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import {
  LanguageStatusIndicator,
  ThemeStatusIndicator,
} from '@/components/ui/status-indicator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import siteMetadata from '@/data/siteMetadata'
import { cn } from '@/lib/utils'
import { CN, US } from 'country-flag-icons/react/3x2'
import { GlobeIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface NavMenuItem {
  title: string
  href: string
  description?: string
  children?: NavMenuItem[]
}

const Header = () => {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const t = useI18n()

  // 获取当前语言
  const currentLocale = pathname.split('/')[1] || 'zh'

  // 是否隐藏头部（登录页）
  const shouldHide = useMemo(() => {
    if (!mounted) return false
    return document.documentElement.getAttribute('data-hide-header') === 'true'
  }, [mounted, pathname])

  // 导航菜单数据
  const navMenuData = [
    { title: t.navbar('首页'), href: '/home' },
    { title: t.navbar('仪表盘'), href: '/dashboard' },
    { title: t.navbar('博客'), href: '/blog' },
    { title: t.navbar('项目'), href: '/project' },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLocale: string): void => {
    const currentPath = pathname.replace(`/${currentLocale}`, '')
    const newPath = `/${newLocale}${currentPath === '/' ? '' : currentPath}`
    window.location.href = newPath
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // 获取主题状态文本
  const getThemeStatusText = () => {
    if (!mounted) return t.navbar('加载中...')
    return theme === 'dark' ? t.navbar('深色模式') : t.navbar('浅色模式')
  }

  // 获取语言状态文本
  const getLanguageStatusText = () => {
    return currentLocale === 'zh' ? t.navbar('中文') : t.navbar('English')
  }

  if (shouldHide) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="containerw  flex h-16 items-center justify-between px-6">
        {/* 左侧Logo和导航 */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link
              href={`/${currentLocale}`}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                {siteMetadata.title}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center ">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {(navMenuData as NavMenuItem[]).map((parent, index) => {
                  // 修复菜单高亮逻辑：正确匹配当前路径
                  const currentPath =
                    pathname.replace(`/${currentLocale}`, '') || '/'
                  const isActive =
                    currentPath === parent.href ||
                    (parent.href !== '/' && currentPath.startsWith(parent.href))
                  return (
                    <NavigationMenuItem key={parent.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={`/${currentLocale}${
                            parent.href === '/' ? '' : parent.href
                          }`}
                          className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-gray-800 text-white shadow-sm hover:bg-gray-800 hover:text-white'
                              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                          )}
                        >
                          {parent.title}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-3">
          {/* 主题切换按钮 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'h-9 w-9 rounded-xl transition-all duration-200 relative',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  )}
                  onClick={toggleTheme}
                  aria-label={t.navbar('切换主题')}
                >
                  {mounted && theme === 'dark' ? (
                    <SunIcon className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <MoonIcon className="h-4 w-4 text-blue-500" />
                  )}
                  {/* 主题状态指示器 */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-2">
                <span>{getThemeStatusText()}</span>
                <ThemeStatusIndicator />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* 语言切换下拉菜单 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-9 w-9 rounded-xl transition-all duration-200 relative',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                      )}
                      aria-label={t.navbar('切换语言')}
                    >
                      <GlobeIcon className="h-4 w-4 text-green-500" />
                      {/* 语言状态指示器 */}
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-48">
                    <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t.navbar('当前语言')}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {currentLocale === 'zh' ? (
                          <>
                            <CN className="h-4 w-6" />
                            <span>{t.navbar('中文')}</span>
                          </>
                        ) : (
                          <>
                            <US className="h-4 w-6" />
                            <span>{t.navbar('English')}</span>
                          </>
                        )}
                        <LanguageStatusIndicator />
                      </div>
                    </div>
                    {siteMetadata.languages.map((locale) => (
                      <DropdownMenuItem
                        key={locale}
                        onClick={() => handleLanguageChange(locale)}
                        className={cn(
                          'rounded-lg transition-all duration-200',
                          currentLocale === locale
                            ? 'font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center gap-3 w-full">
                          {locale === 'zh' ? (
                            <>
                              <CN className="h-4 w-6" />
                              <span>{t.navbar('中文')}</span>
                            </>
                          ) : (
                            <>
                              <US className="h-4 w-6" />
                              <span>{t.navbar('English')}</span>
                            </>
                          )}
                          {currentLocale === locale && (
                            <Badge
                              variant="outline"
                              className="ml-auto text-xs"
                            >
                              {t.navbar('当前')}
                            </Badge>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-2">
                <span>{getLanguageStatusText()}</span>
                <LanguageStatusIndicator />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Logon />
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'

export default Header

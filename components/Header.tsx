'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { CN, US } from 'country-flag-icons/react/3x2'
import {
  MoonIcon,
  SunIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons'
import navMenuData from '@/data/navMenuData'
import siteMetadata from '@/data/siteMetadata'
import { cn } from '@/utils/utils'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useRouter, getPathname } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { GlobeIcon } from '@radix-ui/react-icons'
import { useLocale } from 'next-intl'
import { Logon } from '../app/[locale]/Login/components/Logon'
import { useI18n } from '@/app/hooks/use-i18n'
import { routing } from '@/i18n/routing'

interface NavMenuItem {
  title: string
  href: string
  description?: string
  children?: NavMenuItem[]
}

const Header = () => {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const [mounted, setMounted] = useState(false)
  const t = useI18n()

  // 防止水和不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLocale: string) => {
    // 获取不包含语言前缀的路径
    // pathname格式可能是 '/zh/dashboard' 或 '/en/dashboard'
    const segments = pathname.split('/')
    // 移除语言代码段（第二个段）
    if (segments.length > 1 && routing.locales.includes(segments[1] as any)) {
      segments.splice(1, 1)
    }
    const pathnameWithoutLocale = segments.join('/') || '/'

    console.log('语言切换:', {
      原始路径: pathname,
      移除语言前缀后: pathnameWithoutLocale,
      新语言: newLocale,
      当前语言: currentLocale,
    })

    // 使用next-intl的路由器进行正确的语言切换
    router.replace(pathnameWithoutLocale, { locale: newLocale })
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="flex justify-between">
        {/* 左侧品牌区 - Crextio 风格 */}
        <div className="flex items-center gap-20">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-xl text-sm font-semibold shadow-sm">
            <Image
              className="rounded-full w-4 h-4"
              src={siteMetadata.avatar}
              alt={siteMetadata.title}
              width={16}
              height={16}
            />
            {siteMetadata.title}
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
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-gray-100"
                aria-label={t.navbar('切换语言')}
              >
                <GlobeIcon className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {siteMetadata.languages.map((locale) => (
                <DropdownMenuItem
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  className={cn(
                    'rounded-lg',
                    currentLocale === locale && 'font-bold bg-gray-100'
                  )}
                >
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
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-gray-100"
            onClick={toggleTheme}
            aria-label={t.navbar('切换主题')}
          >
            {mounted && theme === 'dark' ? (
              <SunIcon className="h-4 w-4 text-gray-600" />
            ) : (
              <MoonIcon className="h-4 w-4 text-gray-600" />
            )}
          </Button>
          <Logon />
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'

export default Header

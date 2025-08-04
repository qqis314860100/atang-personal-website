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
import { useRouter } from '@/i18n/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { GlobeIcon } from '@radix-ui/react-icons'
import { useLocale } from 'next-intl'
import { Logon } from './Logon'
import { useStableUser } from '@/lib/query-hook/use-auth'

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
  const { user } = useStableUser()

  // 防止水和不一致
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
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
                      <NavigationMenuLink
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
          {/* <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-gray-100"
            aria-label="搜索"
          >
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-gray-100"
            aria-label="通知"
          >
            <BellIcon className="h-4 w-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-gray-100"
            aria-label="设置"
          >
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
              ></path>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-xl hover:bg-gray-100"
                aria-label="切换语言"
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
                      <span>中文</span>
                    </>
                  ) : (
                    <>
                      <US className="h-4 w-6" />
                      <span>English</span>
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
            aria-label="切换主题"
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

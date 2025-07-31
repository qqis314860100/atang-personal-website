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
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import navMenuData from '@/data/navMenuData'
import siteMetadata from '@/data/siteMetadata'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useSidebar } from './ui/sidebar'
import { useTheme } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { GlobeIcon } from '@radix-ui/react-icons'
import { useLocale } from 'next-intl'
import { Logon } from './Logon'

interface NavMenuItem {
  title: string
  href: string
  description?: string
  children?: NavMenuItem[]
}

const Header = () => {
  // const { state } = useSidebar()

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const [mounted, setMounted] = useState(false)

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-all duration-100">
      <div className="flex h-16 items-center px-4">
        {/* 左侧Logo和站点名 */}
        <div className="flex items-center gap-2 mr-4">
          <Image
            className="rounded-full"
            src={siteMetadata.avatar}
            alt={siteMetadata.title}
            width={32}
            height={32}
          />
          {siteMetadata.title}
        </div>

        {/* 中间导航 */}
        <div className="hidden md:flex flex-1 justify-start">
          <NavigationMenu>
            <NavigationMenuList>
              {(navMenuData as NavMenuItem[]).map((parent) => {
                return (
                  <NavigationMenuItem key={parent.href}>
                    <NavigationMenuLink
                      href={parent.href}
                      className={navigationMenuTriggerStyle()}
                    >
                      {parent.title}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* 右侧功能区 */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex relative">
            <Input
              type="search"
              placeholder="Search documentation..."
              className="h-9 md:w-[200px] lg:w-[250px]"
            />
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground md:flex">
              ⌘K
            </kbd>
          </div>

          {/* 国际化切换 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <GlobeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {siteMetadata.languages.map((locale) => (
                <DropdownMenuItem
                  key={locale}
                  onClick={() => handleLanguageChange(locale)}
                  className={cn(currentLocale === locale && 'font-bold')}
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

          {/* 主题切换按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
          >
            {mounted && theme === 'dark' ? (
              <SunIcon className="h-4 w-4" />
            ) : (
              <MoonIcon className="h-4 w-4" />
            )}
          </Button>

          {/* 注册/登录 */}
          <Logon />
        </div>
      </div>
    </header>
  )
}

Header.displayName = 'Header'

const ListItem = React.forwardRef<
  React.ComponentRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <NavigationMenuLink asChild>
      <Link
        ref={ref}
        href={props.href || '#'}
        className={cn(
          'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  )
})

export default Header

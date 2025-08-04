'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { useLocale } from 'next-intl'
import { cn } from '@/utils/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const locale = useLocale()

  return (
    <nav
      className={cn(
        'flex items-center space-x-2 text-sm font-medium text-gray-600 h-12 px-4 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-[64px] z-40',
        className
      )}
    >
      <Link
        href={`/${locale}`}
        className="flex items-center hover:text-blue-600 transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">首页</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href && !item.current ? (
            <Link
              href={item.href}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                item.current ? 'text-gray-900 font-semibold' : 'text-gray-600'
              )}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export function getBlogBreadcrumbs(
  locale: string,
  pathname: string,
  postTitle?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    {
      label: '首页',
      href: `/${locale}`,
    },
    {
      label: '博客',
      href: `/${locale}/blog`,
    },
  ]

  // 根据路径添加对应的面包屑项
  if (pathname.includes('/create')) {
    items.push({
      label: '创建文章',
      href: `/blog/create`,
    })
  } else if (pathname.includes('/edit/')) {
    items.push({
      label: '编辑文章',
      href: pathname,
    })
    if (postTitle) {
      items.push({
        label: postTitle,
        href: pathname,
      })
    }
  } else if (pathname.includes('/category')) {
    items.push({
      label: '分类管理',
      href: `/${locale}/blog/category`,
    })
  } else if (pathname.match(/\/blog\/[^/]+$/)) {
    // 文章详情页
    if (postTitle) {
      items.push({
        label: postTitle,
        href: pathname,
      })
    }
  }

  return items
}

'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { createPrefetchManager } from '@/lib/query-hook/query-prefetch'

interface RoutePrefetchProps {
  children: React.ReactNode
}

export function RoutePrefetch({ children }: RoutePrefetchProps) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const prefetchManagerRef = useRef<any>(null)
  const lastPathnameRef = useRef<string>('')

  useEffect(() => {
    // 初始化预取管理器
    if (!prefetchManagerRef.current) {
      prefetchManagerRef.current = createPrefetchManager(queryClient)
    }

    // 路由变化时预取数据
    if (pathname !== lastPathnameRef.current) {
      console.log('🔄 路由变化，开始预取数据:', pathname)

      // 延迟预取，避免阻塞当前页面渲染
      setTimeout(() => {
        prefetchManagerRef.current?.prefetchByRoute(pathname)
      }, 100)

      lastPathnameRef.current = pathname
    }
  }, [pathname, queryClient])

  // 定期清理过期缓存
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      prefetchManagerRef.current?.cleanupExpiredCache()
    }, 5 * 60 * 1000) // 每5分钟清理一次

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [])

  // 预取常用路由
  useEffect(() => {
    const prefetchCommonRoutes = async () => {
      if (!prefetchManagerRef.current) return

      // 预取用户数据（最常用）
      await prefetchManagerRef.current.prefetchUserData()

      // 延迟预取其他数据
      setTimeout(async () => {
        await prefetchManagerRef.current.prefetchBlogData()
      }, 2000)
    }

    prefetchCommonRoutes()
  }, [])

  return <>{children}</>
}

/**
 * 路由预取 Hook
 */
export function useRoutePrefetch() {
  const queryClient = useQueryClient()
  const prefetchManagerRef = useRef<any>(null)

  useEffect(() => {
    if (!prefetchManagerRef.current) {
      prefetchManagerRef.current = createPrefetchManager(queryClient)
    }
  }, [queryClient])

  const prefetchRoute = async (pathname: string) => {
    if (prefetchManagerRef.current) {
      await prefetchManagerRef.current.prefetchByRoute(pathname)
    }
  }

  const getCacheStats = () => {
    return prefetchManagerRef.current?.getCacheStats()
  }

  return {
    prefetchRoute,
    getCacheStats,
  }
}

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analyticsTracker } from '@/lib/analytics/tracker'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // 初始化埋点系统（仅在客户端）
    if (typeof window !== 'undefined') {
      analyticsTracker.init()
      console.log('🎯 埋点系统初始化完成')
    }
  }, [])

  useEffect(() => {
    // 监听路由变化，自动埋点页面访问
    if (typeof window !== 'undefined' && pathname) {
      // 埋点页面访问 - 使用完整路径
      analyticsTracker.trackPageView(pathname)

      // 埋点性能指标
      const loadTime = performance.now()
      analyticsTracker.trackPerformance('page_load_time', loadTime)

      console.log(`📊 页面埋点: ${pathname}`)
    }
  }, [pathname])

  return <>{children}</>
}

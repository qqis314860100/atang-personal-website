'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '../core'

/**
 * 埋点系统的 React Hook
 *
 * 提供自动化的埋点功能，包括：
 * - 页面访问追踪（自动记录页面加载时间、滚动深度）
 * - 用户行为追踪（点击、表单提交等）
 * - 性能监控（页面加载时间、资源加载时间）
 * - 错误追踪（JavaScript 错误、API 错误）
 *
 * 使用方式：
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent, trackError } = useAnalytics()
 *
 *   const handleClick = () => {
 *     trackEvent('button_click', { buttonId: 'submit' })
 *   }
 *
 *   return <button onClick={handleClick}>提交</button>
 * }
 * ```
 */
export function useAnalytics() {
  const pathname = usePathname()
  const pageStartTime = useRef<number>(Date.now())
  const scrollDepth = useRef<number>(0)
  const maxScrollDepth = useRef<number>(0)

  // 页面访问埋点
  useEffect(() => {
    const startTime = Date.now()
    pageStartTime.current = startTime

    // 页面加载完成后的埋点
    const handlePageLoad = () => {
      const loadTime = Date.now() - startTime
      analytics.trackPerformance('page_load_time', loadTime, 'ms', {
        pagePath: pathname,
      })
    }

    // 页面卸载时的埋点
    const handlePageUnload = () => {
      const viewDuration = Date.now() - pageStartTime.current
      analytics.trackPageView(
        pathname,
        document.referrer,
        viewDuration,
        maxScrollDepth.current
      )
    }

    // 滚动深度监听
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const currentScrollDepth = Math.round((scrollTop / scrollHeight) * 100)

      scrollDepth.current = currentScrollDepth
      if (currentScrollDepth > maxScrollDepth.current) {
        maxScrollDepth.current = currentScrollDepth
      }
    }

    // 添加事件监听器
    window.addEventListener('load', handlePageLoad)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('beforeunload', handlePageUnload)

    // 清理函数
    return () => {
      window.removeEventListener('load', handlePageLoad)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handlePageUnload)

      // 页面切换时的埋点
      const viewDuration = Date.now() - pageStartTime.current
      analytics.trackPageView(
        pathname,
        document.referrer,
        viewDuration,
        maxScrollDepth.current
      )
    }
  }, [pathname])

  // 便捷的埋点函数
  const trackEvent = useCallback((eventType: string, data?: any) => {
    analytics.trackUserAction(eventType, undefined, true, undefined, undefined)
  }, [])

  const trackError = useCallback((error: Error, context?: any) => {
    analytics.trackError('client_error', error.message, error.stack, context)
  }, [])

  const trackPerformance = useCallback(
    (metric: string, value: number, context?: any) => {
      analytics.trackPerformance(metric, value, 'ms', context)
    },
    []
  )

  const trackBusinessEvent = useCallback(
    (businessType: string, businessId: string, data: Record<string, any>) => {
      analytics.trackBusinessEvent(businessType, businessId, data)
    },
    []
  )

  return {
    trackEvent,
    trackError,
    trackPerformance,
    trackBusinessEvent,
    analytics,
  }
}

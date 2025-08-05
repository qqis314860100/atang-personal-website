'use client'

import { useEffect, useState } from 'react'

interface PerformanceMonitorProps {
  enabled?: boolean
}

export function PerformanceMonitor({
  enabled = false,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<any>({})
  const [longTasks, setLongTasks] = useState<any[]>([])
  const [renderTimes, setRenderTimes] = useState<any[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [webVitals, setWebVitals] = useState<any>({})

  useEffect(() => {
    if (!enabled) return

    console.log('🔍 性能监控已启动')

    // 手动计算初始页面加载性能
    const calculateInitialMetrics = () => {
      if (typeof window !== 'undefined' && performance) {
        // 页面导航相关性能数据（如页面加载的各阶段耗时）
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming

        const paint = performance.getEntriesByType(
          'paint'
        )[0] as PerformancePaintTiming

        const longTask = performance.getEntriesByType('longtask')[0]

        const resource = performance.getEntriesByType(
          'resource'
        )[0] as PerformanceResourceTiming

        console.log('paint', paint)
        console.log('longTask', longTask)
        console.log('resource', resource)

        if (navigation) {
          const newMetrics = {
            // DNS 查询耗时 = 域名查询结束时间 - 域名查询开始时间
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,

            // TCP 连接耗时 = TCP 连接结束时间 - TCP 连接开始时间
            tcp: navigation.connectEnd - navigation.connectStart,

            // 首字节时间（TTFB）= 首字节接收时间 - 请求发起时间
            ttfb: navigation.responseStart - navigation.requestStart,

            // DOM 加载耗时 = DOMContentLoaded 事件结束时间 - DOMContentLoaded 事件开始时间
            domLoad:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,

            // 窗口加载耗时 = load 事件结束时间 - load 事件开始时间
            windowLoad: navigation.loadEventEnd - navigation.loadEventStart,

            // 总耗时 = load 事件结束时间 - fetch 开始时间（即整个页面加载的总时间）
            total: navigation.loadEventEnd - navigation.fetchStart,
          }
          console.log('📊 初始页面加载性能:', newMetrics)
          setMetrics(newMetrics)
        } else {
          // 如果没有 navigation 数据，使用 performance.timing (兼容性)
          const timing = (performance as any).timing
          if (timing) {
            const newMetrics = {
              dns: timing.domainLookupEnd - timing.domainLookupStart,
              tcp: timing.connectEnd - timing.connectStart,
              ttfb: timing.responseStart - timing.requestStart,
              domLoad:
                timing.domContentLoadedEventEnd -
                timing.domContentLoadedEventStart,
              windowLoad: timing.loadEventEnd - timing.loadEventStart,
              total: timing.loadEventEnd - timing.fetchStart,
            }

            console.log('📊 兼容性页面加载性能:', newMetrics)
            setMetrics(newMetrics)
          }
        }
      }
    }

    // 监控 Web Vitals
    const observeWebVitals = () => {
      // FCP (First Contentful Paint)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setWebVitals((prev: any) => ({ ...prev, fcp: entry.startTime }))
            console.log('🎨 FCP:', entry.startTime.toFixed(0) + 'ms')
          }
        })
      })

      // LCP (Largest Contentful Paint)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          setWebVitals((prev: any) => ({ ...prev, lcp: lastEntry.startTime }))
          console.log('📏 LCP:', lastEntry.startTime.toFixed(0) + 'ms')
        }
      })

      // CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        setWebVitals((prev: any) => ({ ...prev, cls: clsValue }))
        console.log('📐 CLS:', clsValue.toFixed(3))
      })

      try {
        fcpObserver.observe({ entryTypes: ['paint'] })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        console.log('🔍 Web Vitals 监控已启动')
      } catch (error) {
        console.warn('⚠️ Web Vitals 监控启动失败:', error)
      }
    }

    // 立即计算一次
    calculateInitialMetrics()
    observeWebVitals()

    // 监控页面加载性能
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          const newMetrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            ttfb: navEntry.responseStart - navEntry.requestStart,
            domLoad:
              navEntry.domContentLoadedEventEnd -
              navEntry.domContentLoadedEventStart,
            windowLoad: navEntry.loadEventEnd - navEntry.loadEventStart,
            total: navEntry.loadEventEnd - navEntry.fetchStart,
          }

          console.log('📊 页面加载性能更新:', newMetrics)
          setMetrics(newMetrics)
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['navigation'] })
    } catch (error) {
      console.warn('⚠️ PerformanceObserver navigation 不支持:', error)
    }

    // 监控长任务
    const longTaskObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.duration > 50) {
          const taskInfo = {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
          }

          console.warn('⚠️ 检测到长任务:', taskInfo)
          setLongTasks((prev: any) => [...prev.slice(-4), taskInfo]) // 保留最近5个
        }
      })
    })

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('⚠️ PerformanceObserver longtask 不支持:', error)
    }

    // 监控路由变化和渲染性能
    let currentPath = window.location.pathname
    let renderStartTime = performance.now()

    const checkRouteChange = () => {
      if (window.location.pathname !== currentPath) {
        const renderDuration = performance.now() - renderStartTime

        if (renderDuration > 16) {
          const renderInfo = {
            duration: renderDuration,
            timestamp: Date.now(),
            url: currentPath,
          }
          console.warn('⚠️ 渲染时间过长:', renderInfo)
          setRenderTimes((prev: any) => [...prev.slice(-4), renderInfo])
        }

        currentPath = window.location.pathname
        renderStartTime = performance.now()
        console.log('🔄 路由变化:', currentPath)
      }
    }

    const routeObserver = setInterval(checkRouteChange, 100)

    // 监控内存使用
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
        }
        console.log('💾 内存使用:', memoryInfo)
      }
    }

    const memoryInterval = setInterval(checkMemory, 10000) // 每10秒检查一次

    // 监听页面可见性变化，重新计算性能指标
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(calculateInitialMetrics, 100)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 监听页面加载完成
    const handleLoad = () => {
      setTimeout(calculateInitialMetrics, 100)
    }

    window.addEventListener('load', handleLoad)

    setIsInitialized(true)

    return () => {
      observer.disconnect()
      longTaskObserver.disconnect()
      clearInterval(routeObserver)
      clearInterval(memoryInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('load', handleLoad)
    }
  }, [enabled])

  // 如果没有数据，显示默认值或提示
  const hasMetrics = Object.values(metrics).some(
    (value) => value && typeof value === 'number' && value > 0
  )

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50 max-w-96">
      <h3 className="font-bold mb-2 text-green-400">性能监控</h3>

      {/* 页面加载指标 */}
      <div className="mb-3">
        <h4 className="font-semibold text-blue-400 mb-1">页面加载</h4>
        <div className="space-y-1 text-xs">
          {hasMetrics ? (
            <>
              <div>
                DNS:{' '}
                <span
                  className={
                    metrics.dns > 100 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {metrics.dns?.toFixed(0)}ms
                </span>
              </div>
              <div>
                TCP:{' '}
                <span
                  className={
                    metrics.tcp > 100 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {metrics.tcp?.toFixed(0)}ms
                </span>
              </div>
              <div>
                TTFB:{' '}
                <span
                  className={
                    metrics.ttfb > 200 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {metrics.ttfb?.toFixed(0)}ms
                </span>
              </div>
              <div>
                DOM:{' '}
                <span
                  className={
                    metrics.domLoad > 100 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {metrics.domLoad?.toFixed(0)}ms
                </span>
              </div>
              <div>
                总时间:{' '}
                <span
                  className={
                    metrics.total > 1000 ? 'text-red-400' : 'text-green-400'
                  }
                >
                  {metrics.total?.toFixed(0)}ms
                </span>
              </div>
            </>
          ) : (
            <div className="text-yellow-400">
              {isInitialized ? '等待页面加载数据...' : '初始化中...'}
            </div>
          )}
        </div>
      </div>

      {/* Web Vitals 指标 */}
      {Object.keys(webVitals).length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold text-purple-400 mb-1">Web Vitals</h4>
          <div className="space-y-1 text-xs">
            {webVitals.fcp && (
              <div>
                FCP:{' '}
                <span
                  className={
                    webVitals.fcp > 1800
                      ? 'text-red-400'
                      : webVitals.fcp > 1000
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }
                >
                  {webVitals.fcp.toFixed(0)}ms
                </span>
              </div>
            )}
            {webVitals.lcp && (
              <div>
                LCP:{' '}
                <span
                  className={
                    webVitals.lcp > 2500
                      ? 'text-red-400'
                      : webVitals.lcp > 1000
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }
                >
                  {webVitals.lcp.toFixed(0)}ms
                </span>
              </div>
            )}
            {webVitals.cls && (
              <div>
                CLS:{' '}
                <span
                  className={
                    webVitals.cls > 0.25
                      ? 'text-red-400'
                      : webVitals.cls > 0.1
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }
                >
                  {webVitals.cls.toFixed(3)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 长任务警告 */}
      {longTasks.length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold text-red-400 mb-1">长任务警告</h4>
          <div className="space-y-1 text-xs">
            {longTasks.map((task, i) => (
              <div key={i} className="text-red-300">
                {task.name}: {task.duration.toFixed(0)}ms
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 渲染时间警告 */}
      {renderTimes.length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold text-yellow-400 mb-1">渲染时间</h4>
          <div className="space-y-1 text-xs">
            {renderTimes.map((render, i) => (
              <div key={i} className="text-yellow-300">
                {render.url}: {render.duration.toFixed(0)}ms
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 优化建议 */}
      <div className="text-xs text-gray-300">
        <div>💡 建议: 优化长任务和渲染时间</div>
        {!hasMetrics && (
          <div className="text-yellow-400 mt-1">
            提示: 刷新页面可获取完整性能数据
          </div>
        )}
        {metrics.ttfb > 200 && (
          <div className="text-red-400 mt-1">
            ⚠️ TTFB 过高，建议优化服务器响应
          </div>
        )}
      </div>
    </div>
  )
}

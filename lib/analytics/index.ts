// 统一的分析工具入口
import { initWebVitals, WebVitalsCollector } from './web-vitals-collector'
import { initPerformanceMonitoring, PerformanceCollector } from './performance'

// 全局分析管理器
class AnalyticsManager {
  private webVitalsCollector?: WebVitalsCollector | null
  private performanceCollector?: PerformanceCollector
  private sessionId: string
  private userId?: string

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId
    this.userId = userId
  }

  // 初始化所有分析工具
  init(
    options: {
      enableWebVitals?: boolean
      enablePerformance?: boolean
      debug?: boolean
      reportAllChanges?: boolean
    } = {}
  ) {
    const {
      enableWebVitals = true,
      enablePerformance = false, // 默认只启用Web Vitals
      debug = false,
      reportAllChanges = false,
    } = options

    console.log('🔍 初始化分析工具...', {
      sessionId: this.sessionId,
      webVitals: enableWebVitals,
      performance: enablePerformance,
      debug,
    })

    // 初始化Web Vitals收集器（推荐）
    if (enableWebVitals) {
      this.webVitalsCollector = initWebVitals({
        sessionId: this.sessionId,
        userId: this.userId,
        debug,
        reportAllChanges,
      })
    }

    // 初始化原生性能收集器（可选）
    if (enablePerformance) {
      this.performanceCollector = initPerformanceMonitoring(
        this.sessionId,
        this.userId
      )
    }

    // 页面路由变化时重新初始化
    this.setupRouteChangeHandling()
  }

  // 处理页面路由变化
  private setupRouteChangeHandling() {
    if (typeof window === 'undefined') return

    // 监听History API变化（SPA路由）
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      window.dispatchEvent(new Event('routechange'))
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      window.dispatchEvent(new Event('routechange'))
    }

    // 监听路由变化
    window.addEventListener('routechange', () => {
      console.log('🔄 页面路由变化，重新初始化分析工具')
      this.reinit()
    })

    // 监听popstate（浏览器前进后退）
    window.addEventListener('popstate', () => {
      console.log('🔄 浏览器导航，重新初始化分析工具')
      this.reinit()
    })
  }

  // 重新初始化（用于SPA路由变化）
  private reinit() {
    // 刷新Web Vitals收集器（如果启用）
    if (this.webVitalsCollector) {
      this.webVitalsCollector.flush() // 发送当前页面数据

      // 为新页面重新初始化
      setTimeout(() => {
        this.webVitalsCollector = initWebVitals({
          sessionId: this.sessionId,
          userId: this.userId,
          debug: true,
        })
      }, 100)
    }
  }

  // 手动发送当前数据
  flush() {
    this.webVitalsCollector?.flush()
    this.performanceCollector?.flush()
  }

  // 获取当前性能数据
  getPerformanceData() {
    return {
      webVitals: this.webVitalsCollector?.getData(),
      performance: this.performanceCollector,
      score: this.webVitalsCollector?.getPerformanceScore(),
      grade: this.webVitalsCollector?.getPerformanceGrade(),
    }
  }

  // 获取性能建议
  getPerformanceInsights() {
    if (!this.webVitalsCollector) return null

    const data = this.webVitalsCollector.getData()
    const insights = []

    // LCP优化建议
    if (data.lcp && data.lcp > 4000) {
      insights.push({
        metric: 'LCP',
        status: 'critical',
        value: data.lcp,
        recommendation:
          '严重问题：优化最大内容绘制时间。建议压缩图片、使用CDN、优化服务器响应时间。',
      })
    } else if (data.lcp && data.lcp > 2500) {
      insights.push({
        metric: 'LCP',
        status: 'warning',
        value: data.lcp,
        recommendation:
          '需要改进：最大内容绘制时间偏慢。建议预加载关键资源、优化图片加载。',
      })
    }

    // CLS优化建议
    if (data.cls && data.cls > 0.25) {
      insights.push({
        metric: 'CLS',
        status: 'critical',
        value: data.cls,
        recommendation:
          '严重问题：页面布局不稳定。建议为图片和视频设置明确尺寸、避免动态插入内容。',
      })
    } else if (data.cls && data.cls > 0.1) {
      insights.push({
        metric: 'CLS',
        status: 'warning',
        value: data.cls,
        recommendation:
          '需要改进：页面有轻微布局偏移。建议预留空间给动态内容。',
      })
    }

    // FCP优化建议
    if (data.fcp && data.fcp > 3000) {
      insights.push({
        metric: 'FCP',
        status: 'critical',
        value: data.fcp,
        recommendation:
          '严重问题：首次内容绘制时间过长。建议内联关键CSS、移除阻塞渲染的资源。',
      })
    } else if (data.fcp && data.fcp > 1800) {
      insights.push({
        metric: 'FCP',
        status: 'warning',
        value: data.fcp,
        recommendation:
          '需要改进：首次内容绘制时间偏慢。建议优化关键渲染路径。',
      })
    }

    // 交互性建议
    const interactionDelay = data.inp || data.fid
    if (interactionDelay && interactionDelay > 500) {
      insights.push({
        metric: data.inp ? 'INP' : 'FID',
        status: 'critical',
        value: interactionDelay,
        recommendation:
          '严重问题：页面交互响应慢。建议减少主线程工作、分解长任务、优化JavaScript执行。',
      })
    } else if (interactionDelay && interactionDelay > (data.inp ? 200 : 100)) {
      insights.push({
        metric: data.inp ? 'INP' : 'FID',
        status: 'warning',
        value: interactionDelay,
        recommendation:
          '需要改进：页面交互有延迟。建议优化事件处理器、减少JavaScript执行时间。',
      })
    }

    return insights
  }
}

// 全局实例
let globalAnalytics: AnalyticsManager | null = null

// 初始化全局分析工具
export function initAnalytics(
  sessionId: string,
  userId?: string,
  options?: {
    enableWebVitals?: boolean
    enablePerformance?: boolean
    debug?: boolean
    reportAllChanges?: boolean
  }
) {
  if (typeof window === 'undefined') return null

  globalAnalytics = new AnalyticsManager(sessionId, userId)
  globalAnalytics.init(options)

  // 暴露到全局对象，方便调试
  if (options?.debug) {
    ;(window as any).__analytics = globalAnalytics
  }

  return globalAnalytics
}

// 获取全局分析实例
export function getAnalytics(): AnalyticsManager | null {
  return globalAnalytics
}

// 性能监控 Hook（用于React组件）
export function usePerformanceMonitoring(sessionId: string, userId?: string) {
  if (typeof window === 'undefined') return null

  // 只在客户端初始化一次
  if (!globalAnalytics) {
    return initAnalytics(sessionId, userId, {
      debug: process.env.NODE_ENV === 'development',
    })
  }

  return globalAnalytics
}

// 导出所有类型和工具
export * from './web-vitals-collector'
export * from './performance'
export { AnalyticsManager }

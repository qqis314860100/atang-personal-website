// Web Performance Metrics Collection
// 基于Core Web Vitals和其他重要性能指标

// 类型定义
interface PerformanceMetric {
  name: string
  value: number
  delta: number
  entries: PerformanceEntry[]
}

type MetricCallback = (metric: PerformanceMetric) => void

interface PerformanceData {
  page: string
  load_time: number
  dom_content_loaded: number
  time_to_first_byte?: number
  first_paint?: number
  first_contentful_paint?: number
  largest_contentful_paint?: number
  first_input_delay?: number
  interaction_to_next_paint?: number
  total_blocking_time?: number
  cumulative_layout_shift?: number
  session_id: string
  user_id?: string
}

class PerformanceCollector {
  private data: Partial<PerformanceData> = {}
  private sessionId: string
  private userId?: string

  constructor(sessionId: string, userId?: string) {
    this.sessionId = sessionId
    this.userId = userId
    this.data.session_id = sessionId
    this.data.user_id = userId
    this.data.page = window.location.pathname
  }

  // 初始化性能监控
  init() {
    this.collectNavigationTimings()
    this.collectWebVitals()
    this.collectPaintTimings()
  }

  // 收集导航时间
  private collectNavigationTimings() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming

      if (navigation) {
        // 基础时间指标
        this.data.load_time = navigation.loadEventEnd - navigation.fetchStart
        this.data.dom_content_loaded =
          navigation.domContentLoadedEventEnd - navigation.fetchStart
        this.data.time_to_first_byte =
          navigation.responseStart - navigation.fetchStart

        // 总阻塞时间 (TBT) - 近似计算
        const longTaskEntries = performance.getEntriesByType(
          'longtask'
        ) as PerformanceEntry[]
        this.data.total_blocking_time = longTaskEntries.reduce(
          (total, task) => {
            const blockingTime = Math.max(0, task.duration - 50) // 超过50ms的部分
            return total + blockingTime
          },
          0
        )
      }
    }
  }

  // 收集绘制时间
  private collectPaintTimings() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const paintEntries = performance.getEntriesByType('paint')

      paintEntries.forEach((entry) => {
        if (entry.name === 'first-paint') {
          this.data.first_paint = entry.startTime
        }
      })
    }
  }

  // 收集Core Web Vitals (使用原生API)
  private collectWebVitals() {
    if (typeof window === 'undefined') return

    // 使用PerformanceObserver收集指标
    try {
      // First Contentful Paint (FCP)
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.data.first_contentful_paint = entry.startTime
              this.sendMetrics()
            }
          }
        })
        observer.observe({ entryTypes: ['paint'] })
      }

      // Layout Shift (CLS) - 简化版本
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value
            }
          }
          this.data.cumulative_layout_shift = clsValue
          this.sendMetrics()
        })
        observer.observe({ entryTypes: ['layout-shift'] })
      }

      // First Input Delay (FID)
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.data.first_input_delay =
              (entry as any).processingStart - entry.startTime
            this.sendMetrics()
          }
        })
        observer.observe({ entryTypes: ['first-input'] })
      }

      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.data.largest_contentful_paint = lastEntry.startTime
          this.sendMetrics()
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      }
    } catch (error) {
      console.warn('性能指标收集失败:', error)
    }
  }

  // 发送性能数据到后端
  private async sendMetrics() {
    // 确保有基础数据再发送
    if (!this.data.load_time || !this.data.dom_content_loaded) {
      return
    }

    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.data),
      })
    } catch (error) {
      console.error('发送性能数据失败:', error)
    }
  }

  // 手动触发数据发送（页面卸载时）
  public flush() {
    this.sendMetrics()
  }
}

// 性能指标分析工具
export class PerformanceAnalyzer {
  // Web Vitals评分标准
  static getPerformanceScore(metrics: Partial<PerformanceData>) {
    let score = 0
    let count = 0

    // LCP评分 (2.5s好, 4s需要改进)
    if (metrics.largest_contentful_paint !== undefined) {
      score +=
        metrics.largest_contentful_paint <= 2500
          ? 100
          : metrics.largest_contentful_paint <= 4000
          ? 50
          : 0
      count++
    }

    // FID评分 (100ms好, 300ms需要改进)
    if (metrics.first_input_delay !== undefined) {
      score +=
        metrics.first_input_delay <= 100
          ? 100
          : metrics.first_input_delay <= 300
          ? 50
          : 0
      count++
    }

    // CLS评分 (0.1好, 0.25需要改进)
    if (metrics.cumulative_layout_shift !== undefined) {
      score +=
        metrics.cumulative_layout_shift <= 0.1
          ? 100
          : metrics.cumulative_layout_shift <= 0.25
          ? 50
          : 0
      count++
    }

    // FCP评分 (1.8s好, 3s需要改进)
    if (metrics.first_contentful_paint !== undefined) {
      score +=
        metrics.first_contentful_paint <= 1800
          ? 100
          : metrics.first_contentful_paint <= 3000
          ? 50
          : 0
      count++
    }

    return count > 0 ? score / count : 0
  }

  // 获取性能等级
  static getPerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 40) return 'D'
    return 'F'
  }
}

// 全局性能监控初始化
export function initPerformanceMonitoring(sessionId: string, userId?: string) {
  if (typeof window === 'undefined') return

  const collector = new PerformanceCollector(sessionId, userId)

  // 页面加载完成后开始收集
  if (document.readyState === 'complete') {
    collector.init()
  } else {
    window.addEventListener('load', () => {
      collector.init()
    })
  }

  // 页面卸载时发送剩余数据
  window.addEventListener('beforeunload', () => {
    collector.flush()
  })

  return collector
}

export { PerformanceCollector }
export type { PerformanceData }

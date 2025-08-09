// Web Vitals Collector - 使用官方web-vitals库
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'

interface WebVitalsData {
  page: string
  session_id: string
  user_id?: string

  // Core Web Vitals
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  cls?: number // Cumulative Layout Shift
  fid?: number // First Input Delay (legacy)
  inp?: number // Interaction to Next Paint (new)
  ttfb?: number // Time to First Byte

  // Additional metrics
  load_time?: number
  dom_content_loaded?: number
  first_paint?: number
  total_blocking_time?: number

  timestamp: Date
}

interface WebVitalsConfig {
  sessionId: string
  userId?: string
  reportAllChanges?: boolean
  debug?: boolean
}

class WebVitalsCollector {
  private data: Partial<WebVitalsData> = {}
  private config: WebVitalsConfig
  private hasReported = new Set<string>()

  constructor(config: WebVitalsConfig) {
    this.config = config
    this.data = {
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      session_id: config.sessionId,
      user_id: config.userId,
      timestamp: new Date(),
    }
  }

  // 初始化所有Web Vitals监控
  init() {
    if (typeof window === 'undefined') return

    this.log('🚀 初始化Web Vitals监控...')

    // 收集基础性能指标
    this.collectBasicMetrics()

    // 收集Core Web Vitals
    this.collectCoreWebVitals()

    // 页面卸载时发送最终报告
    this.setupBeforeUnload()
  }

  // 收集基础性能指标
  private collectBasicMetrics() {
    if (!('performance' in window)) return

    // 等待页面完全加载
    if (document.readyState === 'complete') {
      this.getNavigationTimings()
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.getNavigationTimings(), 0)
      })
    }

    // 收集First Paint
    this.getFirstPaint()
  }

  // 获取导航时间
  private getNavigationTimings() {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming

    if (navigation) {
      this.data.load_time = Math.round(
        navigation.loadEventEnd - navigation.fetchStart
      )
      this.data.dom_content_loaded = Math.round(
        navigation.domContentLoadedEventEnd - navigation.fetchStart
      )

      this.log('📊 基础指标收集完成', {
        loadTime: this.data.load_time,
        domContentLoaded: this.data.dom_content_loaded,
      })

      this.reportMetrics('basic')
    }
  }

  // 获取First Paint
  private getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const fpEntry = paintEntries.find((entry) => entry.name === 'first-paint')

    if (fpEntry) {
      this.data.first_paint = Math.round(fpEntry.startTime)
      this.log('🎨 First Paint:', this.data.first_paint)
    }
  }

  // 收集Core Web Vitals
  private collectCoreWebVitals() {
    // First Contentful Paint (FCP)
    onFCP(
      (metric) => {
        this.data.fcp = Math.round(metric.value)
        this.log(
          '🎨 FCP:',
          this.data.fcp,
          this.getVitalStatus('fcp', this.data.fcp)
        )
        this.reportMetrics('fcp')
      },
      { reportAllChanges: this.config.reportAllChanges }
    )

    // Largest Contentful Paint (LCP)
    onLCP(
      (metric) => {
        this.data.lcp = Math.round(metric.value)
        this.log(
          '🖼️ LCP:',
          this.data.lcp,
          this.getVitalStatus('lcp', this.data.lcp)
        )
        this.reportMetrics('lcp')
      },
      { reportAllChanges: this.config.reportAllChanges }
    )

    // Cumulative Layout Shift (CLS)
    onCLS(
      (metric) => {
        this.data.cls = Math.round(metric.value * 1000) / 1000 // 保留3位小数
        this.log(
          '📐 CLS:',
          this.data.cls,
          this.getVitalStatus('cls', this.data.cls)
        )
        this.reportMetrics('cls')
      },
      { reportAllChanges: this.config.reportAllChanges }
    )

    // Interaction to Next Paint (INP) - New
    onINP(
      (metric) => {
        this.data.inp = Math.round(metric.value)
        this.log(
          '🔄 INP:',
          this.data.inp,
          this.getVitalStatus('inp', this.data.inp)
        )
        this.reportMetrics('inp')
      },
      { reportAllChanges: this.config.reportAllChanges }
    )

    // Time to First Byte (TTFB)
    onTTFB(
      (metric) => {
        this.data.ttfb = Math.round(metric.value)
        this.log(
          '🌐 TTFB:',
          this.data.ttfb,
          this.getVitalStatus('ttfb', this.data.ttfb)
        )
        this.reportMetrics('ttfb')
      },
      { reportAllChanges: this.config.reportAllChanges }
    )
  }

  // 获取指标状态（好/需要改进/差）
  private getVitalStatus(metric: string, value: number): string {
    const thresholds = {
      fcp: { good: 1800, needs: 3000 },
      lcp: { good: 2500, needs: 4000 },
      cls: { good: 0.1, needs: 0.25 },
      fid: { good: 100, needs: 300 },
      inp: { good: 200, needs: 500 },
      ttfb: { good: 800, needs: 1800 },
    }

    const threshold = thresholds[metric as keyof typeof thresholds]
    if (!threshold) return '❓'

    if (value <= threshold.good) return '✅ 好'
    if (value <= threshold.needs) return '⚠️ 需要改进'
    return '❌ 差'
  }

  // 计算综合性能得分
  getPerformanceScore(): number {
    let score = 0
    let count = 0

    // LCP权重25%
    if (this.data.lcp !== undefined) {
      score += this.data.lcp <= 2500 ? 25 : this.data.lcp <= 4000 ? 15 : 0
      count++
    }

    // FID/INP权重25%
    const interactionMetric = this.data.inp || this.data.fid
    if (interactionMetric !== undefined) {
      const threshold = this.data.inp ? 200 : 100
      const needsThreshold = this.data.inp ? 500 : 300
      score +=
        interactionMetric <= threshold
          ? 25
          : interactionMetric <= needsThreshold
          ? 15
          : 0
      count++
    }

    // CLS权重25%
    if (this.data.cls !== undefined) {
      score += this.data.cls <= 0.1 ? 25 : this.data.cls <= 0.25 ? 15 : 0
      count++
    }

    // FCP权重25%
    if (this.data.fcp !== undefined) {
      score += this.data.fcp <= 1800 ? 25 : this.data.fcp <= 3000 ? 15 : 0
      count++
    }

    return count > 0 ? Math.round(score) : 0
  }

  // 获取性能等级
  getPerformanceGrade(): { grade: string; color: string; description: string } {
    const score = this.getPerformanceScore()

    if (score >= 90)
      return { grade: 'A', color: '#10B981', description: '优秀' }
    if (score >= 75)
      return { grade: 'B', color: '#3B82F6', description: '良好' }
    if (score >= 50)
      return { grade: 'C', color: '#F59E0B', description: '一般' }
    if (score >= 25)
      return { grade: 'D', color: '#EF4444', description: '需要改进' }
    return { grade: 'F', color: '#DC2626', description: '差' }
  }

  // 报告指标
  private async reportMetrics(metricType: string) {
    // 避免重复发送相同的指标（除非配置了reportAllChanges）
    if (!this.config.reportAllChanges && this.hasReported.has(metricType)) {
      return
    }

    this.hasReported.add(metricType)

    try {
      await fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.data,
          metric_type: metricType,
          performance_score: this.getPerformanceScore(),
          performance_grade: this.getPerformanceGrade().grade,
        }),
        keepalive: true, // 确保页面卸载时也能发送
      })

      this.log(`📤 ${metricType} 指标已发送`)
    } catch (error) {
      console.warn('Web Vitals数据发送失败:', error)
    }
  }

  // 页面卸载时的处理
  private setupBeforeUnload() {
    const sendFinalReport = () => {
      this.log('📋 发送最终性能报告')

      // 使用sendBeacon确保数据能够发送
      if ('sendBeacon' in navigator) {
        const finalData = {
          ...this.data,
          metric_type: 'final',
          performance_score: this.getPerformanceScore(),
          performance_grade: this.getPerformanceGrade().grade,
        }

        navigator.sendBeacon(
          '/api/analytics/web-vitals',
          JSON.stringify(finalData)
        )
      }
    }

    // 页面卸载时发送最终报告
    window.addEventListener('beforeunload', sendFinalReport)

    // 页面隐藏时也发送（移动端场景）
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendFinalReport()
      }
    })
  }

  // 调试日志
  private log(message: string, ...args: any[]) {
    if (this.config.debug) {
      console.log(`[Web Vitals] ${message}`, ...args)
    }
  }

  // 获取当前收集的所有数据
  getData(): Partial<WebVitalsData> {
    return { ...this.data }
  }

  // 手动刷新发送数据
  flush() {
    this.reportMetrics('manual')
  }
}

// 全局初始化函数
export function initWebVitals(config: WebVitalsConfig) {
  if (typeof window === 'undefined') return null

  const collector = new WebVitalsCollector(config)
  collector.init()

  // 暴露到全局，方便调试
  if (config.debug) {
    ;(window as any).__webVitalsCollector = collector
  }

  return collector
}

// 性能分析工具
export class WebVitalsAnalyzer {
  // 批量分析多个页面的性能数据
  static analyzePagePerformance(data: WebVitalsData[]) {
    const analysis = {
      totalPages: data.length,
      averageScores: {} as Record<string, number>,
      poorPerforming: [] as string[],
      recommendations: [] as string[],
    }

    // 计算各项指标的平均值
    const metrics = ['fcp', 'lcp', 'cls', 'fid', 'inp', 'ttfb']

    metrics.forEach((metric) => {
      const values = data
        .map((d) => d[metric as keyof WebVitalsData] as number)
        .filter((v) => v !== undefined)

      if (values.length > 0) {
        analysis.averageScores[metric] = Math.round(
          values.reduce((sum, v) => sum + v, 0) / values.length
        )
      }
    })

    // 识别性能差的页面
    data.forEach((d) => {
      const score = this.calculateScore(d)
      if (score < 50) {
        analysis.poorPerforming.push(d.page)
      }
    })

    // 生成改进建议
    if (analysis.averageScores.lcp > 2500) {
      analysis.recommendations.push(
        '优化Largest Contentful Paint: 压缩图片、优化服务器响应'
      )
    }
    if (analysis.averageScores.cls > 0.1) {
      analysis.recommendations.push(
        '减少Cumulative Layout Shift: 为图片设置尺寸、避免动态内容插入'
      )
    }
    if (analysis.averageScores.fcp > 1800) {
      analysis.recommendations.push(
        '改善First Contentful Paint: 优化关键CSS、减少阻塞资源'
      )
    }

    return analysis
  }

  private static calculateScore(data: WebVitalsData): number {
    // 简化的评分计算
    let score = 100

    if (data.lcp && data.lcp > 4000) score -= 25
    else if (data.lcp && data.lcp > 2500) score -= 10

    if (data.cls && data.cls > 0.25) score -= 25
    else if (data.cls && data.cls > 0.1) score -= 10

    return Math.max(0, score)
  }
}

export { WebVitalsCollector }
export type { WebVitalsData, WebVitalsConfig }

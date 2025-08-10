import { throttle } from '@/lib/utils/throttle'

interface TrackingEvent {
  type: string
  page?: string
  sessionId?: string
  userId?: string
  userAgent?: string
  ipAddress?: string
  referrer?: string
  country?: string
  city?: string
  deviceType?: string
  browser?: string
  os?: string
  screenResolution?: string
  language?: string
  eventName?: string
  eventType?: string
  properties?: any
  value?: number
  performanceMetrics?: any
  errorData?: any
  data?: Record<string, any>
  timestamp?: string
  startTime?: number
  duration?: number
}

class AnalyticsTracker {
  private sessionId: string
  private userId: string
  private isInitialized: boolean = false
  private deviceInfo: any = {}
  private isTracking: boolean = true

  // 节流处理的事件上报函数
  private throttledTrackEvent = throttle(async (event: TrackingEvent) => {
    if (!this.isTracking) return

    try {
      // 验证事件数据
      if (!event || !event.type) {
        console.warn('Analytics tracking: 无效的事件数据', event)
        return
      }

      // 构建请求体
      const requestBody = {
        ...event,
        sessionId: this.sessionId,
        userId: this.userId,
        userAgent: this.deviceInfo.userAgent,
        ipAddress: this.deviceInfo.ipAddress,
        deviceType: this.deviceInfo.deviceType,
        browser: this.deviceInfo.browser,
        os: this.deviceInfo.os,
        screenResolution: this.deviceInfo.screenResolution,
        language: this.deviceInfo.language,
      }

      // 验证请求体不为空
      if (Object.keys(requestBody).length === 0) {
        console.warn('Analytics tracking: 请求体为空')
        return
      }

      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn('Analytics tracking failed:', response.status, errorText)
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error)
    }
  }, 1000) // 1秒节流

  constructor() {
    this.sessionId = this.generateSessionId()
    this.userId = this.generateUserId()
  }

  private generateSessionId(): string {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    )
  }

  private generateUserId(): string {
    // 检查是否在客户端环境
    if (typeof window === 'undefined') {
      return (
        'server_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      )
    }

    let userId = localStorage.getItem('analytics_user_id')
    if (!userId) {
      userId =
        'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('analytics_user_id', userId)
    }
    return userId
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent
    const screen = window.screen

    // 检测设备类型
    let deviceType = 'desktop'
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile'
    }

    // 详细浏览器检测
    let browser = 'unknown'
    let browserVersion = ''

    if (userAgent.includes('Chrome')) {
      browser = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browser = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge'
      const match = userAgent.match(/Edge\/(\d+)/)
      browserVersion = match ? match[1] : ''
    } else if (userAgent.includes('Opera')) {
      browser = 'Opera'
      const match = userAgent.match(/Opera\/(\d+)/)
      browserVersion = match ? match[1] : ''
    }

    // 详细操作系统检测
    let os = 'unknown'
    let osVersion = ''

    if (userAgent.includes('Windows')) {
      os = 'Windows'
      if (userAgent.includes('Windows NT 10.0')) osVersion = '10'
      else if (userAgent.includes('Windows NT 6.3')) osVersion = '8.1'
      else if (userAgent.includes('Windows NT 6.2')) osVersion = '8'
      else if (userAgent.includes('Windows NT 6.1')) osVersion = '7'
    } else if (userAgent.includes('Mac')) {
      os = 'macOS'
      const match = userAgent.match(/Mac OS X (\d+_\d+)/)
      osVersion = match ? match[1].replace('_', '.') : ''
    } else if (userAgent.includes('Linux')) {
      os = 'Linux'
      if (userAgent.includes('Ubuntu')) osVersion = 'Ubuntu'
      else if (userAgent.includes('Fedora')) osVersion = 'Fedora'
      else if (userAgent.includes('CentOS')) osVersion = 'CentOS'
    } else if (userAgent.includes('Android')) {
      os = 'Android'
      const match = userAgent.match(/Android (\d+)/)
      osVersion = match ? match[1] : ''
    } else if (userAgent.includes('iOS')) {
      os = 'iOS'
      const match = userAgent.match(/OS (\d+_\d+)/)
      osVersion = match ? match[1].replace('_', '.') : ''
    }

    // 设备详细信息
    let deviceModel = 'unknown'
    if (userAgent.includes('iPhone')) {
      deviceModel = 'iPhone'
      const match = userAgent.match(/iPhone\s+OS\s+(\d+_\d+)/)
      if (match) deviceModel += ` (iOS ${match[1].replace('_', '.')})`
    } else if (userAgent.includes('iPad')) {
      deviceModel = 'iPad'
      const match = userAgent.match(/iPad\s+OS\s+(\d+_\d+)/)
      if (match) deviceModel += ` (iPadOS ${match[1].replace('_', '.')})`
    } else if (userAgent.includes('Android')) {
      deviceModel = 'Android Device'
      const match = userAgent.match(/Android\s+(\d+)/)
      if (match) deviceModel += ` (Android ${match[1]})`
    }

    return {
      userAgent,
      deviceType,
      browser: browserVersion ? `${browser} ${browserVersion}` : browser,
      os: osVersion ? `${os} ${osVersion}` : os,
      deviceModel,
      screenResolution: `${screen.width}x${screen.height}`,
      ipAddress: 'unknown', // 客户端无法获取真实IP
      // 详细设备信息
      browserName: browser,
      browserVersion,
      osName: os,
      osVersion,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      onLine: navigator.onLine,
      platform: navigator.platform,
      vendor: navigator.vendor,
    }
  }

  init() {
    if (this.isInitialized) return

    this.deviceInfo = this.getDeviceInfo()
    this.isInitialized = true

    console.log('🔍 埋点系统已初始化')
  }

  // 追踪页面浏览
  trackPageView(page: string, section?: string) {
    const startTime = Date.now()

    this.throttledTrackEvent({
      type: 'pageview',
      page,
      properties: { section },
      startTime, // 记录开始时间
    })

    // 设置页面离开时的停留时间计算
    if (typeof window !== 'undefined') {
      const handlePageLeave = () => {
        const endTime = Date.now()
        const duration = Math.floor((endTime - startTime) / 1000) // 转换为秒

        // 发送停留时间数据
        this.throttledTrackEvent({
          type: 'page_duration',
          duration,
        })
      }

      // 监听页面离开事件
      window.addEventListener('beforeunload', handlePageLeave)
      window.addEventListener('pagehide', handlePageLeave)

      // 监听路由变化（Next.js）
      if (typeof window !== 'undefined' && window.history) {
        const originalPushState = window.history.pushState
        const originalReplaceState = window.history.replaceState

        window.history.pushState = function (...args) {
          handlePageLeave()
          return originalPushState.apply(this, args)
        }

        window.history.replaceState = function (...args) {
          handlePageLeave()
          return originalReplaceState.apply(this, args)
        }
      }
    }
  }

  // 追踪用户事件
  trackEvent(
    eventName: string,
    eventType: string,
    properties?: any,
    value?: number
  ) {
    this.throttledTrackEvent({
      type: 'event',
      eventName,
      eventType,
      properties,
      value,
    })
  }

  // 追踪用户交互
  trackUserInteraction(
    action: string,
    element: string,
    page?: string,
    properties?: any
  ) {
    this.trackEvent('user_interaction', action, {
      element,
      page,
      ...properties,
    })
  }

  // 追踪数据查看
  trackDataView(chartType: string, dataSource: string) {
    this.trackEvent('data_view', 'view', { chartType, dataSource })
  }

  // 追踪任务管理
  trackTaskManagement(action: string, taskType: string, taskId?: string) {
    this.trackEvent('task_management', action, {
      task_type: taskType,
      task_id: taskId,
    })
  }

  // 追踪时间追踪
  trackTimeTracking(action: string, project?: string, duration?: number) {
    this.trackEvent('time_tracking', action, {
      project,
      duration,
    })
  }

  // 追踪通知
  trackNotification(type: string, message: string) {
    this.trackEvent('notification', type, { message })
  }

  // 追踪性能指标
  trackPerformance(metric: string, value: number, properties?: any) {
    // 字段名映射
    const fieldMapping: Record<string, string> = {
      loadTime: 'loadTime',
      domContentLoaded: 'domContentLoaded',
      firstContentfulPaint: 'firstContentfulPaint',
      largestContentfulPaint: 'largestContentfulPaint',
      cumulativeLayoutShift: 'cumulativeLayoutShift',
      firstInputDelay: 'firstInputDelay',
      page_load_time: 'loadTime', // 前端使用的字段名
    }

    const fieldName = fieldMapping[metric] || metric

    this.throttledTrackEvent({
      type: 'performance',
      page: typeof window !== 'undefined' ? window.location.pathname : '/',
      eventName: metric,
      value,
      performanceMetrics: {
        [fieldName]: value,
        ...properties,
      },
    })
  }

  // 追踪错误
  trackError(error: Error | string, page?: string, properties?: any) {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack
    const errorName = typeof error === 'string' ? 'Error' : error.name

    this.throttledTrackEvent({
      type: 'error',
      eventName: 'error',
      errorData: {
        message: errorMessage,
        stack: errorStack,
        name: errorName,
        page,
        ...properties,
      },
    })
  }

  // 设置用户ID
  setUserId(userId: string) {
    this.userId = userId
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_user_id', userId)
    }
  }

  // 获取会话ID
  getSessionId(): string {
    return this.sessionId
  }

  // 获取用户ID
  getCurrentUserId(): string {
    return this.userId
  }

  // 启用/禁用追踪
  setTracking(enabled: boolean) {
    this.isTracking = enabled
  }

  // 重置会话
  resetSession() {
    this.sessionId = this.generateSessionId()
  }

  // 获取设备信息
  getCurrentDeviceInfo() {
    return this.deviceInfo
  }
}

// 创建单例实例
export const analyticsTracker = new AnalyticsTracker()

// 自动错误追踪 - 使用安全的初始化方式
let errorListenersInitialized = false

function initializeErrorListeners() {
  if (typeof window === 'undefined' || errorListenersInitialized) return

  try {
    window.addEventListener('error', (event) => {
      // 检查是否是Next.js开发工具错误
      if (
        event.error &&
        event.error.message &&
        event.error.message.includes('callback is no longer runnable')
      ) {
        return // 忽略Next.js开发工具错误
      }

      analyticsTracker.trackError(event.error, window.location.pathname, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      // 检查是否是Next.js开发工具错误
      if (
        event.reason &&
        event.reason.message &&
        event.reason.message.includes('callback is no longer runnable')
      ) {
        return // 忽略Next.js开发工具错误
      }

      analyticsTracker.trackError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        window.location.pathname,
        { reason: event.reason }
      )
    })

    errorListenersInitialized = true
  } catch (error) {
    console.warn('埋点错误监听器初始化失败:', error)
  }
}

// 延迟初始化，避免在模块加载时立即执行
if (typeof window !== 'undefined') {
  // 使用 requestIdleCallback 或 setTimeout 延迟初始化
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => initializeErrorListeners())
  } else {
    setTimeout(initializeErrorListeners, 100)
  }
}

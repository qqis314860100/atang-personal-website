/**
 * 生成 UUID 的函数
 *
 * 使用简单的随机数生成 UUID v4 格式的字符串，
 * 用于为每个埋点事件创建唯一标识符。
 *
 * @returns 生成的 UUID 字符串
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
import {
  BaseEvent,
  ModuleTracker,
  AnalyticsPlugin,
  AnalyticsConfig,
  PageViewEvent,
  UserActionEvent,
  BusinessEvent,
  PerformanceEvent,
  ErrorEvent,
} from './types'

/**
 * 模块注册器 - 管理所有模块埋点器
 *
 * 负责：
 * - 注册新的模块埋点器
 * - 获取已注册的模块
 * - 统一管理模块的生命周期
 */
class ModuleRegistry {
  private modules: Map<string, ModuleTracker> = new Map()

  /**
   * 注册模块埋点器
   * @param name 模块名称
   * @param tracker 模块埋点器实例
   */
  registerModule(name: string, tracker: ModuleTracker) {
    this.modules.set(name, tracker)
    tracker.initialize()
  }

  /**
   * 获取指定模块的埋点器
   * @param name 模块名称
   * @returns 模块埋点器实例，如果不存在则返回 undefined
   */
  getModule(name: string): ModuleTracker | undefined {
    return this.modules.get(name)
  }

  /**
   * 获取所有已注册的模块埋点器
   * @returns 所有模块埋点器的数组
   */
  getAllModules(): ModuleTracker[] {
    return Array.from(this.modules.values())
  }
}

/**
 * 插件管理器 - 管理所有埋点插件
 *
 * 负责：
 * - 注册和初始化插件
 * - 将事件分发给所有插件
 * - 管理插件的生命周期
 * - 错误处理和容错机制
 */
class PluginManager {
  private plugins: Map<string, AnalyticsPlugin> = new Map()

  /**
   * 注册并初始化插件
   * @param plugin 插件实例
   * @param config 插件配置
   */
  async registerPlugin(plugin: AnalyticsPlugin, config: any) {
    this.plugins.set(plugin.name, plugin)
    await plugin.initialize(config)
  }

  /**
   * 将事件分发给所有已注册的插件
   * @param event 要处理的事件
   */
  async processEvent(event: BaseEvent) {
    const promises = Array.from(this.plugins.values()).map((plugin) =>
      plugin.processEvent(event).catch((error) => {
        console.error(`Plugin ${plugin.name} failed to process event:`, error)
      })
    )
    await Promise.all(promises)
  }

  /**
   * 清理所有插件的资源
   */
  async cleanup() {
    const promises = Array.from(this.plugins.values()).map((plugin) =>
      plugin.cleanup().catch((error) => {
        console.error(`Plugin ${plugin.name} failed to cleanup:`, error)
      })
    )
    await Promise.all(promises)
  }
}

// 会话管理器
class SessionManager {
  private sessionId: string
  private startTime: Date

  constructor() {
    this.sessionId = generateUUID()
    this.startTime = new Date()
  }

  getSessionId(): string {
    return this.sessionId
  }

  getSessionDuration(): number {
    return Date.now() - this.startTime.getTime()
  }

  resetSession() {
    this.sessionId = generateUUID()
    this.startTime = new Date()
  }
}

// 核心埋点服务
export class AnalyticsService {
  private static instance: AnalyticsService
  private moduleRegistry: ModuleRegistry
  private pluginManager: PluginManager
  private sessionManager: SessionManager
  private config: AnalyticsConfig
  private isInitialized = false

  private constructor() {
    this.moduleRegistry = new ModuleRegistry()
    this.pluginManager = new PluginManager()
    this.sessionManager = new SessionManager()
    this.config = this.getDefaultConfig()
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  private getDefaultConfig(): AnalyticsConfig {
    return {
      global: {
        enabled: true,
        sampleRate: 1.0,
        privacyMode: false,
        dataRetentionDays: 90,
      },
      modules: {},
      plugins: [],
      dashboards: [],
    }
  }

  async initialize(config?: Partial<AnalyticsConfig>) {
    if (this.isInitialized) return

    if (config) {
      this.config = { ...this.getDefaultConfig(), ...config }
    }

    // 初始化插件
    for (const pluginConfig of this.config.plugins) {
      if (pluginConfig.enabled) {
        // 这里可以动态加载插件
        console.log(`Initializing plugin: ${pluginConfig.name}`)
      }
    }

    this.isInitialized = true
    console.log('Analytics service initialized')
  }

  // 获取当前用户ID
  private getCurrentUserId(): string | undefined {
    // 这里可以从你的用户状态管理中获取
    if (typeof window !== 'undefined') {
      // 从 localStorage 或其他地方获取用户ID
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  // 获取设备信息
  private getDeviceInfo() {
    if (typeof window === 'undefined') return {}

    const userAgent = navigator.userAgent
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      )
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(
      userAgent
    )

    return {
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      browser: this.getBrowserInfo(userAgent),
      os: this.getOSInfo(userAgent),
      userAgent,
    }
  }

  private getBrowserInfo(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getOSInfo(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  // 创建基础事件
  private createBaseEvent(
    module: string,
    metadata: Record<string, any> = {}
  ): BaseEvent {
    return {
      eventId: generateUUID(),
      timestamp: new Date(),
      sessionId: this.sessionManager.getSessionId(),
      userId: this.getCurrentUserId(),
      module,
      version: '1.0.0',
      metadata: {
        ...this.getDeviceInfo(),
        ...metadata,
      },
    }
  }

  // 页面访问埋点
  trackPageView(
    pagePath: string,
    referrer: string,
    viewDuration: number,
    scrollDepth: number
  ) {
    if (!this.config.global.enabled) return

    const deviceInfo = this.getDeviceInfo()
    const event: PageViewEvent = {
      ...this.createBaseEvent('page'),
      pagePath,
      referrer,
      userAgent: deviceInfo.userAgent || '',
      viewDuration,
      scrollDepth,
      deviceType: (deviceInfo.deviceType as any) || 'desktop',
      browser: deviceInfo.browser || 'Unknown',
      os: deviceInfo.os || 'Unknown',
      locale: typeof navigator !== 'undefined' ? navigator.language : 'en',
    }

    this.sendEvent(event)
  }

  // 用户行为埋点
  trackUserAction(
    action: string,
    targetId?: string,
    success: boolean = true,
    errorMessage?: string,
    duration?: number
  ) {
    if (!this.config.global.enabled) return

    const event: UserActionEvent = {
      ...this.createBaseEvent('user_action'),
      action,
      targetId,
      success,
      errorMessage,
      duration,
    }

    this.sendEvent(event)
  }

  // 业务事件埋点
  trackBusinessEvent(
    businessType: string,
    businessId: string,
    data: Record<string, any>
  ) {
    if (!this.config.global.enabled) return

    const event: BusinessEvent = {
      ...this.createBaseEvent('business'),
      businessType,
      businessId,
      data,
    }

    this.sendEvent(event)
  }

  // 性能埋点
  trackPerformance(
    metric: string,
    value: number,
    unit: string,
    context?: Record<string, any>
  ) {
    if (!this.config.global.enabled) return

    const event: PerformanceEvent = {
      ...this.createBaseEvent('performance'),
      metric,
      value,
      unit,
      context,
    }

    this.sendEvent(event)
  }

  // 错误埋点
  trackError(
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    context?: Record<string, any>
  ) {
    if (!this.config.global.enabled) return

    const event: ErrorEvent = {
      ...this.createBaseEvent('error'),
      errorType,
      errorMessage,
      stackTrace,
      context,
    }

    this.sendEvent(event)
  }

  // 模块事件埋点
  trackModuleEvent(moduleName: string, eventType: string, data: any) {
    if (!this.config.global.enabled) return

    const module = this.moduleRegistry.getModule(moduleName)
    if (module) {
      module.trackEvent(eventType, data)
    }
  }

  // 发送事件
  private async sendEvent(event: BaseEvent) {
    try {
      // 采样检查
      if (Math.random() > this.config.global.sampleRate) {
        return
      }

      // 发送到服务器
      await this.sendToServer(event)

      // 处理插件
      await this.pluginManager.processEvent(event)

      // 处理模块
      const module = this.moduleRegistry.getModule(event.module)
      if (module) {
        module.trackEvent('event', event)
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // 发送到服务器
  private async sendToServer(event: BaseEvent) {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send event to server:', error)
    }
  }

  // 注册模块
  registerModule(name: string, tracker: ModuleTracker) {
    this.moduleRegistry.registerModule(name, tracker)
  }

  // 注册插件
  async registerPlugin(plugin: AnalyticsPlugin, config: any) {
    await this.pluginManager.registerPlugin(plugin, config)
  }

  // 获取会话信息
  getSessionInfo() {
    return {
      sessionId: this.sessionManager.getSessionId(),
      sessionDuration: this.sessionManager.getSessionDuration(),
    }
  }

  // 重置会话
  resetSession() {
    this.sessionManager.resetSession()
  }

  // 清理资源
  async cleanup() {
    await this.pluginManager.cleanup()
  }
}

// 导出单例实例
export const analytics = AnalyticsService.getInstance()

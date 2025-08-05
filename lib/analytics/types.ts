/**
 * 埋点系统 - 类型定义
 *
 * 这个文件定义了埋点系统的所有核心类型接口，包括：
 * - 基础事件结构
 * - 各种事件类型（页面访问、用户行为、业务事件等）
 * - 模块注册器和插件接口
 * - 配置接口
 * - 未来功能模块的预留接口
 */

/**
 * 基础事件接口 - 所有埋点事件的通用结构
 *
 * @property eventId - 事件唯一标识符（UUID）
 * @property timestamp - 事件发生时间
 * @property sessionId - 会话标识符，用于关联同一会话中的多个事件
 * @property userId - 用户标识符（可选，匿名用户可能没有）
 * @property module - 事件来源模块（如：'blog', 'video', 'editor'）
 * @property version - 埋点系统版本号
 * @property metadata - 额外的元数据信息（设备信息、环境信息等）
 */
export interface BaseEvent {
  eventId: string
  timestamp: Date
  sessionId: string
  userId?: string
  module: string
  version: string
  metadata: Record<string, any>
}

/**
 * 页面访问事件 - 记录用户访问页面的行为
 *
 * 用于分析：
 * - 页面访问量
 * - 用户停留时间
 * - 滚动深度
 * - 设备类型分布
 * - 浏览器和操作系统分布
 *
 * @property pagePath - 页面路径
 * @property referrer - 来源页面
 * @property userAgent - 用户代理字符串
 * @property viewDuration - 页面停留时间（毫秒）
 * @property scrollDepth - 滚动深度百分比（0-100）
 * @property deviceType - 设备类型
 * @property browser - 浏览器名称
 * @property os - 操作系统
 * @property locale - 用户语言设置
 */
export interface PageViewEvent extends BaseEvent {
  module: string
  pagePath: string
  referrer: string
  userAgent: string
  viewDuration: number
  scrollDepth: number
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  locale: string
}

/**
 * 用户行为事件 - 记录用户的具体操作行为
 *
 * 用于分析：
 * - 用户操作路径
 * - 功能使用频率
 * - 错误率统计
 * - 操作耗时分析
 *
 * @property action - 操作类型（如：'click', 'submit', 'delete'）
 * @property targetId - 操作目标标识符（如：按钮ID、文章ID）
 * @property success - 操作是否成功
 * @property errorMessage - 错误信息（如果操作失败）
 * @property duration - 操作耗时（毫秒）
 */
export interface UserActionEvent extends BaseEvent {
  action: string
  targetId?: string
  success: boolean
  errorMessage?: string
  duration?: number
}

/**
 * 业务事件 - 记录具体的业务操作
 *
 * 用于分析：
 * - 业务指标统计
 * - 用户行为模式
 * - 功能使用情况
 * - 业务转化率
 *
 * @property businessType - 业务类型（如：'post_view', 'user_register'）
 * @property businessId - 业务对象标识符（如：文章ID、用户ID）
 * @property data - 业务相关的详细数据
 */
export interface BusinessEvent extends BaseEvent {
  businessType: string
  businessId?: string
  data: Record<string, any>
}

/**
 * 性能事件 - 记录系统性能指标
 *
 * 用于分析：
 * - 页面加载时间
 * - API 响应时间
 * - 资源加载性能
 * - 用户体验指标
 *
 * @property metric - 性能指标名称（如：'page_load_time', 'api_response_time'）
 * @property value - 性能指标数值
 * @property unit - 单位（如：'ms', 'kb', 'count'）
 * @property context - 性能相关的上下文信息
 */
export interface PerformanceEvent extends BaseEvent {
  module: string
  metric: string
  value: number
  unit: string
  context?: Record<string, any>
}

/**
 * 错误事件 - 记录系统错误和异常
 *
 * 用于分析：
 * - 错误率统计
 * - 错误类型分布
 * - 错误发生位置
 * - 系统稳定性监控
 *
 * @property errorType - 错误类型（如：'javascript_error', 'api_error'）
 * @property errorMessage - 错误信息
 * @property stackTrace - 错误堆栈信息（可选）
 * @property context - 错误相关的上下文信息
 */
export interface ErrorEvent extends BaseEvent {
  module: string
  errorType: string
  errorMessage: string
  stackTrace?: string
  context?: Record<string, any>
}

/**
 * 模块注册器接口 - 定义模块埋点器的标准接口
 *
 * 每个功能模块（如博客、视频、编辑器）都应该实现这个接口，
 * 以便统一管理和扩展埋点功能。
 *
 * @property moduleName - 模块名称
 * @property version - 模块版本
 * @method initialize - 初始化模块埋点器
 * @method trackEvent - 追踪模块特定事件
 * @method trackPerformance - 追踪模块性能指标
 * @method trackError - 追踪模块错误
 */
export interface ModuleTracker {
  moduleName: string
  version: string
  initialize(): void
  trackEvent(eventType: string, data: any): void
  trackPerformance(metric: string, value: number): void
  trackError(error: Error, context?: any): void
}

/**
 * 插件接口 - 定义埋点插件的标准接口
 *
 * 插件可以用于：
 * - 数据导出到第三方服务（如 Google Analytics）
 * - 数据转换和过滤
 * - 自定义数据处理逻辑
 * - 实时数据流处理
 *
 * @property name - 插件名称
 * @property version - 插件版本
 * @method initialize - 初始化插件
 * @method processEvent - 处理埋点事件
 * @method exportData - 导出数据
 * @method cleanup - 清理插件资源
 */
export interface AnalyticsPlugin {
  name: string
  version: string
  initialize(config: any): Promise<void>
  processEvent(event: BaseEvent): Promise<void>
  exportData(filters: any): Promise<any>
  cleanup(): Promise<void>
}

// 配置接口
export interface AnalyticsConfig {
  global: {
    enabled: boolean
    sampleRate: number
    privacyMode: boolean
    dataRetentionDays: number
  }
  modules: Record<string, ModuleConfig>
  plugins: PluginConfig[]
  dashboards: DashboardConfig[]
}

export interface ModuleConfig {
  enabled: boolean
  trackEvents: string[]
  customProperties: Record<string, any>
  sampling: {
    enabled: boolean
    rate: number
  }
}

export interface PluginConfig {
  name: string
  enabled: boolean
  config: Record<string, any>
}

export interface DashboardConfig {
  name: string
  enabled: boolean
  components: DashboardComponent[]
}

export interface DashboardComponent {
  id: string
  type: 'chart' | 'table' | 'metric' | 'list'
  title: string
  dataQuery: string
  refreshInterval?: number
  config: Record<string, any>
}

// 未来功能模块预留接口
export interface VideoAnalytics {
  videoInfo: {
    videoId: string
    title: string
    duration: number
    category: string
    creatorId: string
    quality: '360p' | '480p' | '720p' | '1080p' | '4k'
  }
  playback: {
    action: 'play' | 'pause' | 'stop' | 'seek' | 'fullscreen' | 'mute'
    currentTime: number
    playbackRate: number
    volume: number
    bufferingTime?: number
  }
  progress: {
    watchDuration: number
    completionRate: number
    dropOffPoint?: number
    rewatchSegments: number[]
  }
  quality: {
    bitrate: number
    resolution: string
    bufferingEvents: number
    errorEvents: number
  }
}

export interface DanmakuAnalytics {
  danmakuSend: {
    videoId: string
    content: string
    type: 'scroll' | 'top' | 'bottom' | 'special'
    color: string
    fontSize: number
    position: number
    timestamp: number
    userId: string
  }
  danmakuInteraction: {
    action: 'like' | 'dislike' | 'report' | 'reply'
    danmakuId: string
    videoId: string
    userId: string
  }
  danmakuSettings: {
    enabled: boolean
    opacity: number
    speed: number
    fontSize: number
    filterWords: string[]
  }
  danmakuDensity: {
    videoId: string
    timeSegment: number
    danmakuCount: number
    activeUsers: number
  }
}

export interface EditorAnalytics {
  documentInfo: {
    documentId: string
    title: string
    type: 'text' | 'code' | 'markdown' | 'spreadsheet'
    collaborators: string[]
    version: number
  }
  editOperation: {
    action: 'insert' | 'delete' | 'replace' | 'format' | 'undo' | 'redo'
    position: number
    length: number
    content?: string
    timestamp: number
    userId: string
  }
  cursorPosition: {
    userId: string
    position: number
    selectionStart?: number
    selectionEnd?: number
    timestamp: number
  }
  editSession: {
    sessionId: string
    startTime: Date
    endTime?: Date
    totalEdits: number
    activeTime: number
  }
}

export interface CollaborationAnalytics {
  presence: {
    userId: string
    status: 'online' | 'away' | 'offline'
    lastActivity: Date
    activeTime: number
  }
  conflictResolution: {
    conflictId: string
    conflictType: 'merge' | 'resolve' | 'reject'
    resolutionTime: number
    resolvedBy: string
  }
  collaborationMode: {
    mode: 'real-time' | 'async' | 'review'
    participants: string[]
    activeEditors: number
  }
  permissionChange: {
    userId: string
    permission: 'read' | 'write' | 'admin'
    grantedBy: string
    timestamp: Date
  }
}

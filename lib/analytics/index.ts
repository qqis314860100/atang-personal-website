export { analytics } from './core'
export * from './types'

// 导出模块埋点器
export { BlogTracker } from './modules/blog-tracker'
export { VideoTracker } from './modules/video-tracker'
export { EditorTracker } from './modules/editor-tracker'

// 初始化函数
export async function initializeAnalytics() {
  const { analytics } = await import('./core')
  const { BlogTracker } = await import('./modules/blog-tracker')
  const { VideoTracker } = await import('./modules/video-tracker')
  const { EditorTracker } = await import('./modules/editor-tracker')

  // 初始化核心服务
  await analytics.initialize()

  // 注册模块埋点器
  analytics.registerModule('blog', new BlogTracker())
  analytics.registerModule('video', new VideoTracker())
  analytics.registerModule('editor', new EditorTracker())

  console.log('Analytics system initialized with all modules')
}

// 便捷的埋点函数
export const trackPageView = (
  pagePath: string,
  referrer: string,
  viewDuration: number,
  scrollDepth: number
) => {
  const { analytics } = require('./core')
  analytics.trackPageView(pagePath, referrer, viewDuration, scrollDepth)
}

export const trackUserAction = (
  action: string,
  targetId?: string,
  success?: boolean,
  errorMessage?: string,
  duration?: number
) => {
  const { analytics } = require('./core')
  analytics.trackUserAction(action, targetId, success, errorMessage, duration)
}

export const trackBusinessEvent = (
  businessType: string,
  businessId: string,
  data: Record<string, any>
) => {
  const { analytics } = require('./core')
  analytics.trackBusinessEvent(businessType, businessId, data)
}

export const trackPerformance = (
  metric: string,
  value: number,
  unit: string,
  context?: Record<string, any>
) => {
  const { analytics } = require('./core')
  analytics.trackPerformance(metric, value, unit, context)
}

export const trackError = (
  errorType: string,
  errorMessage: string,
  stackTrace?: string,
  context?: Record<string, any>
) => {
  const { analytics } = require('./core')
  analytics.trackError(errorType, errorMessage, stackTrace, context)
}

// 模块特定的埋点函数
export const trackBlogEvent = (eventType: string, data: any) => {
  const { analytics } = require('./core')
  analytics.trackModuleEvent('blog', eventType, data)
}

export const trackVideoEvent = (eventType: string, data: any) => {
  const { analytics } = require('./core')
  analytics.trackModuleEvent('video', eventType, data)
}

export const trackEditorEvent = (eventType: string, data: any) => {
  const { analytics } = require('./core')
  analytics.trackModuleEvent('editor', eventType, data)
}

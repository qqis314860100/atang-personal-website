/**
 * 简化的埋点追踪器
 * 避免复杂的依赖关系，直接发送事件到服务器
 */

interface TrackingEvent {
  type: string
  data: Record<string, any>
  timestamp: string
  sessionId: string
}

class SimpleTracker {
  private sessionId: string
  private isInitialized = false

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  private generateSessionId(): string {
    return (
      'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    )
  }

  // 初始化追踪器
  initialize() {
    if (this.isInitialized) return
    this.isInitialized = true
    console.log('🔍 埋点系统已初始化')
  }

  // 发送事件到服务器
  private async sendEvent(event: TrackingEvent) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })
    } catch (error) {
      console.error('埋点事件发送失败:', error)
    }
  }

  // 追踪页面访问
  trackPageView(page: string, section?: string) {
    this.sendEvent({
      type: 'page_view',
      data: { page, section },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪用户交互
  trackUserInteraction(
    action: string,
    element: string,
    section: string,
    value?: any
  ) {
    this.sendEvent({
      type: 'user_interaction',
      data: { action, element, section, value },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪数据查看
  trackDataView(chartType: string, dataSource: string) {
    this.sendEvent({
      type: 'data_view',
      data: { chart_type: chartType, data_source: dataSource },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪任务管理
  trackTaskManagement(action: string, taskType: string, taskId?: string) {
    this.sendEvent({
      type: 'task_management',
      data: { action, task_type: taskType, task_id: taskId },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪时间追踪
  trackTimeTracking(action: string, project?: string, duration?: number) {
    this.sendEvent({
      type: 'time_tracking',
      data: { action, project, duration },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪通知
  trackNotification(type: string, message: string) {
    this.sendEvent({
      type: 'notification',
      data: { type, message },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪性能指标
  trackPerformance(metric: string, value: number) {
    this.sendEvent({
      type: 'performance',
      data: { metric, value },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }

  // 追踪错误
  trackError(error: string, context?: string) {
    this.sendEvent({
      type: 'error',
      data: { error, context },
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    })
  }
}

// 创建全局单例
export const tracker = new SimpleTracker()

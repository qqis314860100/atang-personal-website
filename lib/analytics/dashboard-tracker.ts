import { AnalyticsService } from './core'

export interface DashboardEvent {
  // 页面访问事件
  page_view: {
    page: string
    section?: string
    duration?: number
  }

  // 用户交互事件
  user_interaction: {
    action: 'click' | 'hover' | 'scroll' | 'resize'
    element: string
    section: string
    value?: any
  }

  // 数据查看事件
  data_view: {
    chart_type: 'line' | 'bar' | 'pie' | 'area'
    data_source: string
    filters?: Record<string, any>
  }

  // 任务管理事件
  task_management: {
    action: 'create' | 'update' | 'delete' | 'complete'
    task_type: string
    task_id?: string
    priority?: 'low' | 'medium' | 'high'
  }

  // 时间追踪事件
  time_tracking: {
    action: 'start' | 'stop' | 'pause' | 'resume'
    project?: string
    duration?: number
  }

  // 通知事件
  notification: {
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
    action?: string
  }

  // 设置变更事件
  settings_change: {
    setting: string
    old_value: any
    new_value: any
  }
}

export class DashboardTracker {
  private analytics: AnalyticsService

  constructor() {
    this.analytics = AnalyticsService.getInstance()
  }

  // 追踪页面访问
  trackPageView(page: string, section?: string, duration?: number) {
    this.analytics.trackBusinessEvent('dashboard_page_view', page, {
      section,
      duration,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪用户交互
  trackUserInteraction(
    action: 'click' | 'hover' | 'scroll' | 'resize',
    element: string,
    section: string,
    value?: any
  ) {
    this.analytics.trackBusinessEvent('dashboard_user_interaction', element, {
      action,
      section,
      value,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪数据查看
  trackDataView(
    chartType: 'line' | 'bar' | 'pie' | 'area',
    dataSource: string,
    filters?: Record<string, any>
  ) {
    this.analytics.trackBusinessEvent('dashboard_data_view', dataSource, {
      chart_type: chartType,
      filters,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪任务管理
  trackTaskManagement(
    action: 'create' | 'update' | 'delete' | 'complete',
    taskType: string,
    taskId?: string,
    priority?: 'low' | 'medium' | 'high'
  ) {
    this.analytics.trackBusinessEvent('dashboard_task_management', taskType, {
      action,
      task_id: taskId,
      priority,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪时间追踪
  trackTimeTracking(
    action: 'start' | 'stop' | 'pause' | 'resume',
    project?: string,
    duration?: number
  ) {
    this.analytics.trackBusinessEvent('dashboard_time_tracking', action, {
      project,
      duration,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪通知
  trackNotification(
    type: 'success' | 'warning' | 'error' | 'info',
    message: string,
    action?: string
  ) {
    this.analytics.trackBusinessEvent('dashboard_notification', type, {
      message,
      action,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪设置变更
  trackSettingsChange(setting: string, oldValue: any, newValue: any) {
    this.analytics.trackBusinessEvent('dashboard_settings_change', setting, {
      old_value: oldValue,
      new_value: newValue,
      timestamp: new Date().toISOString(),
    })
  }

  // 追踪性能指标
  trackPerformance(metric: string, value: number) {
    this.analytics.trackPerformance(metric, value, 'ms', {
      context: 'dashboard',
    })
  }

  // 追踪错误
  trackError(error: Error, context?: string) {
    this.analytics.trackError('dashboard_error', error.message, undefined, {
      context: context || 'dashboard',
      timestamp: new Date().toISOString(),
    })
  }
}

// 创建单例实例
export const dashboardTracker = new DashboardTracker()

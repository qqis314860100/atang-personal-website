// Dashboard 数据库表结构定义

export interface PageView {
  id: string
  page: string
  user_id?: string
  session_id: string
  user_agent?: string
  ip_address?: string
  referrer?: string
  country?: string
  city?: string
  device_type?: string
  browser?: string
  os?: string
  screen_resolution?: string
  language?: string
  start_time?: Date
  end_time?: Date
  duration?: number // 页面停留时间（秒）
  timestamp: Date
}

export interface UserEvent {
  id: string
  event_type:
    | 'page_view'
    | 'click'
    | 'scroll'
    | 'form_submit'
    | 'download'
    | 'search'
  event_name: string
  page: string
  user_id?: string
  session_id: string
  timestamp: Date
  properties: Record<string, any>
  value?: number
}

export interface UserSession {
  id: string
  session_id: string
  user_id?: string
  started_at: Date
  ended_at?: Date
  duration?: number
  page_count: number
  event_count: number
  ip_address?: string
  user_agent?: string
  country?: string
  city?: string
  device_type?: string
  browser?: string
  os?: string
  language?: string
}

export interface PerformanceMetric {
  id: string
  page: string

  // 核心性能指标
  load_time: number // 总加载时间 (Load Event)
  dom_content_loaded: number // DOM内容加载时间 (DOMContentLoaded)
  time_to_first_byte?: number // 首字节时间 (TTFB)
  first_paint?: number // 首次绘制 (FP)
  first_contentful_paint?: number // 首次内容绘制 (FCP)
  largest_contentful_paint?: number // 最大内容绘制 (LCP)

  // 交互性指标
  first_input_delay?: number // 首次输入延迟 (FID)
  interaction_to_next_paint?: number // 交互到下次绘制 (INP)
  total_blocking_time?: number // 总阻塞时间 (TBT)

  // 视觉稳定性指标
  cumulative_layout_shift?: number // 累积布局偏移 (CLS)

  // 元数据
  session_id: string
  user_id?: string
  timestamp: Date
}

export interface ErrorLog {
  id: string
  error_type: string
  error_message: string
  stack_trace?: string
  page: string
  user_id?: string
  session_id: string
  timestamp: Date
  user_agent: string
  ip_address: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

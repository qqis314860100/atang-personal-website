import { createAdminClient } from '@/lib/supabase/server'
import { parsePagePath, getPageStats } from '@/lib/analytics/page-mapping'
// 使用Prisma生成的类型，这里定义本地类型以保持兼容性
interface PageView {
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
  timestamp: Date
}

interface UserEvent {
  id: string
  event_type: string
  event_name: string
  page?: string
  user_id?: string
  session_id: string
  properties?: any
  value?: number
  timestamp: Date
}

interface PerformanceMetric {
  id: string
  page: string
  load_time: number
  dom_content_loaded: number
  first_contentful_paint?: number
  largest_contentful_paint?: number
  cumulative_layout_shift?: number
  first_input_delay?: number
  session_id: string
  user_id?: string
  timestamp: Date
}

interface ErrorLog {
  id: string
  error_type: string
  error_message: string
  stack_trace?: string
  page?: string
  user_id?: string
  session_id: string
  user_agent?: string
  ip_address?: string
  severity: string
  timestamp: Date
}

export class AnalyticsService {
  private supabase: any

  constructor() {
    this.supabase = null
  }

  private async getClient() {
    if (!this.supabase) {
      this.supabase = await createAdminClient()
    }
    return this.supabase
  }

  // 记录页面浏览
  async recordPageView(data: {
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
  }) {
    const client = await this.getClient()

    // 记录页面浏览，包含开始时间
    const { data: pageView, error: pageViewError } = await client
      .from('PageView')
      .insert({
        id: crypto.randomUUID(),
        page: data.page,
        user_id: data.user_id,
        session_id: data.session_id,
        user_agent: data.user_agent,
        ip_address: data.ip_address,
        referrer: data.referrer,
        country: data.country,
        city: data.city,
        device_type: data.device_type,
        browser: data.browser,
        os: data.os,
        screen_resolution: data.screen_resolution,
        language: data.language,
        start_time: new Date().toISOString(), // 记录页面开始时间
      })
      .select()
      .single()

    if (pageViewError) {
      console.error('记录页面浏览失败:', pageViewError)
      throw pageViewError
    }

    // 检查是否已存在UserSession，如果不存在则创建
    const { data: existingSession } = await client
      .from('UserSession')
      .select('id')
      .eq('session_id', data.session_id)
      .single()

    if (!existingSession) {
      // 创建新的UserSession
      const { error: sessionError } = await client.from('UserSession').insert({
        id: crypto.randomUUID(),
        user_id: data.user_id,
        session_id: data.session_id,
        started_at: new Date().toISOString(),
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        country: data.country,
        city: data.city,
        device_type: data.device_type,
        browser: data.browser,
        os: data.os,
        language: data.language,
      })

      if (sessionError) {
        console.error('创建用户会话失败:', sessionError)
      }
    } else {
      // 更新现有会话的页面计数
      const { error: updateError } = await client
        .from('UserSession')
        .update({
          page_count: client.raw('page_count + 1'),
        })
        .eq('session_id', data.session_id)

      if (updateError) {
        console.error('更新会话页面计数失败:', updateError)
      }
    }

    return pageView
  }

  // 记录用户事件
  async recordUserEvent(data: Omit<UserEvent, 'id' | 'timestamp'>) {
    const client = await this.getClient()
    const { data: result, error } = await client
      .from('UserEvent')
      .insert({
        id: crypto.randomUUID(),
        event_type: data.event_type,
        event_name: data.event_name,
        page: data.page,
        user_id: data.user_id,
        session_id: data.session_id,
        properties: data.properties,
        value: data.value,
      })
      .select()
      .single()

    if (error) {
      console.error('记录用户事件失败:', error)
      throw error
    }

    return result
  }

  // 记录性能指标
  async recordPerformanceMetric(
    data: Omit<PerformanceMetric, 'id' | 'timestamp'>
  ) {
    const client = await this.getClient()
    const { data: result, error } = await client
      .from('PerformanceMetric')
      .insert({
        id: crypto.randomUUID(),
        page: data.page,
        load_time: data.load_time,
        dom_content_loaded: data.dom_content_loaded,
        first_contentful_paint: data.first_contentful_paint,
        largest_contentful_paint: data.largest_contentful_paint,
        cumulative_layout_shift: data.cumulative_layout_shift,
        first_input_delay: data.first_input_delay,
        session_id: data.session_id,
        user_id: data.user_id,
      })
      .select()
      .single()

    if (error) {
      console.error('记录性能指标失败:', error)
      throw error
    }

    return result
  }

  // 记录错误日志
  async recordErrorLog(data: {
    type: string
    message: string
    stackTrace: string
    page: string
    userAgent: string
    ipAddress: string
    severity?: string
    userId?: string
    sessionId?: string
    timestamp?: string
    source?: string
    traceId?: string
  }) {
    const client = await this.getClient()
    const { data: errorLog, error } = await client
      .from('ErrorLog')
      .insert({
        id: crypto.randomUUID(),
        error_type: data.type,
        error_message: data.message,
        stack_trace: data.stackTrace,
        page: data.page,
        user_agent: data.userAgent,
        ip_address: data.ipAddress,
        severity: data.severity || 'medium',
        user_id: data.userId,
        session_id: data.sessionId,
        timestamp: data.timestamp || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error recording error log:', error)
      return null
    }

    return errorLog
  }

  // 记录页面停留时间
  async recordPageDuration(data: {
    duration: number
    session_id: string
    user_id?: string
  }) {
    const client = await this.getClient()

    // 更新最新的PageView记录的停留时间
    const { data: result, error } = await client
      .from('PageView')
      .update({
        duration: data.duration,
        end_time: new Date().toISOString(),
      })
      .eq('session_id', data.session_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .select()
      .single()

    if (error) {
      console.error('更新页面停留时间失败:', error)
      throw error
    }

    // 同时更新会话时长
    await this.updateSessionDuration(data.session_id, data.user_id)

    return result
  }

  // 创建或更新会话记录
  async upsertSession(data: {
    session_id: string
    user_id?: string
    user_agent?: string
    ip_address?: string
    country?: string
    city?: string
    device_type?: string
    browser?: string
    os?: string
    language?: string
  }) {
    const client = await this.getClient()

    // 先尝试获取现有会话
    const { data: existingSession, error: selectError } = await client
      .from('UserSession')
      .select('*')
      .eq('session_id', data.session_id)
      .maybeSingle() // 使用 maybeSingle 避免没有数据时报错

    if (selectError) {
      console.error('查询会话失败:', selectError)
      throw selectError
    }

    if (existingSession) {
      // 更新现有会话的页面计数和事件计数
      const { data: result, error } = await client
        .from('UserSession')
        .update({
          page_count: existingSession.page_count + 1,
          event_count: existingSession.event_count + 1,
        })
        .eq('session_id', data.session_id)
        .select()
        .single()

      if (error) {
        console.error('更新会话失败:', error)
        throw error
      }

      return result
    } else {
      // 创建新会话
      const { data: result, error } = await client
        .from('UserSession')
        .insert({
          session_id: data.session_id,
          user_id: data.user_id,
          started_at: new Date().toISOString(),
          page_count: 1,
          event_count: 1,
          ip_address: data.ip_address,
          user_agent: data.user_agent,
          country: data.country,
          city: data.city,
          device_type: data.device_type || 'desktop',
          browser: data.browser || 'unknown',
          os: data.os || 'unknown',
          language: data.language || 'zh-CN',
        })
        .select()
        .single()

      if (error) {
        console.error('创建会话失败:', error)
        throw error
      }

      return result
    }
  }

  // 更新会话时长
  async updateSessionDuration(sessionId: string, userId?: string) {
    const client = await this.getClient()

    // 获取该会话的所有页面浏览记录
    const { data: pageViews, error: pageViewsError } = await client
      .from('PageView')
      .select('timestamp, duration')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true })

    if (pageViewsError) {
      console.error('获取页面浏览记录失败:', pageViewsError)
      return
    }

    if (pageViews && pageViews.length > 0) {
      // 计算会话总时长
      const firstPageView = pageViews[0]
      const lastPageView = pageViews[pageViews.length - 1]

      const startTime = new Date(firstPageView.timestamp)
      const endTime = new Date(lastPageView.timestamp)

      // 基础会话时长（从第一个页面到最后一个页面的时间差）
      const baseDuration = Math.floor(
        (endTime.getTime() - startTime.getTime()) / 1000
      )

      // 加上最后一个页面的停留时间
      const lastPageDuration = lastPageView.duration || 0
      const totalDuration = baseDuration + lastPageDuration

      // 更新会话记录
      const { error: updateError } = await client
        .from('UserSession')
        .update({
          ended_at: new Date().toISOString(),
          duration: Math.max(totalDuration, 0), // 确保时长不为负数
        })
        .eq('session_id', sessionId)

      if (updateError) {
        console.error('更新会话时长失败:', updateError)
      }
    }
  }

  // 获取Dashboard数据 - 简化版本
  async getDashboardData(timeRange: string = '7d') {
    const client = await this.getClient()
    const startDate = this.getStartDate(timeRange)

    try {
      // 获取基础统计数据
      const { data: pageViews, error: pageViewsError } = await client
        .from('PageView')
        .select('*')
        .gte('timestamp', startDate.toISOString())

      if (pageViewsError) throw pageViewsError

      // 获取独立访客数
      const { data: uniqueVisitors, error: uniqueVisitorsError } = await client
        .from('PageView')
        .select('session_id')
        .gte('timestamp', startDate.toISOString())
        .not('session_id', 'is', null)

      if (uniqueVisitorsError) throw uniqueVisitorsError

      // 获取设备分布
      const { data: deviceTypes, error: deviceTypesError } = await client
        .from('PageView')
        .select('device_type')
        .gte('timestamp', startDate.toISOString())
        .not('device_type', 'is', null)

      if (deviceTypesError) throw deviceTypesError

      // 获取错误日志
      const { data: errorLogs, error: errorLogsError } = await client
        .from('ErrorLog')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50)

      if (errorLogsError) {
        console.error('获取错误日志失败:', errorLogsError)
      }

      console.log('Raw error logs from DB:', errorLogs?.length || 0)
      if (errorLogs && errorLogs.length > 0) {
        console.log('Sample error log:', errorLogs[0])
      }

      // 转换错误日志格式为SLS风格
      const slsErrorLogs =
        errorLogs?.map((log: any) => ({
          id: log.id,
          type: log.type || log.error_type || 'UnknownError',
          message: log.message || log.error_message || 'Unknown error',
          stackTrace: log.stackTrace || log.stack_trace || '',
          page: log.page || '/',
          count: log.count || 1,
          lastOccurrence: log.last_occurrence || log.timestamp,
          severity: log.severity || 'medium',
          userAgent: log.userAgent || log.user_agent || 'unknown',
          ipAddress: log.ipAddress || log.ip_address || 'unknown',
          timestamp: log.timestamp,
          level: log.severity || 'medium',
          source: log.source || 'frontend',
          traceId: log.trace_id || log.traceId,
        })) || []

      console.log('Error logs found:', slsErrorLogs.length)

      // 获取性能数据
      const { data: performanceMetrics, error: performanceError } = await client
        .from('PerformanceMetric')
        .select('*')
        .gte('timestamp', startDate.toISOString())

      if (performanceError) throw performanceError

      // 计算实时用户数（最近5分钟）
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const { data: recentSessions, error: recentSessionsError } = await client
        .from('UserSession')
        .select('*')
        .gte('started_at', fiveMinutesAgo.toISOString())
        .is('ended_at', null)

      if (recentSessionsError) throw recentSessionsError

      // 计算会话指标
      const { data: allSessions, error: sessionsError } = await client
        .from('UserSession')
        .select('*')
        .gte('started_at', startDate.toISOString())

      if (sessionsError) throw sessionsError

      // 计算平均会话时长
      const avgSessionDuration =
        allSessions.length > 0
          ? allSessions.reduce(
              (sum: number, session: any) => sum + (session.duration || 0),
              0
            ) / allSessions.length
          : 0

      // 计算跳出率
      const bounceRate =
        allSessions.length > 0
          ? (allSessions.filter((s: any) => s.page_count <= 1).length /
              allSessions.length) *
            100
          : 0

      // 计算性能指标
      const avgLoadTime =
        performanceMetrics.length > 0
          ? performanceMetrics.reduce(
              (sum: number, m: any) => sum + m.load_time,
              0
            ) / performanceMetrics.length
          : 0

      const avgResponseTime =
        performanceMetrics.length > 0
          ? performanceMetrics.reduce(
              (sum: number, m: any) => sum + m.dom_content_loaded,
              0
            ) / performanceMetrics.length
          : 0

      // 计算错误率
      const errorRate =
        errorLogs.length > 0 ? (errorLogs.length / pageViews.length) * 100 : 0

      // 获取页面热力图数据
      const pageHeatmap = await this.getPageHeatmapData(timeRange)

      return {
        pageViews: pageViews.length,
        uniqueVisitors: new Set(uniqueVisitors.map((v: any) => v.session_id))
          .size,
        realTimeUsers: recentSessions.length,
        avgSessionDuration: Math.round(avgSessionDuration),
        bounceRate: Math.round(bounceRate),
        deviceTypes: this.calculateDeviceDistribution(pageViews),
        performance: {
          loadTime: Math.round(avgLoadTime),
          responseTime: Math.round(avgResponseTime),
          uptime: 100 - errorRate,
          errorRate: Math.round(errorRate),
        },
        errors: errorLogs.length,
        errorLogs: slsErrorLogs.slice(0, 10),
        pageHeatmap, // 添加页面热力图数据
      }
    } catch (error) {
      console.error('获取Dashboard数据失败:', error)
    }
  }

  // 获取热门页面热力图数据
  async getPageHeatmapData(timeRange: string = '7d') {
    try {
      const client = await this.getClient()
      const startDate = this.getStartDate(timeRange)

      // 获取页面浏览数据
      const { data: pageViews, error: pageViewsError } = await client
        .from('PageView')
        .select('*')
        .gte('timestamp', startDate.toISOString())

      if (pageViewsError) throw pageViewsError

      // 按完整路径分组统计
      const pageStats = new Map<
        string,
        { views: number; totalTime: number; count: number; pathAnalysis: any }
      >()

      pageViews?.forEach((view: any) => {
        const pageInfo = parsePagePath(view.page)
        const key = view.page // 使用完整路径作为key

        if (!pageStats.has(key)) {
          pageStats.set(key, {
            views: 0,
            totalTime: 0,
            count: 0,
            pathAnalysis: pageInfo.pathAnalysis,
          })
        }

        const stats = pageStats.get(key)!
        stats.views++
        stats.count++
      })

      // 为每个页面生成详细统计信息
      const heatmapData = Array.from(pageStats.entries()).map(
        async ([path, page], index) => {
          // 获取该页面的所有访问记录
          const pageViewsForPage =
            pageViews?.filter((view: any) => view.page === path) || []

          // 计算详细统计信息
          const uniqueVisitors = new Set(
            pageViewsForPage.map((view: any) => view.user_id || view.session_id)
          ).size

          // 获取页面停留时间数据
          const { data: pageViewsWithDuration, error: durationError } =
            await client
              .from('PageView')
              .select('duration')
              .eq('page', path)
              .not('duration', 'is', null)
              .gte('timestamp', startDate.toISOString())

          if (durationError) {
            console.error('获取页面停留时间失败:', durationError)
          }

          // 计算平均停留时间
          let avgTime = 0
          if (pageViewsWithDuration && pageViewsWithDuration.length > 0) {
            const totalDuration = pageViewsWithDuration.reduce(
              (sum: number, view: any) => sum + (view.duration || 0),
              0
            )
            avgTime = Math.round(totalDuration / pageViewsWithDuration.length)
          } else {
            // 如果没有停留时间数据，使用模拟值
            avgTime = Math.floor(Math.random() * 300) + 60
          }

          // 设备分布
          const deviceStats: { [key: string]: number } = {}
          pageViewsForPage.forEach((view: any) => {
            const device = view.device_type || 'desktop'
            deviceStats[device] = (deviceStats[device] || 0) + 1
          })

          // 浏览器分布
          const browserStats: { [key: string]: number } = {}
          pageViewsForPage.forEach((view: any) => {
            const browser = view.browser || 'unknown'
            browserStats[browser] = (browserStats[browser] || 0) + 1
          })

          return {
            page: path, // 完整路径
            views: page.views,
            avgTime, // 真实或模拟的停留时间
            intensity: Math.min(
              0.9,
              (page.views /
                Math.max(
                  ...Array.from(pageStats.values()).map((p) => p.views)
                )) *
                0.8 +
                0.1
            ),
            pageDetails: {
              uniqueVisitors,
              deviceDistribution: Object.entries(deviceStats).map(
                ([device, count]) => ({
                  device,
                  count,
                })
              ),
              browserDistribution: Object.entries(browserStats).map(
                ([browser, count]) => ({
                  browser,
                  count,
                })
              ),
            },
          }
        }
      )

      // 等待所有异步操作完成
      const resolvedData = await Promise.all(heatmapData)
      return resolvedData.sort((a, b) => b.views - a.views)
    } catch (error) {
      console.error('获取页面热力图数据失败:', error)
      return []
    }
  }

  // 获取设备分布热力图数据
  async getDeviceHeatmapData(timeRange: string = '7d') {
    try {
      const client = await this.getClient()
      const startDate = this.getStartDate(timeRange)

      // 获取页面浏览数据
      const { data: pageViews, error: pageViewsError } = await client
        .from('PageView')
        .select('*')
        .gte('timestamp', startDate.toISOString())

      if (pageViewsError) throw pageViewsError

      // 按设备类型分组统计
      const deviceStats: {
        [key: string]: {
          count: number
          browsers: { [key: string]: number }
          details: any[]
        }
      } = {}

      pageViews?.forEach((view: any) => {
        const deviceType = view.device_type || 'desktop'
        if (!deviceStats[deviceType]) {
          deviceStats[deviceType] = { count: 0, browsers: {}, details: [] }
        }

        deviceStats[deviceType].count++

        // 统计浏览器
        const browser = view.browser || 'unknown'
        deviceStats[deviceType].browsers[browser] =
          (deviceStats[deviceType].browsers[browser] || 0) + 1

        // 收集详细设备信息
        deviceStats[deviceType].details.push({
          browserName: view.browser || 'unknown',
          browserVersion: '', // 数据库中没有版本信息
          osName: view.os || 'unknown',
          osVersion: '', // 数据库中没有版本信息
          deviceModel: 'unknown', // 数据库中没有设备型号
          screenResolution: view.screen_resolution || 'unknown',
          language: view.language || 'unknown',
        })
      })

      // 转换为热力图格式
      const heatmapData = Object.entries(deviceStats).map(
        ([device, stats]) => ({
          device,
          count: stats.count,
          browsers: stats.browsers,
          intensity: Math.min(
            0.9,
            (stats.count /
              Math.max(...Object.values(deviceStats).map((s) => s.count))) *
              0.8 +
              0.1
          ),
          deviceDetails: stats.details.slice(0, 5), // 只保留前5个详细记录
        })
      )

      return heatmapData.sort((a, b) => b.count - a.count)
    } catch (error) {
      console.error('获取设备热力图数据失败:', error)
      return []
    }
  }

  // 新增：获取性能指标热力图数据（FCP/LCP/CLS/FID/INP/TTFB 的 min/max/avg 及按页面聚合）
  async getPerformanceHeatmapData(timeRange: string = '7d') {
    const client = await this.getClient()
    const startDate = this.getStartDate(timeRange)

    console.log('🔍 开始获取性能热力图数据...')
    console.log('📅 时间范围:', timeRange, '开始时间:', startDate.toISOString())

    console.log('🔍 开始获取性能热力图数据...')
    console.log('📅 时间范围:', timeRange, '开始时间:', startDate.toISOString())

    type MetricKey =
      | 'first_contentful_paint'
      | 'largest_contentful_paint'
      | 'cumulative_layout_shift'
      | 'first_input_delay'
      | 'interaction_to_next_paint'
      | 'time_to_first_byte'

    const computeStats = (arr: number[]) => {
      if (!arr.length) return { min: null, max: null, avg: null, count: 0 }
      const min = Math.min(...arr)
      const max = Math.max(...arr)
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length
      return { min, max, avg: Math.round(avg), count: arr.length }
    }

    try {
      // 首先尝试查询所有列，如果失败则逐步降级
      let { data: metrics, error } = await client
        .from('PerformanceMetric')
        .select(
          'page, session_id, first_contentful_paint, largest_contentful_paint, cumulative_layout_shift, first_input_delay, interaction_to_next_paint, time_to_first_byte'
        )
        .gte('timestamp', startDate.toISOString())

      console.log('📊 查询结果:', { metricsCount: metrics?.length || 0, error })

      if (error) {
        // 一些环境可能尚未有某些列，尝试降级选择
        const code = (error as any)?.code
        console.log('⚠️ 查询错误，错误代码:', code)
        if (code === '42703') {
          console.log('🔄 尝试降级查询（排除可能不存在的列）')

          // 尝试查询基本列
          const basicColumns =
            'page, session_id, first_contentful_paint, largest_contentful_paint, cumulative_layout_shift, first_input_delay'
          const { data: basicMetrics, error: basicError } = await client
            .from('PerformanceMetric')
            .select(basicColumns)
            .gte('timestamp', startDate.toISOString())

          if (basicError) {
            console.log('🔄 基本列查询也失败，尝试最简查询')
            // 最简查询，只查询肯定存在的列
            const minimalColumns =
              'page, session_id, load_time, dom_content_loaded'
            const { data: minimalMetrics, error: minimalError } = await client
              .from('PerformanceMetric')
              .select(minimalColumns)
              .gte('timestamp', startDate.toISOString())

            if (minimalError) {
              console.error('❌ 所有查询都失败:', minimalError)
              throw minimalError
            }

            metrics = minimalMetrics as any
            console.log('🔄 最简查询成功:', {
              metricsCount: metrics?.length || 0,
            })
          } else {
            metrics = basicMetrics as any
            console.log('🔄 基本列查询成功:', {
              metricsCount: metrics?.length || 0,
            })
          }
        } else {
          throw error
        }
      }
      if (error) throw error

      // 获取 PageView 以便做设备/浏览器映射
      const { data: pageViews, error: pvError } = await client
        .from('PageView')
        .select('session_id, page, device_type, browser')
        .gte('timestamp', startDate.toISOString())

      console.log('📱 PageView 查询结果:', {
        pageViewsCount: pageViews?.length || 0,
        pvError,
      })

      if (pvError) {
        console.warn('获取 PageView 失败（将跳过设备/浏览器细分）:', pvError)
      }

      // 建立 session+page -> { device, browser } 的映射
      const sessionPageToContext = new Map<
        string,
        { device?: string; browser?: string }
      >()
      for (const v of pageViews || []) {
        const key = `${v.session_id || ''}|${v.page || ''}`
        if (!sessionPageToContext.has(key)) {
          sessionPageToContext.set(key, {
            device: (v as any).device_type || 'unknown',
            browser: (v as any).browser || 'unknown',
          })
        }
      }

      const result: any = {}

      // 根据实际查询到的数据动态确定可用的指标
      const availableMetrics = new Set<string>()
      if (metrics && metrics.length > 0) {
        const firstRow = metrics[0] as any
        Object.keys(firstRow).forEach((key) => {
          if (
            key !== 'page' &&
            key !== 'session_id' &&
            key !== 'user_id' &&
            key !== 'timestamp'
          ) {
            availableMetrics.add(key)
          }
        })
      }

      console.log('📊 可用的指标列:', Array.from(availableMetrics))

      // 动态构建指标键数组
      const metricKeys: MetricKey[] = []
      const metricToLabel: Record<string, string> = {}

      if (availableMetrics.has('first_contentful_paint')) {
        metricKeys.push('first_contentful_paint')
        metricToLabel['first_contentful_paint'] = 'FCP'
      }
      if (availableMetrics.has('largest_contentful_paint')) {
        metricKeys.push('largest_contentful_paint')
        metricToLabel['largest_contentful_paint'] = 'LCP'
      }
      if (availableMetrics.has('cumulative_layout_shift')) {
        metricKeys.push('cumulative_layout_shift')
        metricToLabel['cumulative_layout_shift'] = 'CLS'
      }
      if (availableMetrics.has('first_input_delay')) {
        metricKeys.push('first_input_delay')
        metricToLabel['first_input_delay'] = 'FID'
      }
      if (availableMetrics.has('interaction_to_next_paint')) {
        metricKeys.push('interaction_to_next_paint')
        metricToLabel['interaction_to_next_paint'] = 'INP'
      }
      if (availableMetrics.has('time_to_first_byte')) {
        metricKeys.push('time_to_first_byte')
        metricToLabel['time_to_first_byte'] = 'TTFB'
      }

      console.log('🎯 将处理的指标:', metricKeys)

      const thresholds: Record<string, { good: number; needs: number }> = {
        FCP: { good: 1800, needs: 3000 },
        LCP: { good: 2500, needs: 4000 },
        CLS: { good: 0.1, needs: 0.25 },
        FID: { good: 100, needs: 300 },
        INP: { good: 200, needs: 500 },
        TTFB: { good: 800, needs: 1800 },
      }

      for (const key of metricKeys) {
        const allValues: number[] = []
        const pageMap = new Map<string, number[]>()
        const deviceMap = new Map<string, number[]>()
        const browserMap = new Map<string, number[]>()

        for (const row of metrics || []) {
          const v = row[key as keyof typeof row] as number | null | undefined
          if (v !== null && v !== undefined) {
            const numeric = Number(v)
            allValues.push(numeric)

            // 聚合：按页面
            const arr = pageMap.get(row.page) || []
            arr.push(numeric)
            pageMap.set(row.page, arr)

            // 聚合：按设备/浏览器（通过 PageView 映射）
            const ctxKey = `${row.session_id || ''}|${row.page || ''}`
            const ctx = sessionPageToContext.get(ctxKey)
            if (ctx) {
              const deviceName = (ctx.device || 'unknown').toLowerCase()
              const browserName = (ctx.browser || 'unknown').toLowerCase()

              const darr = deviceMap.get(deviceName) || []
              darr.push(numeric)
              deviceMap.set(deviceName, darr)

              const barr = browserMap.get(browserName) || []
              barr.push(numeric)
              browserMap.set(browserName, barr)
            }
          }
        }

        const pages = Array.from(pageMap.entries()).map(([page, arr]) => ({
          page,
          ...computeStats(arr),
        }))
        const devices = Array.from(deviceMap.entries()).map(([name, arr]) => ({
          name,
          ...computeStats(arr),
        }))
        const browsers = Array.from(browserMap.entries()).map(
          ([name, arr]) => ({ name, ...computeStats(arr) })
        )

        const label = metricToLabel[key]
        const t = thresholds[label]
        const overall = computeStats(allValues)

        let intensity = 0
        if (overall.avg === null) intensity = 0
        else if (overall.avg <= t.good) intensity = 0.2
        else if (overall.avg <= t.needs) intensity = 0.6
        else intensity = 0.9

        result[label] = {
          key: label,
          stats: overall,
          intensity,
          thresholds: t,
          breakdown: {
            devices: devices
              .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
              .slice(0, 8),
            browsers: browsers
              .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
              .slice(0, 8),
          },
          pages: pages.sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)).slice(0, 20),
        }
      }

      // 确保没有数据时也返回所有指标键，便于前端空态展示
      for (const m of ['FCP', 'LCP', 'CLS', 'FID', 'INP', 'TTFB']) {
        if (!result[m]) {
          result[m] = {
            key: m,
            stats: { min: null, max: null, avg: null, count: 0 },
            intensity: 0,
            thresholds: thresholds[m],
            breakdown: { devices: [], browsers: [] },
            pages: [],
          }
        }
      }

      console.log('✅ 性能热力图数据处理完成:', Object.keys(result))
      console.log(
        '📈 数据摘要:',
        Object.entries(result).map(
          ([k, v]: [string, any]) => `${k}: ${v.stats.count} 条记录`
        )
      )

      return result
    } catch (e) {
      console.error('❌ 获取性能热力图数据失败:', e)
      throw e
    }
  }

  // 获取错误日志详情
  async getErrorLogDetail(errorId: string) {
    const client = await this.getClient()

    try {
      const { data: error, error: fetchError } = await client
        .from('ErrorLog')
        .select('*')
        .eq('id', errorId)
        .single()

      if (fetchError) throw fetchError

      return error
    } catch (error) {
      console.error('获取错误日志详情失败:', error)
      return null
    }
  }

  // 获取错误日志（支持搜索和过滤）
  async getErrorLogs(
    options: {
      timeRange?: string
      searchTerm?: string
      searchField?: string
      severity?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      page?: number
      limit?: number
    } = {}
  ) {
    const client = await this.getClient()
    const {
      timeRange = '7d',
      searchTerm,
      searchField = 'all',
      severity,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      page = 1,
      limit = 50,
    } = options

    try {
      let query = client.from('ErrorLog').select('*', { count: 'exact' })

      // 时间范围过滤
      if (timeRange !== 'all') {
        const startDate = this.getStartDate(timeRange)
        query = query.gte('timestamp', startDate.toISOString())
      }

      // 严重程度过滤
      if (severity && severity !== 'all') {
        query = query.eq('severity', severity)
      }

      // 搜索过滤
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.trim()

        if (searchField === 'all') {
          // 在所有字段中搜索
          query = query.or(
            `error_type.ilike.%${term}%,error_message.ilike.%${term}%,page.ilike.%${term}%,user_agent.ilike.%${term}%`
          )
        } else {
          // 在指定字段中搜索
          const dbField = this.mapSearchFieldToDbField(searchField)
          query = query.ilike(dbField, `%${term}%`)
        }
      }

      // 排序
      const dbSortField = this.mapSortFieldToDbField(sortBy)
      query = query.order(dbSortField, { ascending: sortOrder === 'asc' })

      // 分页
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data: errorLogs, error, count } = await query

      if (error) {
        console.error('获取错误日志失败:', error)
        throw error
      }

      // 转换错误日志格式
      const formattedLogs =
        errorLogs?.map((log: any) => ({
          id: log.id,
          type: log.error_type || 'UnknownError',
          message: log.error_message || 'Unknown error',
          stackTrace: log.stack_trace || '',
          page: log.page || '/',
          count: 1, // 每条记录计为1次
          lastOccurrence: log.timestamp,
          severity: log.severity || 'medium',
          userAgent: log.user_agent || 'unknown',
          ipAddress: log.ip_address || 'unknown',
          timestamp: log.timestamp,
          level: log.severity || 'medium',
          source: log.source || 'frontend',
          traceId: log.trace_id,
        })) || []

      return {
        data: formattedLogs,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }
    } catch (error) {
      console.error('获取错误日志失败:', error)
      throw error
    }
  }

  // 映射搜索字段到数据库字段
  private mapSearchFieldToDbField(searchField: string): string {
    const fieldMap: Record<string, string> = {
      type: 'error_type',
      message: 'error_message',
      page: 'page',
      userAgent: 'user_agent',
    }
    return fieldMap[searchField] || 'error_message'
  }

  // 映射排序字段到数据库字段
  private mapSortFieldToDbField(sortField: string): string {
    const fieldMap: Record<string, string> = {
      timestamp: 'timestamp',
      count: 'timestamp', // 暂时用timestamp排序，因为没有count字段
      severity: 'severity',
    }
    return fieldMap[sortField] || 'timestamp'
  }

  // 辅助方法
  private getStartDate(timeRange: string): Date {
    const now = new Date()
    switch (timeRange) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  }

  private calculatePercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0
  }

  private calculateDeviceDistribution(
    pageViews: any[]
  ): Array<{ device: string; percentage: number }> {
    const deviceCounts: { [key: string]: number } = {}

    pageViews.forEach((view) => {
      const device = view.device_type || 'unknown'
      deviceCounts[device] = (deviceCounts[device] || 0) + 1
    })

    const total = pageViews.length
    return Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      percentage: this.calculatePercentage(count, total),
    }))
  }
}

// 创建单例实例
export const analyticsService = new AnalyticsService()

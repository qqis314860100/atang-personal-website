import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/database/analytics'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type,
      page,
      sessionId,
      userId,
      userAgent,
      ipAddress,
      referrer,
      country,
      city,
      deviceType,
      browser,
      os,
      screenResolution,
      language,
      eventName,
      eventType,
      properties,
      value,
      performanceMetrics,
      errorData,
    } = body

    // 获取真实IP地址
    const realIp =
      ipAddress ||
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown'

    switch (type) {
      case 'pageview':
        // 记录页面浏览
        await analyticsService.recordPageView({
          page: page || '/',
          user_id: userId,
          session_id: sessionId,
          user_agent: userAgent,
          ip_address: realIp,
          referrer,
          country,
          city,
          device_type: deviceType || 'desktop',
          browser: browser || 'unknown',
          os: os || 'unknown',
          screen_resolution: screenResolution,
          language: language || 'zh-CN',
        })

        // 同时创建或更新会话记录
        await analyticsService.upsertSession({
          session_id: sessionId,
          user_id: userId,
          user_agent: userAgent,
          ip_address: realIp,
          country,
          city,
          device_type: deviceType || 'desktop',
          browser: browser || 'unknown',
          os: os || 'unknown',
          language: language || 'zh-CN',
        })
        break

      case 'event':
        await analyticsService.recordUserEvent({
          event_type: eventType,
          event_name: eventName,
          page: page || '/',
          user_id: userId,
          session_id: sessionId,
          properties: properties || {},
          value,
        })
        break

      case 'performance':
        if (performanceMetrics) {
          await analyticsService.recordPerformanceMetric({
            page: page || '/',
            load_time: performanceMetrics.loadTime || 0,
            dom_content_loaded: performanceMetrics.domContentLoaded || 0,
            first_contentful_paint: performanceMetrics.firstContentfulPaint,
            largest_contentful_paint: performanceMetrics.largestContentfulPaint,
            cumulative_layout_shift: performanceMetrics.cumulativeLayoutShift,
            first_input_delay: performanceMetrics.firstInputDelay,
            session_id: sessionId,
            user_id: userId,
          })
        }
        break

      case 'error':
        await analyticsService.recordErrorLog({
          type: errorData?.error_type || body.error_type || 'UnknownError',
          message:
            errorData?.error_message ||
            body.error_message ||
            'Unknown error occurred',
          stackTrace:
            errorData?.stack_trace || body.stackTrace || body.stack || '',
          page: page || '/',
          userAgent: userAgent || 'unknown',
          ipAddress: realIp,
          severity: errorData?.severity || body.severity || 'medium',
          userId: userId,
          sessionId: sessionId,
          timestamp: errorData?.timestamp || body.timestamp,
          source: errorData?.source || body.source || 'frontend',
          traceId: errorData?.traceId || body.traceId,
        })
        break

      case 'page_duration':
        // 处理页面停留时间数据
        await analyticsService.recordPageDuration({
          duration: body.duration || 0,
          session_id: sessionId,
          user_id: userId,
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: '未知的事件类型' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('数据收集失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '数据收集失败',
      },
      { status: 500 }
    )
  }
}

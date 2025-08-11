import { analyticsService } from '@/lib/database/analytics'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)

  try {
    // 记录请求信息
    // console.log(`📊 [${requestId}] Analytics API 请求:`, {
    //   method: req.method,
    //   url: req.url,
    //   contentType: req.headers.get('content-type'),
    //   contentLength: req.headers.get('content-length'),
    //   userAgent: req.headers.get('user-agent'),
    //   referer: req.headers.get('referer'),
    // })

    // 检查请求体是否为空
    const contentType = req.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`❌ [${requestId}] 无效的内容类型:`, contentType)
      return NextResponse.json(
        { success: false, error: '请求内容类型必须是 application/json' },
        { status: 400 }
      )
    }

    // 安全地解析JSON
    let body
    try {
      const text = await req.text()
      console.log(`📝 [${requestId}] 请求体长度:`, text.length)

      if (!text || text.trim() === '') {
        console.warn(`❌ [${requestId}] 请求体为空`)
        return NextResponse.json(
          { success: false, error: '请求体不能为空' },
          { status: 400 }
        )
      }

      body = JSON.parse(text)
      console.log(`✅ [${requestId}] JSON解析成功，事件类型:`, body?.type)
    } catch (parseError) {
      console.error(`❌ [${requestId}] JSON解析失败:`, parseError)
      return NextResponse.json(
        { success: false, error: '无效的JSON格式' },
        { status: 400 }
      )
    }

    // 验证必需的字段
    if (!body || typeof body !== 'object') {
      console.warn(`❌ [${requestId}] 请求体不是有效对象:`, typeof body)
      return NextResponse.json(
        { success: false, error: '请求体必须是有效的JSON对象' },
        { status: 400 }
      )
    }

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

    // 验证事件类型
    if (!type) {
      console.warn(`❌ [${requestId}] 缺少事件类型`)
      return NextResponse.json(
        { success: false, error: '缺少必需的事件类型' },
        { status: 400 }
      )
    }

    // 获取真实IP地址
    const realIp =
      ipAddress ||
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown'

    console.log(`🔄 [${requestId}] 处理事件类型:`, type)

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
        console.warn(`❌ [${requestId}] 未知的事件类型:`, type)
        return NextResponse.json(
          { success: false, error: '未知的事件类型' },
          { status: 400 }
        )
    }

    const responseTime = Date.now() - startTime
    console.log(`✅ [${requestId}] 事件处理成功:`, {
      type,
      responseTime: `${responseTime}ms`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`❌ [${requestId}] 数据收集失败:`, error, {
      responseTime: `${responseTime}ms`,
    })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '数据收集失败',
      },
      { status: 500 }
    )
  }
}

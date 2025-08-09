import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/lib/database/analytics'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 验证必需字段
    if (!data.page || !data.session_id) {
      return NextResponse.json(
        { error: '缺少必需字段：page 和 session_id' },
        { status: 400 }
      )
    }

    // 转换Web Vitals数据为PerformanceMetric格式
    const performanceData = {
      page: data.page,
      session_id: data.session_id,
      user_id: data.user_id,
      load_time: data.load_time || 0,
      dom_content_loaded: data.dom_content_loaded || 0,
      time_to_first_byte: data.ttfb,
      first_paint: data.first_paint,
      first_contentful_paint: data.fcp,
      largest_contentful_paint: data.lcp,
      first_input_delay: data.fid,
      interaction_to_next_paint: data.inp,
      total_blocking_time: data.total_blocking_time,
      cumulative_layout_shift: data.cls,
    }

    // 保存到数据库
    await analyticsService.recordPerformanceMetric(performanceData)

    // 如果是最终报告，记录性能摘要
    if (data.metric_type === 'final' && data.performance_score !== undefined) {
      console.log(
        `📊 页面 ${data.page} 性能评分: ${data.performance_score} (${data.performance_grade})`
      )
    }

    return NextResponse.json({
      success: true,
      score: data.performance_score,
      grade: data.performance_grade,
    })
  } catch (error) {
    console.error('Web Vitals数据保存失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

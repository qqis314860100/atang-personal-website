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

    // 保存性能数据到数据库
    await analyticsService.recordPerformanceMetric({
      page: data.page,
      session_id: data.session_id,
      user_id: data.user_id,
      load_time: data.load_time,
      dom_content_loaded: data.dom_content_loaded,
      time_to_first_byte: data.time_to_first_byte,
      first_paint: data.first_paint,
      first_contentful_paint: data.first_contentful_paint,
      largest_contentful_paint: data.largest_contentful_paint,
      first_input_delay: data.first_input_delay,
      interaction_to_next_paint: data.interaction_to_next_paint,
      total_blocking_time: data.total_blocking_time,
      cumulative_layout_shift: data.cumulative_layout_shift,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('性能数据保存失败:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

/**
 * 埋点数据收集 API
 *
 * 接收来自客户端的埋点事件数据，验证后存储到数据库。
 *
 * 功能：
 * - 验证事件数据的完整性
 * - 将事件数据存储到 AnalyticsEvent 表
 * - 提供错误处理和响应
 *
 * 请求格式：
 * ```json
 * {
 *   "eventId": "uuid",
 *   "timestamp": "2024-01-01T00:00:00Z",
 *   "sessionId": "session-uuid",
 *   "userId": "user-id",
 *   "module": "blog",
 *   "version": "1.0.0",
 *   "metadata": { ... }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    /**
     * 验证事件数据的完整性
     * 确保必要字段存在且格式正确
     */
    if (!event.eventId || !event.timestamp || !event.module) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
    }

    /**
     * 将事件数据存储到数据库
     *
     * 存储的信息包括：
     * - eventId: 事件唯一标识符
     * - eventType: 事件类型（对应 module 字段）
     * - eventData: 完整的事件数据（JSON 格式）
     * - userId: 用户标识符（可选）
     * - sessionId: 会话标识符
     * - timestamp: 事件发生时间
     * - module: 事件来源模块
     * - version: 埋点系统版本
     */
    await prisma.analyticsEvent.create({
      data: {
        eventId: event.eventId,
        eventType: event.module,
        eventData: event,
        userId: event.userId,
        sessionId: event.sessionId,
        timestamp: new Date(event.timestamp),
        module: event.module,
        version: event.version || '1.0.0',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

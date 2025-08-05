import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// 内存中存储在线访客信息
const onlineVisitors = new Map<
  string,
  {
    id: string
    lastSeen: number
    userAgent: string
    ip: string
  }
>()

// 清理超时的访客（5分钟无活动）
const cleanupVisitors = () => {
  const now = Date.now()
  const timeout = 5 * 60 * 1000 // 5分钟

  for (const [id, visitor] of onlineVisitors.entries()) {
    if (now - visitor.lastSeen > timeout) {
      onlineVisitors.delete(id)
    }
  }
}

// 定期清理
setInterval(cleanupVisitors, 60000) // 每分钟清理一次

export async function GET(request: NextRequest) {
  try {
    cleanupVisitors()

    return NextResponse.json({
      success: true,
      count: onlineVisitors.size,
      visitors: Array.from(onlineVisitors.values()),
    })
  } catch (error) {
    console.error('获取在线访客失败:', error)
    return NextResponse.json(
      { success: false, error: '获取在线访客失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { visitorId, userAgent } = await request.json()
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: '访客ID不能为空' },
        { status: 400 }
      )
    }

    // 更新或添加访客
    onlineVisitors.set(visitorId, {
      id: visitorId,
      lastSeen: Date.now(),
      userAgent: userAgent || 'unknown',
      ip,
    })

    return NextResponse.json({
      success: true,
      count: onlineVisitors.size,
    })
  } catch (error) {
    console.error('更新在线访客失败:', error)
    return NextResponse.json(
      { success: false, error: '更新在线访客失败' },
      { status: 500 }
    )
  }
}

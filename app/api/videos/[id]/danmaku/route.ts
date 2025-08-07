import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// 辅助函数：将包含 BigInt 的对象转换为可序列化的对象
function serializeBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'bigint') {
    return obj.toString()
  }

  // 处理 Date 对象
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts)
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInts(value)
    }
    return result
  }

  return obj
}

// GET /api/videos/[id]/danmaku - 获取视频弹幕列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const danmaku = await prisma.danmaku.findMany({
      where: {
        videoId: resolvedParams.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // 序列化 BigInt 字段
    const serializedDanmaku = serializeBigInts(danmaku)
    return NextResponse.json({ danmaku: serializedDanmaku })
  } catch (error) {
    console.error('获取弹幕失败:', error)
    return NextResponse.json({ error: '获取弹幕失败' }, { status: 500 })
  }
}

// POST /api/videos/[id]/danmaku - 发送弹幕
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const data = await request.json()
    const { content, timeMs, type, color, userId } = data

    // 验证必要字段
    if (!content || timeMs == null || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 })
    }

    // 创建弹幕
    const danmaku = await prisma.danmaku.create({
      data: {
        videoId: resolvedParams.id,
        userId,
        content,
        timeMs,
        type,
        color: color || 16777215, // 默认白色
        timestampMs: BigInt(Date.now()),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    })

    // 更新视频的弹幕计数
    const danmakuCount = await prisma.danmaku.count({
      where: {
        videoId: resolvedParams.id,
      },
    })

    await prisma.video.update({
      where: { id: resolvedParams.id },
      data: { danmakuCount },
    })

    // 序列化 BigInt 字段
    const serializedDanmaku = serializeBigInts(danmaku)
    return NextResponse.json({ danmaku: serializedDanmaku })
  } catch (error) {
    console.error('发送弹幕失败:', error)
    return NextResponse.json({ error: '发送弹幕失败' }, { status: 500 })
  }
}

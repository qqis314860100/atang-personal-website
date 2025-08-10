import { prisma } from '@/lib/prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/videos/[id]/danmaku/stats - 获取弹幕统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取弹幕总数
    const totalCount = await prisma.danmaku.count({
      where: { videoId: id },
    })

    // 获取各类型弹幕数量
    const scrollCount = await prisma.danmaku.count({
      where: {
        videoId: id,
        type: 1, // 滚动弹幕
      },
    })

    const topCount = await prisma.danmaku.count({
      where: {
        videoId: id,
        type: 5, // 顶部弹幕
      },
    })

    const bottomCount = await prisma.danmaku.count({
      where: {
        videoId: id,
        type: 4, // 底部弹幕
      },
    })

    const reverseCount = await prisma.danmaku.count({
      where: {
        videoId: id,
        type: 6, // 反向弹幕
      },
    })

    const advancedCount = await prisma.danmaku.count({
      where: {
        videoId: id,
        type: 7, // 高级弹幕
      },
    })

    const stats = {
      totalCount,
      scrollCount,
      topCount,
      bottomCount,
      reverseCount,
      advancedCount,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取弹幕统计失败:', error)
    return NextResponse.json({ error: '获取弹幕统计失败' }, { status: 500 })
  }
}

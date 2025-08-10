import { prisma } from '@/lib/prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/videos/[id]/danmaku/distribution - 获取弹幕时间分布
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const bucketSize = parseInt(searchParams.get('bucketSize') || '60') // 默认60秒一个桶

    // 获取视频的总时长（毫秒）
    const video = await prisma.video.findUnique({
      where: { id: resolvedParams.id },
      select: { duration: true },
    })

    if (!video) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    const totalDurationMs = video.duration || 0
    const totalDurationSeconds = Math.ceil(totalDurationMs / 1000)
    const bucketCount = Math.ceil(totalDurationSeconds / bucketSize)

    // 创建时间桶
    const timeBuckets = []
    for (let i = 0; i < bucketCount; i++) {
      const startTime = i * bucketSize
      const endTime = Math.min((i + 1) * bucketSize, totalDurationSeconds)

      // 查询这个时间范围内的弹幕数量
      const danmakuCount = await prisma.danmaku.count({
        where: {
          videoId: resolvedParams.id,
          timeMs: {
            gte: startTime * 1000, // 转换为毫秒
            lt: endTime * 1000,
          },
        },
      })

      timeBuckets.push({
        timeBucket: startTime,
        danmakuCount,
        startTimeMs: startTime * 1000,
        endTimeMs: endTime * 1000,
      })
    }

    return NextResponse.json({
      distribution: timeBuckets,
      bucketSize,
      totalDurationSeconds,
      totalBuckets: bucketCount,
    })
  } catch (error) {
    console.error('获取弹幕时间分布失败:', error)
    return NextResponse.json({ error: '获取弹幕时间分布失败' }, { status: 500 })
  }
}

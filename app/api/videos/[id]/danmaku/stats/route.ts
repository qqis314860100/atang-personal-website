import { NextRequest, NextResponse } from 'next/server'
import { DanmakuService } from '@/lib/services/danmaku-service'

// GET /api/videos/[id]/danmaku/stats - 获取弹幕统计
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const stats = await DanmakuService.getDanmakuStats(id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching danmaku stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch danmaku stats' },
      { status: 500 }
    )
  }
}

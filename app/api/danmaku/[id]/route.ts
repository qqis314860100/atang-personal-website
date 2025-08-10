import { prisma } from '@/lib/prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// DELETE /api/danmaku/[id] - 删除弹幕
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    // 检查弹幕是否存在
    const danmaku = await prisma.danmaku.findUnique({
      where: { id },
      select: { videoId: true },
    })

    if (!danmaku) {
      return NextResponse.json({ error: '弹幕不存在' }, { status: 404 })
    }

    // 删除弹幕
    await prisma.danmaku.delete({
      where: { id },
    })

    // 更新视频的弹幕计数
    const danmakuCount = await prisma.danmaku.count({
      where: {
        videoId: danmaku.videoId,
      },
    })

    await prisma.video.update({
      where: { id: danmaku.videoId },
      data: { danmakuCount },
    })

    return NextResponse.json({ message: '弹幕删除成功' })
  } catch (error) {
    console.error('删除弹幕失败:', error)
    return NextResponse.json({ error: '删除弹幕失败' }, { status: 500 })
  }
}

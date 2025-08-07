import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/test-videos - 测试视频API
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      where: {
        isDeleted: false,
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
      take: 5,
    })

    return NextResponse.json({
      success: true,
      count: videos.length,
      videos,
    })
  } catch (error) {
    console.error('测试视频API失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: '测试视频API失败',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

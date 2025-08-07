import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// POST /api/videos/[id]/view - 增加观看次数
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    await prisma.video.update({
      where: { id: resolvedParams.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('增加观看次数失败:', error)
    return NextResponse.json({ error: '增加观看次数失败' }, { status: 500 })
  }
}

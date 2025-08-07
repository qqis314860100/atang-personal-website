import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// 辅助函数：序列化包含 Date 的对象
function serializeDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeDates)
  }

  if (typeof obj === 'object') {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeDates(value)
    }
    return result
  }

  return obj
}

// GET /api/videos/[id] - 获取单个视频
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const video = await prisma.video.findFirst({
      where: {
        id: resolvedParams.id,
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
    })

    if (!video) {
      return NextResponse.json({ error: '视频不存在' }, { status: 404 })
    }

    // 序列化 Date 对象
    const serializedVideo = serializeDates(video)
    return NextResponse.json(serializedVideo)
  } catch (error) {
    console.error('获取视频失败:', error)
    return NextResponse.json({ error: '获取视频失败' }, { status: 500 })
  }
}

// PUT /api/videos/[id] - 更新视频
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const data = await request.json()
    const video = await prisma.video.update({
      where: { id: resolvedParams.id },
      data,
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

    // 序列化 Date 对象
    const serializedVideo = serializeDates(video)
    return NextResponse.json(serializedVideo)
  } catch (error) {
    console.error('更新视频失败:', error)
    return NextResponse.json({ error: '更新视频失败' }, { status: 500 })
  }
}

// DELETE /api/videos/[id] - 删除视频
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    await prisma.video.update({
      where: { id: resolvedParams.id },
      data: { isDeleted: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除视频失败:', error)
    return NextResponse.json({ error: '删除视频失败' }, { status: 500 })
  }
}

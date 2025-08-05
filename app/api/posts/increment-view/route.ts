import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json({ error: '缺少文章ID' }, { status: 400 })
    }

    // 增加阅读量
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        viewCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      viewCount: post.viewCount,
    })
  } catch (error) {
    console.error('增加阅读量失败:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}

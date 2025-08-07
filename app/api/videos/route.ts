import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/videos - 获取视频列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const userId = searchParams.get('userId') || undefined

    const skip = (page - 1) * limit

    const where: any = {
      isPublic: true,
      isDeleted: false,
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (userId) {
      where.userId = userId
    }

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.video.count({ where }),
    ])

    return NextResponse.json({
      videos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('获取视频列表失败:', error)
    return NextResponse.json({ error: '获取视频列表失败' }, { status: 500 })
  }
}

// POST /api/videos - 创建视频
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 验证用户身份
    const supabase = await createAdminClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 验证用户是否存在
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    })

    if (!userProfile) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const video = await prisma.video.create({
      data: {
        ...data,
        userId: user.id, // 使用认证的用户ID
        tags: data.tags || [],
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

    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('创建视频失败:', error)
    return NextResponse.json({ error: '创建视频失败' }, { status: 500 })
  }
}

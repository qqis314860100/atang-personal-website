'use server'

import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import {
  createPostSchema,
  updatePostSchema,
  TCreatePostSchema,
  TUpdatePostSchema,
} from '@/schemas/blogPostSchema'

// 博客文章接口 - 基于 Prisma schema
export interface BlogPost {
  id: string
  title: string
  body: string
  author: string | null
  userId: string
  viewCount: number // 阅读量
  createdAt: Date
  updatedAt: Date
  username?: string // 新增：扁平化的用户名
  user?: {
    id: string
    email: string
    username: string | null
    bio: string | null
    avatar: string | null
  } | null
  category?: {
    id: string
    name: string
  } | null // 一对多：一个文章只有一个分类
}

// 文章概览接口，用于列表展示
export interface BlogPostOverview {
  id: string
  title: string
  author: string | null
  userId: string
  viewCount: number // 阅读量
  createdAt: Date
  updatedAt: Date
  excerpt?: string // 文章摘要
  category?: {
    id: string
    name: string
  } | null
}

// 获取文章列表（优化版本，只获取概览信息）
export async function fetchBlogPosts({
  page = 1,
  limit = 10,
  search,
  categoryId,
}: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
} = {}) {
  try {
    const offset = (page - 1) * limit

    const where: any = {}

    // 搜索条件
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { body: { contains: search, mode: 'insensitive' as const } },
      ]
    }

    // 分类过滤条件
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          author: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          body: true, // 获取 body 用于生成摘要
          user: {
            select: {
              username: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    // 扁平化数据结构，将 username 提到第一层，并生成摘要
    const flattenedPosts = posts.map((post) => {
      // 生成文章摘要（去除 markdown 标记，取前 150 字符）
      const excerpt = post.body
        ? post.body
            .replace(/[#*`~\[\]()]/g, '') // 移除 markdown 标记
            .replace(/\s+/g, ' ') // 合并多个空格
            .trim()
            .substring(0, 150) + (post.body.length > 150 ? '...' : '')
        : '暂无内容'

      return {
        ...post,
        author: post.user?.username || post.author || '未知用户',
        excerpt,
        user: undefined, // 移除嵌套的 user 对象
        body: undefined, // 移除 body 字段，只保留摘要
      }
    })

    return {
      success: true,
      posts: flattenedPosts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    return {
      success: false,
      error: '获取文章列表失败',
      posts: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    }
  }
}

// 获取单个文章
export async function fetchBlogPost(
  id: string
): Promise<{ success: boolean; post?: BlogPost; error?: string }> {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        body: true,
        author: true,
        userId: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!post) {
      return { success: false, error: '文章不存在' }
    }

    // 扁平化数据结构
    const flattenedPost = {
      ...post,
      author: post.user?.username || '未知用户', // 保持兼容性
      user: undefined, // 移除嵌套的 user 对象
    }

    return { success: true, post: flattenedPost }
  } catch (error) {
    console.error('获取文章失败:', error)
    return { success: false, error: '获取文章失败' }
  }
}

// 创建文章
export async function createBlogPost(formData: TCreatePostSchema) {
  try {
    const supabase = await createAdminClient()

    // 检查用户是否已登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证输入
    const validatedData = createPostSchema.parse(formData)

    // 创建文章
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        author: user.user_metadata.username,
        title: validatedData.title,
        body: validatedData.body,

        categoryId: validatedData.categoryId, // 一对多：只取第一个分类ID
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // 扁平化数据结构
    const flattenedPost = {
      ...post,
      author: post.user?.username || '未知用户', // 保持兼容性
      username: undefined,
      user: undefined, // 移除嵌套的 user 对象
    }

    revalidatePath('/blog')
    return { success: true, post: flattenedPost }
  } catch (error) {
    console.error('创建文章失败:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: '创建文章失败' }
  }
}

// 更新文章
export async function updateBlogPost(formData: TUpdatePostSchema) {
  try {
    const supabase = await createAdminClient()

    // 检查用户是否已登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 验证输入
    const validatedData = updatePostSchema.parse(formData)

    // 检查文章是否存在且用户有权限
    const existingPost = await prisma.post.findUnique({
      where: { id: validatedData.id },
    })

    if (!existingPost) {
      return { success: false, error: '文章不存在' }
    }

    if (existingPost.userId !== user.id) {
      return { success: false, error: '您没有权限编辑此文章' }
    }

    // 更新文章
    const updateData: any = {}
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.body) updateData.body = validatedData.body
    if (validatedData.author !== undefined)
      updateData.author = validatedData.author

    // 处理分类关系
    if (validatedData.categoryId) {
      updateData.categoryId = validatedData.categoryId
    }

    const post = await prisma.post.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        user: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // 扁平化数据结构
    const flattenedPost = {
      ...post,
      author: post.user?.username, // 保持兼容性
      user: undefined, // 移除嵌套的 user 对象
    }

    revalidatePath('/blog')
    revalidatePath(`/blog/${validatedData.id}`)
    return { success: true, post: flattenedPost }
  } catch (error) {
    console.error('更新文章失败:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: '更新文章失败' }
  }
}

// 删除文章
export async function deleteBlogPost(id: string) {
  try {
    const supabase = await createAdminClient()

    // 检查用户是否已登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查文章是否存在且用户有权限
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return { success: false, error: '文章不存在' }
    }

    if (existingPost.userId !== user.id) {
      return { success: false, error: '您没有权限删除此文章' }
    }

    // 删除文章
    await prisma.post.delete({
      where: { id },
    })

    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    console.error('删除文章失败:', error)
    return { success: false, error: '删除文章失败' }
  }
}

// 获取热门文章（按创建时间排序，因为 Prisma schema 中没有 views 字段）
export async function fetchPopularPosts(limit: number = 5) {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // 扁平化数据结构
    const flattenedPosts = posts.map((post) => ({
      ...post,
      author: post.user?.username || '未知用户', // 保持兼容性
      user: undefined, // 移除嵌套的 user 对象
    }))

    return flattenedPosts
  } catch (error) {
    console.error('获取热门文章失败:', error)
    return []
  }
}

// 切换文章发布状态（由于 Prisma schema 中没有 published 字段，这个函数暂时返回成功）
export async function toggleBlogPostPublished(id: string) {
  try {
    const supabase = await createAdminClient()

    // 检查用户是否已登录
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '请先登录' }
    }

    // 检查文章是否存在且用户有权限
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return { success: false, error: '文章不存在' }
    }

    if (existingPost.userId !== user.id) {
      return { success: false, error: '您没有权限修改此文章' }
    }

    // 由于 Prisma schema 中没有 published 字段，这里只是返回成功
    // 如果需要发布功能，需要在 schema 中添加 published 字段
    revalidatePath('/blog')
    return { success: true }
  } catch (error) {
    console.error('切换文章状态失败:', error)
    return { success: false, error: '切换文章状态失败' }
  }
}

// 增加文章阅读量
export async function incrementViewCount(id: string) {
  try {
    const post = await prisma.post.update({
      where: { id },
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

    return { success: true, viewCount: post.viewCount }
  } catch (error) {
    console.error('增加阅读量失败:', error)
    return { success: false, error: '操作失败' }
  }
}

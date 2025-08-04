'use server'

import {
  categorySchema,
  TCategorySchema,
  TUpdateCategorySchema,
  updateCategorySchema,
} from '@/schemas/blogCategorySchema'
import { prisma } from '@/lib/prisma/client'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  postCount?: number
  createdAt: string
  updatedAt: string
}

// 获取所有分类
export async function fetchCategories(): Promise<Category[]> {
  try {
    // const supabase = await createAdminClient()
    // 直接使用 Prisma，不需要认证（因为是公开数据）

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      postCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }))
  } catch (error) {
    console.error('获取分类失败:', error)
    return []
  }
}

// 创建分类
export async function createCategory(formData: TCategorySchema) {
  try {
    const supabase = await createAdminClient()

    // 验证用户权限
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('未授权')
    }

    // 验证表单数据
    const validatedData = categorySchema.parse(formData)

    // 检查分类名称是否已存在
    // const { data: existingCategory } = await supabase
    //   .from('Category')
    //   .select('id')
    //   .eq('name', validatedData.name)
    //   .single()

    const existingCategory = await prisma.category.findFirst({
      where: { name: validatedData.name },
    })

    if (existingCategory) {
      throw new Error('分类名称已存在')
    }

    // 创建分类
    // const { data, error } = await supabase
    //   .from('Category')
    //   .insert({
    //     name: validatedData.name,
    //     description: validatedData.description,
    //   })
    //   .select()
    //   .single()

    // if (error) {
    //   console.error('创建分类失败:', error)
    //   throw new Error('创建分类失败')
    // }

    const data = await prisma.category.create({
      data: {
        userId: user.id,
        author: user.user_metadata.username,
        name: validatedData.name,
        description: validatedData.description,
      },
    })

    revalidatePath('/blog')
    revalidatePath('/blog/category')

    return { success: true, data }
  } catch (error) {
    console.error('创建分类失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建分类失败',
    }
  }
}

// 获取单个分类
export async function fetchCategory(id: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { id: id },
      // include - 包含关联数据：包含关联数据,类似于SQL的join；
      // _count - 计数功能：不会返回实际的数据，只返回数量
      // select: { posts: true } - 选择要计数的字段，posts: true 表示计算 posts 关联的数量
      include: { _count: { select: { posts: true } } },
    })

    if (!category) return null

    // 转换为您的接口格式
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      postCount: category._count.posts,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    return null
  }
}

// 获取分类统计信息
export async function fetchCategoryStats() {
  try {
    const data = await prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    })

    // 使用 Prisma 聚合查询获取总数

    const totalCategories = await prisma.category.count()

    // 计算有文章的分类数量

    const categoriesWithPosts = await prisma.category.count({
      where: {
        posts: {
          some: {}, // 至少有一篇文章
        },
      },
    })

    return {
      totalCategories,
      categoriesWithPosts,
      categories: data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        postCount: cat._count.posts,
      })),
    }
  } catch (error) {
    console.error('获取分类统计失败:', error)
    return {
      totalCategories: 0,
      categoriesWithPosts: 0,
      categories: [],
    }
  }
}

// 更新分类
export async function updateCategory(formData: TUpdateCategorySchema) {
  try {
    const supabase = await createAdminClient()

    // 验证用户权限
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('未授权')
    }

    // 验证表单数据
    const validatedData = updateCategorySchema.parse(formData)

    const existingCategory = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        id: { not: validatedData.id }, // 排除当前分类
      },
    })

    if (existingCategory) {
      throw new Error('分类名称已存在')
    }

    const data = await prisma.category.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
      },
    })

    revalidatePath('/blog')
    revalidatePath('/blog/category')

    return { success: true, data }
  } catch (error) {
    console.error('更新分类失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新分类失败',
    }
  }
}

// 删除分类
export async function deleteCategory(id: string) {
  try {
    const supabase = await createAdminClient()

    // 验证用户权限
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new Error('未授权')
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    })

    // 检查分类是否存在
    if (!category) {
      throw new Error('分类不存在')
    }

    // 检查分类是否存在关联的文章
    if (category._count.posts > 0) {
      throw new Error('该分类下还有文章，无法删除')
    }

    // 删除分类
    const data = await prisma.category.delete({ where: { id } })

    revalidatePath('/blog')
    revalidatePath('/blog/category')

    return { success: true, data }
  } catch (error) {
    console.error('删除分类失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除分类失败',
    }
  }
}

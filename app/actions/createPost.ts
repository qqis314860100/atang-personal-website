'use server'

import {
  createPostSchema,
  type TCreatePostSchema,
} from '@/schemas/createPostSchema'
import { revalidatePath } from 'next/cache'
import { redirect } from '@/i18n/navigation'
import { prisma } from '@/lib/db'
import toast from 'react-hot-toast'

export async function createPost(data: TCreatePostSchema) {
  // 1.验证数据
  const validatedData = createPostSchema.safeParse(data)
  if (!validatedData.success) {
    throw new Error(validatedData.error.errors[0].message)
  }

  try {
    // 2.获取当前用户ID
    // const session = await getSession()
    // const userId = session?.user?.id
    // 3.创建帖子
    const post = await prisma.post.create({
      data: {
        title: validatedData.data.title,
        body: validatedData.data.body,
        // author
        userId: 'test-user-id',
        // 4.处理分类关系
        categories: {
          connect: validatedData.data.categoryId.map((id) => ({ id })),
        },
      },
    })
    revalidatePath('/blog')
    return { success: true, post }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create the post!',
    }
  }
}

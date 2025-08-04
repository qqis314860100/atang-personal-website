import { z } from 'zod'

// 创建文章的验证模式
export const createPostSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200个字符'),
  body: z.string().min(1, '内容不能为空'),
  author: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
})

// 更新文章的验证模式
export const updatePostSchema = z.object({
  id: z.string().min(1, 'ID不能为空'),
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符')
    .optional(),
  body: z.string().min(1, '内容不能为空').optional(),
  author: z.string().optional(),
  categoryId: z.string().optional(),
})

export type TCreatePostSchema = z.infer<typeof createPostSchema>
export type TUpdatePostSchema = z.infer<typeof updatePostSchema>

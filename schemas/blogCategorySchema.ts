import { z } from 'zod'

// 分类验证模式

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称不能超过50个字符'),
  description: z
    .string()
    .min(1, '分类描述不能为空')
    .max(50, '分类描述不能超过50个字符'),
})

export const updateCategorySchema = categorySchema.extend({
  id: z.string().min(1, '分类ID不能为空'),
})

export type TCategorySchema = z.infer<typeof categorySchema>
export type TUpdateCategorySchema = z.infer<typeof updateCategorySchema>

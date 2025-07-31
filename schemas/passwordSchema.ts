import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, { message: '密码至少8个字符' })
  .max(20, { message: '密码最多20个字符' })

export const updateClientPasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  })

export type TUpdateClientPasswordSchema = z.infer<
  typeof updateClientPasswordSchema
>

export const updateServerPasswordSchema = z
  .object({
    email: z.string().email(),
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  })

export type TUpdateServerPasswordSchema = z.infer<
  typeof updateServerPasswordSchema
>

export type TPasswordSchema = z.infer<typeof passwordSchema>

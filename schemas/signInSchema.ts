import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email({ message: '请输入正确的邮箱地址' }),
  password: z.string().min(8, { message: '密码至少8个字符' }),
})

export type TSignInSchema = z.infer<typeof signInSchema>

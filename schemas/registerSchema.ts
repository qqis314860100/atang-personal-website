import { z } from 'zod'
import { passwordSchema } from './passwordSchema'

export const registerSchema = z.object({
  username: z.string().min(3, { message: '用户名至少3个字符' }),
  email: z.string().email({ message: '邮箱格式不正确' }),
  password: passwordSchema,
  confirmPassword: passwordSchema,
})

export type TRegisterSchema = z.infer<typeof registerSchema>

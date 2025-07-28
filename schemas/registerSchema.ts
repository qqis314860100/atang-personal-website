import { z } from 'zod'
import { passwordSchema } from './passwordSchema'

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: passwordSchema,
  confirmPassword: passwordSchema,
})

export type TRegisterSchema = z.infer<typeof registerSchema>

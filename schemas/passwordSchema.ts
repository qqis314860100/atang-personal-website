import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(20, { message: 'Password must be less than 20 characters long' })

import { z } from 'zod'

export const userProfileSchema = z.object({
  username: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  avatar: z.string().url({ message: 'Invalid avatar URL' }),
  gender: z.string().optional(),
  // 个性签名
  signature: z.string().optional(),
  // 出生日期
  date: z
    .union([
      z.date(),
      z.string().transform((str) => (str ? new Date(str) : undefined)),
    ])
    .optional(),
  // 技术栈
  // techStack: z
  //   .union([
  //     z.array(z.string()),
  //     z.string().transform((str) =>
  //       str
  //         .split(',')
  //         .map((item) => item.trim())
  //         .filter(Boolean)
  //     ),
  //   ])
  //   .optional(),
  techStack: z.string().optional(),
  // 个人简历
  bio: z.string().optional(),
})

export type TUserProfile = z.input<typeof userProfileSchema>

// 如果需要处理转换后的值（如将字符串转为数组后的类型），可以定义
export type TUserProfileOutput = z.output<typeof userProfileSchema>

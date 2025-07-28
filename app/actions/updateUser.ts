'use server'

import { TUserProfile, userProfileSchema } from '@/schemas/userProfileSchema'
import { createAdminClient } from '@/utils/supabase/server'

export const updateUser = async (data: TUserProfile) => {
  const parsed = userProfileSchema.safeParse(data)

  if (!parsed.success) {
    return {
      status: 'error',
      message: '用户信息校验失败',
      error: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createAdminClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user)
    return {
      status: 'error',
      message: '权限认证失败,获取数据错误',
      error: userError,
    }

  const { error: updateError } = await supabase.from('UserProfile').upsert({
    id: user.id,
    ...data,
    updatedAt: new Date().toISOString(),
  })

  if (updateError)
    return { status: 'error', message: '更新用户信息失败', error: updateError }

  return { status: 'success', message: '更新用户信息成功', success: true }
}

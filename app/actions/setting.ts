'use server'

import {
  TUpdateServerPasswordSchema,
  updateServerPasswordSchema,
} from '@/schemas/passwordSchema'
import { createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(data: TUpdateServerPasswordSchema) {
  const supabase = await createAdminClient()
  const { currentPassword, newPassword, confirmPassword, email } = data

  // 验证输入数据
  const validation = updateServerPasswordSchema.safeParse(data)
  if (!validation.success) {
    return {
      error: validation.error.flatten().fieldErrors,
      success: false,
    }
  }

  // 验证当前密码
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: email,
    password: currentPassword,
  })

  if (authError) {
    console.log(authError.message)
    throw new Error('当前密码错误')
  }

  // 更新密码
  const { error: userError } = await supabase.auth.updateUser({
    password: newPassword, // 使用 newPassword 而不是 confirmPassword
  })

  if (userError) {
    console.log(userError.message)
    throw new Error('更新密码失败')
  }
  // 刷新用户的登录状态（Session）
  // 当用户修改密码后，他们旧的登录令牌（Token）应该被视为无效。这行代码会强制 Supabase 客户端获取一个新的、有效的会话令牌。这可以确保用户的登录状态与新的密码同步，避免因为旧令牌而导致意外登出或安全问题。
  const { error: refreshError } = await supabase.auth.refreshSession()

  if (refreshError) {
    console.error('刷新会话失败:', refreshError)
    // 考虑是否需要处理这个错误
  }

  // Next.js App Router 的一个核心功能，用于清除服务器端缓存
  //  它会告诉 Next.js：“/setting 这个页面的缓存已经过时了，下次有用户访问时，请不要使用旧的缓存页面，而是要重新在服务器上渲染一次。” 这保证了用户看到的数据永远是最新的。虽然修改密码本身可能不会直接改变设置页面的显示内容，但这是一种良好的编程习惯，可以防止显示陈旧的数据
  revalidatePath('/setting')

  return {
    message: '密码更新成功',
  }
}

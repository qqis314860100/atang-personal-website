import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 创建 Supabase 客户端
// 直接与 Supabase 数据库通信的客户端
// 使用 SQL 查询语言
// 需要手动编写 SQL 或使用 Supabase 的查询构建器

// 创建具有管理员权限的客户端（使用服务角色密钥）
export async function createAdminClient() {
  const cookieStore = await cookies()
  console.log(
    'process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!,
    '    process.env.NEXT_PUBLIC_SUPABASE_URL!,',
    process.env.NEXT_PUBLIC_SUPABASE_URL!
  )
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookies) {
          try {
            cookies.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {}
        },
      },
    }
  )
}

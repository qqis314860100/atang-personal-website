import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// // 在路由处理期间执行，使用cookies()方法从Next.js获取，主要负责数据获取和操作
// export async function createClient() {
//   const cookieStore = await cookies()

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll()
//         },
//         setAll(cookies) {
//           try {
//             cookies.forEach(({ name, value, options }) => {
//               cookieStore.set(name, value, options)
//             })
//           } catch (error) {}
//         },
//       },
//     }
//   )
// }

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

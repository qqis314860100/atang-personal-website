import { createClient } from '@supabase/supabase-js'

// 创建 Supabase 客户端
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // 自动处理 token 存储和刷新
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      // 自动在请求头中携带 token
      headers: {
        'X-Client-Info': 'supabase-js/2.x.x',
      },
    },
  }
)

// 简单理解：
// Token 是"身份证号码"
// Session 是"身份证"（包含号码 + 照片 + 其他信息）
// Supabase 帮你自动处理了从 token 到 session 的转换过程！

// Session 是一个完整的会话对象(运行时构建)
// session 包含：
// - user 信息
// - access_token
// - refresh_token
// - 过期时间等
// {
//   user: {
//     id: "user_123",
//     email: "user@example.com"
//   },
//   access_token: "jwt_token_here",
//   refresh_token: "refresh_token_here",
//   expires_at: "2024-01-01T12:00:00Z"
// }

// Supabase 客户端会自动：
// 1. 从 localStorage 读取 token
// 2. 在每次请求时自动添加到 Authorization 头
// 3. 处理 token 过期和刷新
// 4. 更新 localStorage 中的 token

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

// 中间件在请求到达路由处理之前执行，使用NextRequest对，负责路由保护
// 每个请求首先经过中间件,验证用户会话状态，根据认证状态和路由规则决定是否重定向,例如：未登录用户访问受保护页面会被重定向到登录页
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value }) => request.cookies.set(name, value))

          supabaseResponse = NextResponse.next({ request })

          cookies.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 严格的调用顺序,创建客户端(createServerClient)后必须立即调用auth.getUser，不能在这两个操作之间插入任何其它代码
  //   auth.getUser()不仅仅是检查用户登录状态
  // 它还会刷新会话令牌、验证cookie有效性
  // 在后台处理会话续期(session refresh)逻辑
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathnameParts = request.nextUrl.pathname.split('/')

  const locale = pathnameParts[1]

  const publicRoutes = ['/dashboard']

  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(`/${locale}${route}`)
  )

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/dashboard`
    return NextResponse.redirect(url)
  }
}

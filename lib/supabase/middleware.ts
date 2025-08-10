import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

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

  // 获取用户会话
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 获取当前路径和语言
  const pathname = request.nextUrl.pathname
  const pathnameParts = pathname.split('/')
  const locale = pathnameParts[1]

  // 定义公开路径（不需要认证）
  const publicPaths = [
    '/',
    '/login',
    '/blog',
    '/project',
    '/dashboard',
    '/home',
  ]

  // 定义需要认证的路径
  const protectedPaths = ['/user']

  // 移除语言前缀的路径
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

  // 如果访问的是根路径（只有语言前缀），重定向到home
  if (pathWithoutLocale === '/') {
    const homeUrl = new URL(`/${locale}/home`, request.url)
    return NextResponse.redirect(homeUrl)
  }

  // 检查是否为公开路径
  const isPublicPath = publicPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  )

  // 检查是否为需要认证的路径
  const isProtectedPath = protectedPaths.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  )

  // 认证逻辑
  if (isProtectedPath && !user) {
    // 需要认证但未登录，重定向到登录页
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (user && pathWithoutLocale === '/login') {
    // 已登录用户访问登录页，重定向到首页
    const homeUrl = new URL(`/${locale}`, request.url)
    return NextResponse.redirect(homeUrl)
  }

  // 返回包含cookies的响应
  return supabaseResponse
}

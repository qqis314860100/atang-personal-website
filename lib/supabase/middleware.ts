import { routing } from '@/i18n/routing'
import { createServerClient } from '@supabase/ssr'
import { hasLocale } from 'next-intl'
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
  let user = null
  try {
    const {
      data: { user: userData },
    } = await supabase.auth.getUser()
    user = userData
  } catch (error) {
    // 忽略认证错误，继续处理请求
    console.log('Auth error in middleware:', error)
    // 临时：在开发环境中跳过认证检查
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: skipping auth check')
    }
  }

  // 获取当前路径和语言（仅当首段是受支持的语言时才视为 locale）
  const pathname = request.nextUrl.pathname
  const firstSegment = pathname.split('/')[1] || ''
  const isSupportedLocale = hasLocale(routing.locales, firstSegment)
  const locale = isSupportedLocale ? firstSegment : routing.defaultLocale

  // 仅当存在受支持的语言前缀时才移除，否则保留原始路径
  const pathWithoutLocale = isSupportedLocale
    ? pathname.replace(`/${firstSegment}`, '') || '/'
    : pathname

  // 如果访问的是根路径（只有语言前缀），重定向到home（仅限受支持语言场景）
  if (isSupportedLocale && pathWithoutLocale === '/' && firstSegment) {
    const homeUrl = new URL(`/${locale}/home`, request.url)
    console.log('Redirecting from', pathname, 'to', homeUrl.toString())
    return NextResponse.redirect(homeUrl)
  }

  // 如果访问的是站点根路径且没有语言前缀，重定向到默认语言首页
  if (pathname === '/') {
    const homeUrl = new URL(`/${routing.defaultLocale}/home`, request.url)
    return NextResponse.redirect(homeUrl)
  }

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
    // 需要认证但未登录，重定向到登录页（保持无前缀登录入口）
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问登录页，重定向到首页
  if (user && (pathWithoutLocale === '/login' || pathname === '/login')) {
    const homeUrl = new URL(`/${locale}/home`, request.url)
    return NextResponse.redirect(homeUrl)
  }

  // 返回包含cookies的响应
  return supabaseResponse
}

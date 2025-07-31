import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
}

// 不需要检查会话的路径
const publicPaths = ['/login', '/dashboard']

export async function middleware(request: NextRequest) {
  // 获取当前路径
  const pathname = request.nextUrl.pathname
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/')

  const isPublicPath = publicPaths.some(
    (path) =>
      pathnameWithoutLocale || pathnameWithoutLocale.startsWith(`${path}/`)
  )

  // 先处理 Supabase 会话
  const supabaseResponse = await updateSession(request)

  // 获取会话信息
  const session = supabaseResponse?.cookies.get('sb-session')?.value

  // 如果不是公开路径并且没有会话,重定向到dashboard
  if (!isPublicPath && !session) {
    // 获取当前语言
    const locale = pathname.split('/')[1] || 'zh'

    // 构建重定向URL
    const redirectUrl = new URL(`/${locale}/dashboard`, request.url)
    redirectUrl.searchParams.set('redirectFrom', pathname)

    return NextResponse.redirect(redirectUrl)
  }

  // 再处理国际化路由
  const intlMiddleware = createMiddleware(routing)

  // 将 Supabase 的 cookie 转移到国际化中间件的响应中
  const response = intlMiddleware(request)
  supabaseResponse?.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value)
  })

  return response
}

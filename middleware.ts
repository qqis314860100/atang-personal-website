import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import createMiddleware from 'next-intl/middleware'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
}

export async function middleware(request: NextRequest) {
  // 先处理 Supabase 会话
  const supabaseResponse = await updateSession(request)

  // 再处理国际化路由
  const intlMiddleware = createMiddleware(routing)

  // 将 Supabase 的 cookie 转移到国际化中间件的响应中
  const response = intlMiddleware(request)
  supabaseResponse?.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value)
  })

  return response
}

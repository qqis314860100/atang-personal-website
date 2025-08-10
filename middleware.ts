import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
}

export async function middleware(request: NextRequest) {
  // 处理 Supabase 会话和认证
  const supabaseResponse = await updateSession(request)

  // 如果Supabase中间件返回了重定向响应，直接返回
  if (supabaseResponse instanceof NextResponse) {
    return supabaseResponse
  }

  // 应用国际化中间件
  const intlMiddleware = createMiddleware(routing)
  return intlMiddleware(request)
}

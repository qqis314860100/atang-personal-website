import { updateSession } from '@/lib/supabase/middleware'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|assets|favicon.ico|sw.js|site.webmanifest).*)',
  ],
  runtime: 'nodejs',
}

export async function middleware(request: NextRequest) {
  try {
    if (
      process.env.NODE_ENV === 'production' &&
      request.headers.get('x-forwarded-proto') !== 'https'
    ) {
      const url = request.nextUrl.clone()
      url.protocol = 'https:'
      return NextResponse.redirect(url)
    }
    
    // 处理 Supabase 会话和认证
    const supabaseResponse = await updateSession(request)

    // 如果Supabase中间件返回了重定向响应，直接返回
    if (supabaseResponse instanceof NextResponse) {
      return supabaseResponse
    }

    // 如果是 /login，则跳过 next-intl 中间件，但内部重写到默认语言下的页面，地址栏保持为 /login
    const { pathname } = request.nextUrl
    if (pathname === '/login' || pathname === '/login/') {
      const url = request.nextUrl.clone()
      url.pathname = `/${routing.defaultLocale}/login`
      return NextResponse.rewrite(url)
    }

    // 应用国际化中间件
    const intlMiddleware = createMiddleware(routing)
    return intlMiddleware(request)
  } catch (error) {
    console.error('Middleware error:', error)
    console.error('Request URL:', request.url)
    console.error('Request pathname:', request.nextUrl.pathname)
    
    // 返回基本响应而不是让中间件崩溃
    return NextResponse.next()
  }
}

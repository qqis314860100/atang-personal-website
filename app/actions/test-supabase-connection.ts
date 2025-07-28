'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function testSupabaseConnection() {
  try {
    console.log('=== 测试 Supabase 连接 ===')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

    if (!url || !serviceRole) {
      return {
        success: false,
        message: '环境变量缺失',
      }
    }

    // 创建 SSR 客户端
    const cookieStore = await cookies()
    const supabase = createServerClient(url, serviceRole, {
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
    })

    // 测试不同的表
    const results: Record<string, any> = {}

    // 测试 UserProfile 表
    try {
      const { data, error } = await supabase
        .from('UserProfile')
        .select('*')
        .limit(1)
      results.userProfile = { data, error }
    } catch (error) {
      results.userProfile = { error }
    }

    // 测试 Post 表
    try {
      const { data, error } = await supabase.from('Post').select('*').limit(1)
      results.post = { data, error }
    } catch (error) {
      results.post = { error }
    }

    // 测试 PDFAnnotation 表
    try {
      const { data, error } = await supabase
        .from('PDFAnnotation')
        .select('*')
        .limit(1)
      results.pdfAnnotation = { data, error }
    } catch (error) {
      results.pdfAnnotation = { error }
    }

    // 测试 RPC 调用
    try {
      const { data, error } = await supabase.rpc('get_schema_tables')
      results.rpc = { data, error }
    } catch (error) {
      results.rpc = { error }
    }

    return {
      success: true,
      message: 'Supabase 连接测试完成',
      results,
    }
  } catch (error) {
    console.error('Supabase 连接测试出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

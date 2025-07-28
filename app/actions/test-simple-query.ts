'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function testSimpleQuery() {
  try {
    console.log('=== 测试简单查询 ===')

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

    const results: Record<string, any> = {}

    // 测试不同的表名格式
    const tableNames = [
      'UserProfile',
      'userprofile',
      'user_profile',
      'Post',
      'post',
      'PDFAnnotation',
      'pdfannotation',
      'pdf_annotation',
    ]

    for (const tableName of tableNames) {
      try {
        console.log(`测试表: ${tableName}`)
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        results[tableName] = { data, error }
        console.log(`${tableName} 结果:`, { data, error })

        // 如果成功，就停止测试
        if (!error) {
          console.log(`✅ 找到正确的表名: ${tableName}`)
          break
        }
      } catch (error) {
        results[tableName] = { error }
        console.log(`${tableName} 错误:`, error)
      }
    }

    // 测试 RLS 状态
    try {
      const { data, error } = await supabase.rpc('get_rls_status')
      results.rlsStatus = { data, error }
    } catch (error) {
      results.rlsStatus = { error }
    }

    return {
      success: true,
      message: '简单查询测试完成',
      results,
    }
  } catch (error) {
    console.error('简单查询测试出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

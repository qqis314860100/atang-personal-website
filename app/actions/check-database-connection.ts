'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function checkDatabaseConnection() {
  try {
    console.log('=== 检查数据库连接 ===')

    // 1. 检查环境变量
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

    console.log('URL 长度:', url?.length)
    console.log('Service Role 长度:', serviceRole?.length)
    console.log('URL 前缀:', url?.substring(0, 30))
    console.log('Service Role 前缀:', serviceRole?.substring(0, 30))

    // 2. 创建 SSR 客户端
    const cookieStore = await cookies()
    const supabase = createServerClient(url!, serviceRole!, {
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

    // 3. 测试最简单的查询
    const { data: simpleData, error: simpleError } = await supabase
      .from('UserProfile')
      .select('*')
      .limit(1)

    console.log('简单查询结果:', { simpleData, simpleError })

    // 4. 测试 RPC 调用
    const { data: rpcData, error: rpcError } = await supabase.rpc('version')

    console.log('RPC 调用结果:', { rpcData, rpcError })

    // 5. 检查数据库 URL
    const databaseUrl = process.env.DATABASE_URL
    console.log('DATABASE_URL 存在:', !!databaseUrl)
    console.log('DATABASE_URL 长度:', databaseUrl?.length)

    return {
      success: true,
      message: '数据库连接检查完成',
      results: {
        simpleQuery: { data: simpleData, error: simpleError },
        rpcCall: { data: rpcData, error: rpcError },
        envVars: {
          hasUrl: !!url,
          hasServiceRole: !!serviceRole,
          hasDatabaseUrl: !!databaseUrl,
          urlLength: url?.length,
          serviceRoleLength: serviceRole?.length,
          databaseUrlLength: databaseUrl?.length,
        },
      },
    }
  } catch (error) {
    console.error('数据库连接检查出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

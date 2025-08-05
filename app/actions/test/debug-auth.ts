'use server'

import { createAdminClient } from '@/lib/supabase/client'

export async function debugAuth() {
  try {
    console.log('=== 开始调试认证 ===')

    // 1. 检查环境变量
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('ANON_KEY 存在:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    console.log(
      'SERVICE_ROLE 存在:',
      !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE
    )

    // 2. 创建客户端
    const supabase = await createAdminClient()

    // 3. 测试基本连接
    const { data: testData, error: testError } = await supabase
      .from('UserProfile')
      .select('count')
      .limit(1)

    console.log('测试查询结果:', { testData, testError })

    // 4. 检查当前用户
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    console.log('当前用户:', { user, userError })

    // 5. 测试简单插入（如果用户存在）
    if (user) {
      const { data: insertData, error: insertError } = await supabase
        .from('UserProfile')
        .insert({
          id: user.id,
          name: 'test_user',
          email: user.email || 'test@example.com',
        })
        .select()

      console.log('插入测试结果:', { insertData, insertError })
    }

    return {
      success: true,
      message: '调试完成，请查看控制台日志',
      testError: testError?.message,
      userError: userError?.message,
    }
  } catch (error) {
    console.error('调试过程中出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

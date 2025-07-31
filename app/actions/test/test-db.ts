'use server'

import { createAdminClient } from '@/utils/supabase/server'

export async function testDatabaseConnection() {
  try {
    const supabase = await createAdminClient()

    // 测试认证
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    console.log('测试认证:', { user: user?.id, authError })

    // 测试简单查询
    const { data, error } = await supabase
      .from('PDFAnnotation')
      .select('*')
      .limit(1)

    console.log('测试查询:', { data, error })

    return {
      success: !error,
      user: user?.id,
      authError,
      queryError: error,
      data,
    }
  } catch (error) {
    console.error('测试失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

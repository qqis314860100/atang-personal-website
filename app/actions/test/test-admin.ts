'use server'

import { createAdminClient } from '@/lib/supabase/client'

export async function testAdminConnection() {
  try {
    const supabase = await createAdminClient()
    console.log('supabase', supabase)
    // 测试管理员查询
    const { data, error } = await supabase
      .from('PDFAnnotation')
      .select('*')
      .limit(1)

    console.log('管理员测试:', { data, error })

    return {
      success: !error,
      error,
      data,
      message: error ? '管理员查询失败' : '管理员查询成功',
    }
  } catch (error) {
    console.error('管理员测试失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

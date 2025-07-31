'use server'

import { createAdminClient } from '@/utils/supabase/server'

export async function testServiceRoleConnection() {
  try {
    const supabase = await createAdminClient()

    // 测试服务角色查询
    const { data, error } = await supabase
      .from('PDFAnnotation')
      .select('*')
      .limit(1)

    console.log('服务角色测试:', { data, error })

    return {
      success: !error,
      error,
      data,
      message: error ? '服务角色查询失败' : '服务角色查询成功',
    }
  } catch (error) {
    console.error('服务角色测试失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

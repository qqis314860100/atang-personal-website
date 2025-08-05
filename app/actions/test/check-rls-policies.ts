'use server'

import { createAdminClient } from '@/lib/supabase/client'

export async function checkRLSPolicies() {
  try {
    const supabase = await createAdminClient()

    // 1. 检查当前用户会话
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    console.log('当前会话:', session?.user?.id)
    console.log('会话错误:', sessionError)

    // 2. 检查 UserProfile 表的 RLS 策略
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'UserProfile')
      .eq('table_schema', 'public')

    console.log('RLS 策略:', policies)
    console.log('策略查询错误:', policiesError)

    // 3. 尝试直接查询 UserProfile 表
    if (session?.user?.id) {
      const { data: profile, error: profileError } = await supabase
        .from('UserProfile')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('用户资料查询结果:', profile)
      console.log('用户资料查询错误:', profileError)
    }

    // 4. 检查表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'UserProfile')

    console.log('表存在检查:', tables)
    console.log('表检查错误:', tablesError)

    return {
      success: true,
      session: session?.user?.id,
      policies,
      profile: session?.user?.id
        ? await supabase
            .from('UserProfile')
            .select('*')
            .eq('id', session.user.id)
            .single()
        : null,
    }
  } catch (error) {
    console.error('检查 RLS 策略失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

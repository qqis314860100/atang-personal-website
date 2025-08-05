'use server'

import { createAdminClient } from '@/lib/supabase/client'

export async function testOtherTables() {
  try {
    const supabase = await createAdminClient()

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('认证检查:', { user: user?.id, authError })

    if (authError || !user) {
      return {
        success: false,
        error: '未授权访问',
        user: null,
        authError,
      }
    }

    // 测试UserProfile表
    const { data: userProfileData, error: userProfileError } = await supabase
      .from('UserProfile')
      .select('*')
      .eq('id', user.id)
      .limit(1)

    console.log('UserProfile测试:', {
      data: userProfileData,
      error: userProfileError,
    })

    // 测试Post表
    const { data: postData, error: postError } = await supabase
      .from('Post')
      .select('*')
      .limit(1)

    console.log('Post测试:', { data: postData, error: postError })

    return {
      success: true,
      user: user.id,
      userProfile: {
        success: !userProfileError,
        error: userProfileError,
        data: userProfileData,
      },
      post: {
        success: !postError,
        error: postError,
        data: postData,
      },
    }
  } catch (error) {
    console.error('测试失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

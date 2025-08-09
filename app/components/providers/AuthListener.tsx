'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-hook'

export function AuthListener() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 认证状态变化:', event, session?.user?.id)

      if (event === 'SIGNED_IN' && session) {
        // 用户登录，立即获取用户数据并更新缓存
        try {
          const { data: profile, error } = await supabase
            .from('UserProfile')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (error) {
            console.error('❌ 获取用户资料失败:', error)
            // 使用基本用户信息
            const basicUser = {
              id: session.user.id,
              email: session.user.email!,
              username: session.user.user_metadata.username || 'User',
              avatar: null,
              updatedAt: session.user.created_at,
            }
            queryClient.setQueryData(queryKeys.user.session(), basicUser)
          } else {
            queryClient.setQueryData(queryKeys.user.session(), profile)
          }
        } catch (error) {
          console.error('❌ 处理登录事件失败:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        // 用户登出，清除缓存
        console.log('🚪 用户登出，清除缓存')
        queryClient.removeQueries({ queryKey: queryKeys.user.all })
        queryClient.clear()
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token 刷新，重新获取用户数据
        console.log('🔄 Token 刷新，重新获取用户数据')
        queryClient.invalidateQueries({ queryKey: queryKeys.user.session() })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])

  return null
}

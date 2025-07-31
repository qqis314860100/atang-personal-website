'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-hook'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const isInitialized = useRef(false)

  useEffect(() => {
    // 避免重复初始化
    if (isInitialized.current) return
    isInitialized.current = true

    // 设置认证状态变化的监听器
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)

      if (event === 'SIGNED_IN' && session?.user) {
        // 用户登录时，获取并设置用户资料
        try {
          const { data: profile, error } = await supabase
            .from('UserProfile')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!error && profile) {
            console.log('设置用户资料到缓存:', profile.id)
            // 更新 React Query 缓存
            queryClient.setQueryData(queryKeys.user.session(), profile)
            queryClient.setQueryData(queryKeys.user.profile(), profile)
          } else {
            console.error('获取用户资料失败:', error)
          }
        } catch (err) {
          console.error('登录时获取用户资料失败:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        // 用户登出时，清除所有用户相关的缓存
        console.log('清除用户缓存')
        queryClient.removeQueries({ queryKey: queryKeys.user.all })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token 刷新时，确保缓存是最新的
        console.log('Token 刷新，更新用户缓存')
        queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
      }
    })

    // 清理订阅
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, queryClient])

  return <>{children}</>
}

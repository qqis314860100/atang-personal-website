'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUserStore } from '@/lib/store/user-store'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser } = useUserStore()
  const supabase = createClient()

  useEffect(() => {
    // 检查当前会话
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error fetching session:', error)
        return
      }

      // 如果有活跃会话但Zustand中没有用户信息，则获取用户资料
      if (data.session?.user && !useUserStore.getState().user) {
        try {
          // 获取用户的完整资料
          const { data: profile, error: profileError } = await supabase
            .from('UserProfile')
            .select('*')
            .eq('id', data.session.user.id)
            .single()

          if (profileError) {
            console.error('Error fetching user profile:', profileError)
            return
          }

          if (profile) {
            // 更新Zustand存储
            setUser(profile)
          }
        } catch (err) {
          console.error('Failed to restore session:', err)
        }
      }
    }

    // 设置认证状态变化的监听器
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // 用户登录时，获取并设置用户资料
        const { data: profile, error } = await supabase
          .from('UserProfile')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!error && profile) {
          setUser(profile)
        }
      } else if (event === 'SIGNED_OUT') {
        // 用户登出时，清除状态
        setUser(null)
      }
    })

    // 初始检查会话
    checkSession()

    // 清理订阅
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setUser])

  return <>{children}</>
}

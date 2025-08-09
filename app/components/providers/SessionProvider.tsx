'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
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
      // 通过自定义事件通知其他组件
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { event, session },
      })
      window.dispatchEvent(authEvent)
    })

    // 清理订阅
    return () => {
      subscription.unsubscribe()
    }
  }, []) // 移除所有依赖项，只在组件挂载时执行一次

  return <>{children}</>
}

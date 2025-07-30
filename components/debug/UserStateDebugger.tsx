'use client'

import { useEffect } from 'react'
import { useStableUser } from '@/lib/reactQuery/use-auth'

export function UserStateDebugger() {
  const { user, isLoading, error, isAuthenticated } = useStableUser()

  useEffect(() => {
    // 只在状态发生变化时记录日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 UserStateDebugger - 用户状态变化:', {
        userId: user?.id,
        username: user?.username,
        email: user?.email,
        isLoading,
        isAuthenticated,
        error: error?.message,
        timestamp: new Date().toISOString(),
      })
    }
  }, [user, isLoading, error, isAuthenticated])

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs z-50">
      <div>用户状态调试</div>
      <div>ID: {user?.id || 'null'}</div>
      <div>加载: {isLoading ? '是' : '否'}</div>
      <div>认证: {isAuthenticated ? '是' : '否'}</div>
    </div>
  )
}

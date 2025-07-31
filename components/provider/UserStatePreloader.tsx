'use client'

import { useEffect, useState } from 'react'
import { useStableUser } from '@/lib/query-hook/use-auth'
import { useUserStore } from '@/lib/store/user-store'
import { SkeletonScreen } from '@/components/ui/skeleton-screen'

interface UserStatePreloaderProps {
  children: React.ReactNode
}

export function UserStatePreloader({ children }: UserStatePreloaderProps) {
  const [isPreloaded, setIsPreloaded] = useState(false)
  const { user, isLoading, error } = useStableUser()
  const { syncWithReactQuery } = useUserStore()

  // 预加载用户状态
  useEffect(() => {
    const preloadUserState = async () => {
      try {
        // 等待用户状态加载完成
        if (!isLoading) {
          // 同步到 Zustand
          syncWithReactQuery(user)

          // 标记预加载完成
          setIsPreloaded(true)
        }
      } catch (error) {
        console.error('预加载用户状态失败:', error)
        // 即使失败也要继续，避免阻塞应用
        setIsPreloaded(true)
      }
    }

    preloadUserState()
  }, [user, isLoading, syncWithReactQuery])

  // 显示骨架屏直到预加载完成
  if (!isPreloaded || isLoading) {
    return <SkeletonScreen />
  }

  // 预加载完成后渲染实际内容
  return <>{children}</>
}

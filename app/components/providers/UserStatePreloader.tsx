'use client'

import { useEffect, useState } from 'react'

interface UserStatePreloaderProps {
  children: React.ReactNode
}

export function UserStatePreloader({ children }: UserStatePreloaderProps) {
  const [isPreloaded, setIsPreloaded] = useState(false)

  // 静默预加载 - 不显示加载动画
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloaded(true)
    }, 500) // 缩短到500ms

    return () => {
      clearTimeout(timer)
    }
  }, [])

  // 直接渲染内容，不显示骨架屏
  return <>{children}</>
}

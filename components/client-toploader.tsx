'use client'

import NextTopLoader from 'nextjs-toploader'
import { useState, useEffect } from 'react'

// 1. **完全客户端渲染**：通过使用`mounted`状态和`useEffect`，确保Toaster和TopLoader组件只在客户端渲染，避免了服务器端和客户端之间的差异

// 2. **条件渲染**：服务器渲染时返回`null`，客户端挂载后才渲染实际组件

// 3. **明确的生命周期**：使用`useEffect`清晰地控制组件的挂载/卸载行为

// 这是一种"延迟客户端渲染"的技术，先确保水合成功，然后再在纯客户端环境中渲染实际内容。
export function ClientTopLoader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // 只在客户端渲染
  if (!mounted) {
    return null
  }

  // 客户端挂载后渲染
  return (
    <NextTopLoader
      showSpinner={true}
      color="#2563eb"
      initialPosition={0.08}
      height={3}
      shadow="0 0 10px #2563eb,0 0 5px #2563eb"
    />
  )
}

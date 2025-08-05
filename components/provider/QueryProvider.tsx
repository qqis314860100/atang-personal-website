'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // 在客户端创建 QueryClient 实例
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 优化查询配置
            staleTime: 10 * 60 * 1000, // 10分钟数据保持新鲜
            gcTime: 30 * 60 * 1000, // 30分钟垃圾回收时间
            retry: 1, // 失败重试1次
            refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
            refetchOnMount: false, // 组件挂载时不重新获取（如果数据仍然新鲜）
            refetchOnReconnect: true, // 网络重连时重新获取
            // 性能优化
            structuralSharing: true, // 结构共享优化
            throwOnError: false, // 不抛出错误，避免组件崩溃
          },
          mutations: {
            // 优化变更配置
            retry: 1, // 失败重试1次
            retryDelay: 1000, // 重试延迟1秒
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 开发环境下显示 React Query Devtools */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

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
            // 默认查询配置
            staleTime: 5 * 60 * 1000, // 5分钟数据保持新鲜
            gcTime: 10 * 60 * 1000, // 10分钟垃圾回收时间
            retry: 1, // 失败重试1次
            refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
          },
          mutations: {
            // 默认变更配置
            retry: 1, // 失败重试1次
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

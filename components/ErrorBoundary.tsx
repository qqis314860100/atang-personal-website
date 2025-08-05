// components/ErrorBoundary.tsx
'use client'

import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { AlertCircle, RefreshCcw } from 'lucide-react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // 监听全局未捕获的错误
    const handleError = (event: ErrorEvent) => {
      // 检查是否是会话相关错误
      if (
        event.error &&
        event.error.message &&
        (event.error.message.includes('Auth session missing') ||
          event.error.message.includes('JWT expired') ||
          event.error.message.includes('Invalid JWT'))
      ) {
        setHasError(true)
        // 防止错误继续传播
        event.preventDefault()
      }
    }

    // 监听未处理的 Promise 拒绝
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // 检查是否是会话相关错误
      if (
        event.reason &&
        event.reason.message &&
        (event.reason.message.includes('Auth session missing') ||
          event.reason.message.includes('JWT expired') ||
          event.reason.message.includes('Invalid JWT'))
      ) {
        setHasError(true)
        // 防止错误继续传播
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  // 如果检测到会话错误，显示恢复选项
  if (hasError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>会话已过期</AlertTitle>
            <AlertDescription>
              您的登录会话已失效或过期。这可能是由于长时间未活动、手动删除
              Cookie 或其他原因导致的。
            </AlertDescription>
          </Alert>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={() => {
                // 刷新页面
                window.location.reload()
              }}
              className="w-full"
              variant="default"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              刷新页面
            </Button>

            <Button
              onClick={() => {
                // 使用原生方法重定向到登录页面
                const currentPath = window.location.pathname
                const locale = currentPath.split('/')[1] || 'zh'
                window.location.href = `/${locale}/login?reason=session_expired`
              }}
              className="w-full"
              variant="outline"
            >
              重新登录
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// components/ErrorBoundary.tsx
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新状态，下次渲染时显示错误UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // 检查是否是Next.js开发工具错误
    if (
      error.message.includes('callback is no longer runnable') ||
      error.message.includes('use-app-dev-rendering-indicator') ||
      error.message.includes('use-action-queue') ||
      error.message.includes('next-devtools') ||
      error.message.includes('app-router')
    ) {
      console.warn('检测到Next.js开发工具错误，忽略此错误:', {
        error: error.message,
        errorInfo,
      })
      // 对于Next.js开发工具错误，不显示错误UI
      this.setState({ hasError: false })
      return
    }
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误UI
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    出现了一些问题
                  </h3>
                  <p className="text-sm text-gray-500">
                    页面遇到了一个错误，请刷新页面重试
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

// 函数式错误边界Hook
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // 检查是否是回调函数错误
      if (event.error?.message?.includes('callback is no longer runnable')) {
        console.warn('捕获到回调函数错误，忽略此错误')
        event.preventDefault()
        return
      }

      setError(event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // 检查是否是回调函数相关的Promise拒绝
      if (event.reason?.message?.includes('callback is no longer runnable')) {
        console.warn('捕获到回调函数Promise拒绝，忽略此错误')
        event.preventDefault()
        return
      }

      setError(new Error(event.reason))
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return error
}

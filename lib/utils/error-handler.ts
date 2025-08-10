// 全局错误处理器
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return

  // 处理同步错误
  const originalOnError = window.onerror
  window.onerror = function (message, source, lineno, colno, error) {
    // 检查是否是回调函数错误
    if (
      typeof message === 'string' &&
      message.includes('callback is no longer runnable')
    ) {
      console.warn('捕获到回调函数错误，忽略此错误:', {
        message,
        source,
        lineno,
        colno,
        error,
      })
      return true // 阻止错误继续传播
    }

    // 检查是否是Next.js开发工具错误
    if (
      typeof message === 'string' &&
      (message.includes('use-app-dev-rendering-indicator') ||
        message.includes('use-action-queue') ||
        message.includes('next-devtools') ||
        message.includes('app-router'))
    ) {
      console.warn('捕获到Next.js开发工具错误，忽略此错误:', {
        message,
        source,
        lineno,
        colno,
        error,
      })
      return true // 阻止错误继续传播
    }

    // 调用原始错误处理器
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error)
    }
  }

  // 处理Promise拒绝
  const originalOnUnhandledRejection = window.onunhandledrejection
  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    // 检查是否是回调函数相关的Promise拒绝
    if (
      event.reason &&
      typeof event.reason === 'object' &&
      'message' in event.reason
    ) {
      const message = event.reason.message
      if (
        typeof message === 'string' &&
        message.includes('callback is no longer runnable')
      ) {
        console.warn('捕获到回调函数Promise拒绝，忽略此错误:', event.reason)
        event.preventDefault()
        return
      }
    }

    // 调用原始Promise拒绝处理器
    if (originalOnUnhandledRejection) {
      return (originalOnUnhandledRejection as any).call(this, event)
    }
  }

  // 处理React错误边界未捕获的错误
  const handleReactError = (error: Error, errorInfo: any) => {
    if (error.message.includes('callback is no longer runnable')) {
      console.warn('React错误边界捕获到回调函数错误，忽略此错误:', {
        error,
        errorInfo,
      })
      return true // 阻止错误继续传播
    }
    return false
  }

  return {
    handleReactError,
  }
}

// 检查是否是开发环境
export function isDevelopment() {
  return process.env.NODE_ENV === 'development'
}

// 检查是否是Next.js开发工具错误
export function isNextDevToolsError(error: Error | string): boolean {
  const message = typeof error === 'string' ? error : error.message
  return (
    message.includes('use-app-dev-rendering-indicator') ||
    message.includes('use-action-queue') ||
    message.includes('callback is no longer runnable') ||
    message.includes('next-devtools') ||
    message.includes('app-router')
  )
}

// 安全的错误日志记录
export function safeErrorLog(error: Error, context?: string) {
  if (isNextDevToolsError(error)) {
    console.warn(
      `[${context || 'App'}] 忽略Next.js开发工具错误:`,
      error.message
    )
    return
  }

  console.error(`[${context || 'App'}] 错误:`, error)
}

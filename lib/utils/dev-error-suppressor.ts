// 开发环境错误抑制器
// 专门用于抑制Next.js开发工具的错误

export function suppressDevErrors() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return
  }

  // 保存原始的console.error
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  // 错误模式匹配
  const errorPatterns = [
    'callback is no longer runnable',
    'use-app-dev-rendering-indicator',
    'use-action-queue',
    'next-devtools',
    'app-router',
    'webpack-internal',
    'react-dom.development',
  ]

  // 检查是否应该抑制错误
  function shouldSuppressError(...args: any[]): boolean {
    const message = args.join(' ')
    return errorPatterns.some((pattern) => message.includes(pattern))
  }

  // 重写console.error
  console.error = (...args: any[]) => {
    if (shouldSuppressError(...args)) {
      // 抑制Next.js开发工具错误
      console.warn('🚫 抑制Next.js开发工具错误:', args[0])
      return
    }
    // 正常输出其他错误
    originalConsoleError.apply(console, args)
  }

  // 重写console.warn
  console.warn = (...args: any[]) => {
    if (shouldSuppressError(...args)) {
      // 抑制Next.js开发工具警告
      return
    }
    // 正常输出其他警告
    originalConsoleWarn.apply(console, args)
  }

  // 处理未捕获的错误
  const originalOnError = window.onerror
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === 'string' && shouldSuppressError(message)) {
      console.warn('🚫 抑制未捕获的Next.js开发工具错误:', message)
      return true // 阻止错误继续传播
    }

    // 调用原始错误处理器
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error)
    }
  }

  // 处理未处理的Promise拒绝
  const originalOnUnhandledRejection = window.onunhandledrejection
  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    const reason = event.reason
    const message = reason?.message || String(reason)

    if (shouldSuppressError(message)) {
      console.warn('🚫 抑制未处理的Next.js开发工具Promise拒绝:', message)
      event.preventDefault()
      return
    }

    // 调用原始Promise拒绝处理器
    if (originalOnUnhandledRejection) {
      return (originalOnUnhandledRejection as any).call(this, event)
    }
  }

  console.log('🔧 开发环境错误抑制器已启用')

  // 返回清理函数
  return () => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    window.onerror = originalOnError
    window.onunhandledrejection = originalOnUnhandledRejection
    console.log('🔧 开发环境错误抑制器已禁用')
  }
}

// 检查是否是开发环境
export function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

// 检查是否是Next.js开发工具错误
export function isNextDevToolsError(message: string): boolean {
  const patterns = [
    'callback is no longer runnable',
    'use-app-dev-rendering-indicator',
    'use-action-queue',
    'next-devtools',
    'app-router',
    'webpack-internal',
  ]
  return patterns.some((pattern) => message.includes(pattern))
}

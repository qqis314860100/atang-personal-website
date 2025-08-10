// React错误处理器
import { isNextDevToolsError } from './error-handler'

// React错误处理配置
export const REACT_ERROR_CONFIG = {
  // 需要忽略的Next.js开发工具错误
  IGNORE_PATTERNS: [
    'callback is no longer runnable',
    'use-app-dev-rendering-indicator',
    'use-action-queue',
    'next-devtools',
    'app-router',
    'react-dom.development',
    'webpack-internal',
  ],

  // 需要忽略的错误来源
  IGNORE_SOURCES: [
    'next/dist/next-devtools',
    'next/dist/client/components',
    'next/dist/client/request',
    'webpack-internal',
  ],
}

// 检查是否应该忽略React错误
export function shouldIgnoreReactError(
  error: Error | string,
  errorInfo?: any
): boolean {
  const message = typeof error === 'string' ? error : error.message
  const stack = error instanceof Error ? error.stack || '' : ''

  // 检查错误消息模式
  for (const pattern of REACT_ERROR_CONFIG.IGNORE_PATTERNS) {
    if (message.includes(pattern)) {
      return true
    }
  }

  // 检查错误来源
  for (const source of REACT_ERROR_CONFIG.IGNORE_SOURCES) {
    if (stack.includes(source)) {
      return true
    }
  }

  // 检查是否是Next.js开发工具错误
  if (isNextDevToolsError(error)) {
    return true
  }

  return false
}

// React错误处理器Hook
export function useReactErrorHandler() {
  const handleError = (error: Error, errorInfo?: any) => {
    if (shouldIgnoreReactError(error, errorInfo)) {
      console.warn('React错误处理器: 忽略Next.js开发工具错误:', {
        message: error.message,
        stack: error.stack?.slice(0, 200), // 只显示前200个字符
        errorInfo,
      })
      return true // 表示错误已被处理
    }

    // 对于其他错误，正常记录
    console.error('React错误处理器: 捕获到应用错误:', {
      message: error.message,
      stack: error.stack,
      errorInfo,
    })
    return false // 表示错误需要进一步处理
  }

  return { handleError }
}

// 全局React错误处理器
export function setupReactErrorHandler() {
  if (typeof window === 'undefined') return

  // 保存原始的console.error
  const originalConsoleError = console.error

  // 重写console.error来过滤Next.js开发工具错误
  console.error = (...args) => {
    const message = args.join(' ')

    // 检查是否是Next.js开发工具错误
    if (shouldIgnoreReactError(message)) {
      console.warn('Console错误处理器: 忽略Next.js开发工具错误:', message)
      return
    }

    // 对于其他错误，正常输出
    originalConsoleError.apply(console, args)
  }

  // 返回清理函数
  return () => {
    console.error = originalConsoleError
  }
}

// React 19特定的错误处理
export function handleReact19Errors() {
  if (typeof window === 'undefined') return

  // React 19可能有不同的错误处理机制
  const originalAddEventListener = window.addEventListener

  window.addEventListener = function (
    type: string,
    listener: EventListener | EventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // 如果是错误事件，包装监听器
    if (type === 'error') {
      const wrappedListener = (event: Event) => {
        const errorEvent = event as ErrorEvent
        if (shouldIgnoreReactError(errorEvent.error || errorEvent.message)) {
          console.warn(
            'React 19错误处理器: 忽略Next.js开发工具错误:',
            errorEvent
          )
          return
        }
        // 调用原始监听器
        if (typeof listener === 'function') {
          listener.call(this, event)
        }
      }
      return originalAddEventListener.call(this, type, wrappedListener, options)
    }

    // 对于其他事件，正常添加
    return originalAddEventListener.call(this, type, listener, options)
  }
}

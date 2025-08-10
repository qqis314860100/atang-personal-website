'use client'

import { suppressDevErrors } from '@/lib/utils/dev-error-suppressor'
import { setupGlobalErrorHandler } from '@/lib/utils/error-handler'
import {
  handleReact19Errors,
  setupReactErrorHandler,
} from '@/lib/utils/react-error-handler'
import { useEffect } from 'react'

export function GlobalErrorHandler() {
  useEffect(() => {
    // 设置全局错误处理器
    setupGlobalErrorHandler()

    // 设置React错误处理器
    setupReactErrorHandler()

    // 设置React 19特定的错误处理
    handleReact19Errors()

    // 启用开发环境错误抑制器
    const cleanup = suppressDevErrors()

    console.log('🔧 全局错误处理器已设置')

    // 清理函数
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  return null
}

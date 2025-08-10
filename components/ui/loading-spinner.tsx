'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  showText?: boolean
}

export function LoadingSpinner({
  size = 'md',
  className,
  text = '加载中...',
  showText = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-2',
        className
      )}
    >
      {/* 轻量级加载动画 */}
      <div className={cn('relative', sizeClasses[size])}>
        <div className="absolute inset-0 border-2 border-gray-200 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* 加载文本 */}
      {showText && <p className="text-xs text-muted-foreground">{text}</p>}
    </div>
  )
}

interface LoadingOverlayProps {
  children?: React.ReactNode
  text?: string
  showOverlay?: boolean
}

export function LoadingOverlay({
  children,
  text = '加载中...',
  showOverlay = true,
}: LoadingOverlayProps) {
  if (!showOverlay) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border rounded-lg p-6 max-w-xs w-full mx-4 text-center">
        <div className="flex flex-col items-center space-y-4">
          {/* 轻量级加载动画 */}
          <LoadingSpinner size="md" showText={false} />

          {/* 加载文本 */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-foreground">{text}</h3>
          </div>
        </div>
      </div>
    </div>
  )
}

// 卡片加载组件
export function CardLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      <div className="text-center">
        <LoadingSpinner size="md" text={text} />
        <p className="text-gray-500 text-xs mt-2">请稍候</p>
      </div>
    </div>
  )
}

// 内联加载组件
export function InlineLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" text="" showText={false} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

// 骨架屏加载组件
export function SkeletonLoading({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

// 进度条加载组件
export function ProgressLoading({
  progress = 0,
  text = '加载中...',
}: {
  progress?: number
  text?: string
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{text}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

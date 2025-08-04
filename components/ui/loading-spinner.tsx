import { cn } from '@/utils/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
  variant?: 'default' | 'pulse' | 'dots' | 'wave'
}

export function LoadingSpinner({
  size = 'md',
  text = '加载中...',
  className,
  variant = 'default',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <div className="relative">
            <div
              className={cn(
                'bg-blue-500 rounded-full animate-ping',
                sizeClasses[size]
              )}
            ></div>
            <div
              className={cn(
                'absolute inset-0 bg-blue-500 rounded-full',
                sizeClasses[size]
              )}
            ></div>
          </div>
        )

      case 'dots':
        return (
          <div className="flex space-x-1">
            <div
              className={cn(
                'bg-blue-500 rounded-full animate-bounce',
                size === 'sm'
                  ? 'w-1 h-1'
                  : size === 'md'
                  ? 'w-2 h-2'
                  : 'w-3 h-3'
              )}
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className={cn(
                'bg-blue-500 rounded-full animate-bounce',
                size === 'sm'
                  ? 'w-1 h-1'
                  : size === 'md'
                  ? 'w-2 h-2'
                  : 'w-3 h-3'
              )}
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className={cn(
                'bg-blue-500 rounded-full animate-bounce',
                size === 'sm'
                  ? 'w-1 h-1'
                  : size === 'md'
                  ? 'w-2 h-2'
                  : 'w-3 h-3'
              )}
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        )

      case 'wave':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-blue-500 rounded-full animate-pulse',
                  size === 'sm'
                    ? 'w-1 h-1'
                    : size === 'md'
                    ? 'w-2 h-2'
                    : 'w-3 h-3'
                )}
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1s',
                }}
              ></div>
            ))}
          </div>
        )

      default:
        return (
          <div className="relative">
            {/* 外圈旋转 */}
            <div
              className={cn(
                'border-4 border-gray-200 rounded-full animate-spin',
                sizeClasses[size]
              )}
            >
              <div
                className={cn(
                  'border-4 border-blue-500 border-t-transparent rounded-full',
                  sizeClasses[size]
                )}
              ></div>
            </div>

            {/* 内圈脉冲 */}
            <div
              className={cn(
                'absolute inset-0 border-2 border-blue-300 rounded-full animate-pulse',
                sizeClasses[size]
              )}
            ></div>

            {/* 中心点 */}
            <div
              className={cn(
                'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
                'w-1 h-1 bg-blue-500 rounded-full animate-ping'
              )}
            ></div>
          </div>
        )
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4',
        className
      )}
    >
      {/* 主加载动画 */}
      {renderSpinner()}

      {/* 加载文本 */}
      {text && (
        <div className="text-center">
          <p className={cn('text-gray-600 font-medium', textSizes[size])}>
            {text}
          </p>
          {/* 动态点 */}
          <div className="flex justify-center space-x-1 mt-1">
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

// 全屏加载组件
export function FullScreenLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-sm w-full mx-4">
        <LoadingSpinner size="lg" text={text} variant="default" />
      </div>
    </div>
  )
}

// 卡片加载组件
export function CardLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
      <div className="text-center">
        <LoadingSpinner size="md" text={text} variant="pulse" />
        <p className="text-gray-500 text-xs mt-4">请稍候，正在为您准备内容</p>
      </div>
    </div>
  )
}

// 内联加载组件
export function InlineLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" text="" variant="dots" />
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
      <div className="flex justify-center space-x-1">
        <div
          className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        ></div>
        <div
          className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        ></div>
      </div>
    </div>
  )
}

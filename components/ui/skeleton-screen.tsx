'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  )
}

interface SkeletonScreenProps {
  children?: React.ReactNode
  showOverlay?: boolean
}

export function SkeletonScreen({
  children,
  showOverlay = true,
}: SkeletonScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航骨架屏 */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center px-4">
          {/* Logo 骨架屏 */}
          <div className="flex items-center gap-2 mr-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-24 h-4" />
          </div>

          {/* 导航骨架屏 */}
          <div className="hidden md:flex flex-1 justify-start">
            <div className="flex space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-16 h-4" />
              ))}
            </div>
          </div>

          {/* 右侧功能区骨架屏 */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex">
              <Skeleton className="w-48 h-9" />
            </div>
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-9 h-9" />
            <Skeleton className="w-16 h-9" />
          </div>
        </div>
      </div>

      {/* 主内容骨架屏 */}
      <main className="flex-1">
        <div className="py-6">
          <div className="container mx-auto px-4">
            {/* 页面标题骨架屏 */}
            <div className="mb-8">
              <Skeleton className="w-48 h-8 mb-4" />
              <Skeleton className="w-96 h-4" />
            </div>

            {/* 内容卡片骨架屏 */}
            <div className="grid gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-card border rounded-lg p-6">
                  <Skeleton className="w-32 h-6 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 底部骨架屏 */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <Skeleton className="w-32 h-4" />
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-16 h-4" />
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* 自定义内容 */}
      {children}

      {/* 加载遮罩 */}
      {showOverlay && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-200 rounded-full animate-spin">
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="text-lg font-medium">正在加载用户状态...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  请稍候，正在为您准备个性化内容
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

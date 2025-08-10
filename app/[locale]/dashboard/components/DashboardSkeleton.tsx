'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { getThemeClasses } from '@/lib/theme/colors'
import { useTheme } from 'next-themes'

// 骨架屏卡片组件
function SkeletonCard({ children }: { children: React.ReactNode }) {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const cardStyles = getThemeClasses('border-0', currentTheme, {
    card: 'glass',
    border: 'primary',
  })

  return (
    <ThemeCard variant="glass" className={cardStyles}>
      <ThemeCardContent className="p-6">{children}</ThemeCardContent>
    </ThemeCard>
  )
}

// 骨架屏列表项组件
function SkeletonListItem() {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  const itemStyles = getThemeClasses('rounded-lg p-4', currentTheme, {
    card: 'secondary',
    border: 'secondary',
  })

  return (
    <div className={`flex items-center justify-between ${itemStyles}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div>
          <Skeleton className="h-4 w-20 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <Skeleton className="h-4 w-8 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
    </div>
  )
}

// 骨架屏标题组件
function SkeletonTitle() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="w-10 h-10 rounded-lg" />
      <Skeleton className="h-6 w-32" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-8">
        {/* 顶部核心指标卡片骨架屏 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index}>
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24" />
              </div>
            </SkeletonCard>
          ))}
        </div>

        {/* 主要内容区域骨架屏 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 性能指标骨架屏 */}
          <ThemeCard variant="glass" className="border-0">
            <ThemeCardHeader className="pb-4">
              <ThemeCardTitle>
                <SkeletonTitle />
              </ThemeCardTitle>
            </ThemeCardHeader>
            <ThemeCardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonListItem key={index} />
                ))}
              </div>
            </ThemeCardContent>
          </ThemeCard>

          {/* 热门页面骨架屏 */}
          <ThemeCard variant="glass" className="border-0">
            <ThemeCardHeader className="pb-4">
              <ThemeCardTitle>
                <SkeletonTitle />
              </ThemeCardTitle>
            </ThemeCardHeader>
            <ThemeCardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonListItem key={index} />
                ))}
              </div>
            </ThemeCardContent>
          </ThemeCard>
        </div>

        {/* 错误日志骨架屏 */}
        <ThemeCard variant="glass" className="border-0">
          <ThemeCardHeader className="pb-4">
            <ThemeCardTitle>
              <SkeletonTitle />
            </ThemeCardTitle>
          </ThemeCardHeader>
          <ThemeCardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Skeleton className="h-6 w-6 mb-1" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </ThemeCardContent>
        </ThemeCard>
      </div>
    </div>
  )
}

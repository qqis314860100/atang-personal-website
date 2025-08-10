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

export function AnalyticsSkeleton() {
  const { theme, resolvedTheme } = useTheme()
  const currentTheme = (resolvedTheme || theme || 'light') as 'light' | 'dark'

  // 主题样式
  const cardStyles = getThemeClasses('border-0', currentTheme, {
    card: 'glass',
    border: 'primary',
  })

  const skeletonStyles = currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'

  const itemStyles = getThemeClasses('rounded-lg', currentTheme, {
    card: 'secondary',
    border: 'secondary',
  })

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-8">
        {/* 顶部核心指标卡片骨架屏 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <ThemeCard key={index} variant="glass" className={cardStyles}>
              <ThemeCardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className={`h-6 w-20 ${skeletonStyles}`} />
                </div>
                <div className="space-y-2">
                  <Skeleton className={`h-8 w-24 ${skeletonStyles}`} />
                </div>
              </ThemeCardContent>
            </ThemeCard>
          ))}
        </div>

        {/* 主要内容区域骨架屏 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 设备分布热力图骨架屏 */}
          <ThemeCard variant="glass" className={cardStyles}>
            <ThemeCardHeader className="pb-4">
              <ThemeCardTitle className="flex items-center gap-3 text-lg font-semibold">
                <Skeleton
                  className={`w-10 h-10 rounded-lg ${skeletonStyles}`}
                />
                <Skeleton className={`h-6 w-32 ${skeletonStyles}`} />
              </ThemeCardTitle>
            </ThemeCardHeader>
            <ThemeCardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${itemStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton
                        className={`w-8 h-8 rounded-lg ${skeletonStyles}`}
                      />
                      <div>
                        <Skeleton
                          className={`h-4 w-20 ${skeletonStyles} mb-1`}
                        />
                        <Skeleton className={`h-3 w-16 ${skeletonStyles}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Skeleton
                          className={`h-4 w-8 ${skeletonStyles} mb-1`}
                        />
                        <Skeleton className={`h-3 w-12 ${skeletonStyles}`} />
                      </div>
                      <Skeleton
                        className={`w-4 h-4 rounded-full ${skeletonStyles}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ThemeCardContent>
          </ThemeCard>

          {/* 热门页面热力图骨架屏 */}
          <ThemeCard variant="glass" className={cardStyles}>
            <ThemeCardHeader className="pb-4">
              <ThemeCardTitle className="flex items-center gap-3 text-lg font-semibold">
                <Skeleton
                  className={`w-10 h-10 rounded-lg ${skeletonStyles}`}
                />
                <Skeleton className={`h-6 w-32 ${skeletonStyles}`} />
              </ThemeCardTitle>
            </ThemeCardHeader>
            <ThemeCardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 ${itemStyles}`}
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton
                        className={`w-8 h-8 rounded-lg ${skeletonStyles}`}
                      />
                      <div>
                        <Skeleton
                          className={`h-4 w-24 ${skeletonStyles} mb-1`}
                        />
                        <Skeleton className={`h-3 w-20 ${skeletonStyles}`} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Skeleton
                          className={`h-4 w-8 ${skeletonStyles} mb-1`}
                        />
                        <Skeleton className={`h-3 w-12 ${skeletonStyles}`} />
                      </div>
                      <Skeleton
                        className={`w-4 h-4 rounded-full ${skeletonStyles}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ThemeCardContent>
          </ThemeCard>
        </div>

        {/* 错误日志骨架屏 */}
        <ThemeCard variant="glass" className={cardStyles}>
          <ThemeCardHeader className="pb-4">
            <ThemeCardTitle className="flex items-center gap-3 text-lg font-semibold">
              <Skeleton className={`w-10 h-10 rounded-lg ${skeletonStyles}`} />
              <Skeleton className={`h-6 w-32 ${skeletonStyles}`} />
            </ThemeCardTitle>
          </ThemeCardHeader>
          <ThemeCardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 ${itemStyles}`}
                >
                  <div className="flex items-center gap-3">
                    <Skeleton
                      className={`w-8 h-8 rounded-full ${skeletonStyles}`}
                    />
                    <div>
                      <Skeleton className={`h-4 w-20 ${skeletonStyles} mb-1`} />
                      <Skeleton className={`h-3 w-24 ${skeletonStyles}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Skeleton className={`h-6 w-6 ${skeletonStyles} mb-1`} />
                      <Skeleton className={`h-3 w-12 ${skeletonStyles}`} />
                    </div>
                    <Skeleton
                      className={`h-6 w-12 rounded-full ${skeletonStyles}`}
                    />
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

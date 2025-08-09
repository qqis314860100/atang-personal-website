'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="p-6 space-y-8">
        {/* 顶部核心指标卡片骨架屏 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-20 bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24 bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 主要内容区域骨架屏 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 设备分布热力图骨架屏 */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
                <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                <Skeleton className="h-6 w-32 bg-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg bg-gray-700" />
                      <div>
                        <Skeleton className="h-4 w-20 bg-gray-700 mb-1" />
                        <Skeleton className="h-3 w-16 bg-gray-700" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Skeleton className="h-4 w-8 bg-gray-700 mb-1" />
                        <Skeleton className="h-3 w-12 bg-gray-700" />
                      </div>
                      <Skeleton className="w-4 h-4 rounded-full bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 热门页面热力图骨架屏 */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
                <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
                <Skeleton className="h-6 w-32 bg-gray-700" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg bg-gray-700" />
                      <div>
                        <Skeleton className="h-4 w-24 bg-gray-700 mb-1" />
                        <Skeleton className="h-3 w-20 bg-gray-700" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <Skeleton className="h-4 w-8 bg-gray-700 mb-1" />
                        <Skeleton className="h-3 w-12 bg-gray-700" />
                      </div>
                      <Skeleton className="w-4 h-4 rounded-full bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        {/* 错误日志骨架屏 */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-white">
              <Skeleton className="w-10 h-10 rounded-lg bg-gray-700" />
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-gray-700" />
                    <div>
                      <Skeleton className="h-4 w-20 bg-gray-700 mb-1" />
                      <Skeleton className="h-3 w-24 bg-gray-700" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Skeleton className="h-4 w-6 bg-gray-700 mb-1" />
                      <Skeleton className="h-3 w-12 bg-gray-700" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

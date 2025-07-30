'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LoadingSpinner,
  FullScreenLoading,
  CardLoading,
  InlineLoading,
  SkeletonLoading,
  ProgressLoading,
} from '@/components/ui/loading-spinner'

export default function LoadingDemoPage() {
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [progress, setProgress] = useState(0)

  const startProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">加载组件演示</h1>
        <p className="text-gray-600">展示各种美观的加载状态组件</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 基础加载组件 */}
        <Card>
          <CardHeader>
            <CardTitle>基础加载组件</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <LoadingSpinner size="sm" text="小尺寸" />
              <LoadingSpinner size="md" text="中尺寸" />
              <LoadingSpinner size="lg" text="大尺寸" />
            </div>
          </CardContent>
        </Card>

        {/* 不同变体 */}
        <Card>
          <CardHeader>
            <CardTitle>不同动画变体</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <LoadingSpinner variant="default" text="默认" />
              <LoadingSpinner variant="pulse" text="脉冲" />
              <LoadingSpinner variant="dots" text="点状" />
              <LoadingSpinner variant="wave" text="波浪" />
            </div>
          </CardContent>
        </Card>

        {/* 内联加载 */}
        <Card>
          <CardHeader>
            <CardTitle>内联加载</CardTitle>
          </CardHeader>
          <CardContent>
            <InlineLoading text="正在处理数据..." />
          </CardContent>
        </Card>

        {/* 骨架屏 */}
        <Card>
          <CardHeader>
            <CardTitle>骨架屏加载</CardTitle>
          </CardHeader>
          <CardContent>
            <SkeletonLoading />
          </CardContent>
        </Card>

        {/* 进度条 */}
        <Card>
          <CardHeader>
            <CardTitle>进度条加载</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressLoading progress={progress} text="文件上传中" />
            <Button onClick={startProgress} variant="outline" size="sm">
              开始进度
            </Button>
          </CardContent>
        </Card>

        {/* 全屏加载 */}
        <Card>
          <CardHeader>
            <CardTitle>全屏加载</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowFullScreen(true)}
              variant="outline"
              className="w-full"
            >
              显示全屏加载
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 卡片加载演示 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>卡片加载演示</CardTitle>
          </CardHeader>
          <CardContent>
            <CardLoading text="正在加载用户资料..." />
          </CardContent>
        </Card>
      </div>

      {/* 全屏加载覆盖层 */}
      {showFullScreen && <FullScreenLoading text="正在初始化应用..." />}

      {/* 关闭全屏加载的按钮 */}
      {showFullScreen && (
        <div className="fixed top-4 right-4 z-[60]">
          <Button
            onClick={() => setShowFullScreen(false)}
            variant="outline"
            size="sm"
          >
            关闭
          </Button>
        </div>
      )}
    </div>
  )
}

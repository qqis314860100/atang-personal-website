'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DanmakuList } from './components/DanmakuList'
import { VideoInfo } from './components/VideoInfo'
import { VideoPlayer } from './components/VideoPlayer'
import { VideoPlayerSkeleton } from './components/VideoPlayerSkeleton'

interface VideoPlayerPageProps {
  searchParams: Promise<{
    id?: string
  }>
}

export default function VideoPlayerPage({
  searchParams,
}: VideoPlayerPageProps) {
  const [videoId, setVideoId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const videoPlayerRef = useRef<{ jumpToTime: (timeMs: number) => void }>(null)

  // 处理弹幕列表时间跳转
  const handleDanmakuTimeJump = useCallback((timeMs: number) => {
    console.log(`🎯 页面级别弹幕跳转: ${timeMs}ms`)
    if (videoPlayerRef.current) {
      videoPlayerRef.current.jumpToTime(timeMs)
    }
  }, [])

  // 处理搜索参数
  useEffect(() => {
    const fetchSearchParams = async () => {
      const { id } = await searchParams
      if (id) {
        setVideoId(id)
        // 保持 isLoading = true，等待视频加载完成
      }
    }
    fetchSearchParams()
  }, [searchParams])

  // 显示骨架屏
  if (isLoading) {
    return (
      <div className="animate-fadeIn">
        <VideoPlayerSkeleton progress={50} stage="video" />
      </div>
    )
  }

  // 如果没有 videoId，显示错误状态
  if (!videoId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl animate-bounce">⚠️</div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-900">视频ID未提供</h1>
            <p className="text-gray-600 leading-relaxed">
              请确保从正确的链接访问此页面，或者检查URL参数是否正确。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              返回上一页
            </button>
            <button
              onClick={() => (window.location.href = '/project/video-manage')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
            >
              视频管理
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 添加调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2">🔍 调试信息</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>videoId: {videoId || '未设置'}</p>
              <p>isLoading: {isLoading ? 'true' : 'false'}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* 主视频区域 */}
          <div className="lg:col-span-7 space-y-6">
            {/* 视频播放器 */}
            <VideoPlayer
              ref={videoPlayerRef}
              videoId={videoId}
              onLoadingStateChange={({ isLoading, stage }) => {
                // 当视频加载完成时，隐藏骨架屏
                if (stage === 'complete') {
                  console.log('🎉 视频加载完成，隐藏骨架屏')
                  setTimeout(() => setIsLoading(false), 500)
                }
              }}
            />

            {/* 视频信息 */}
            <VideoInfo videoId={videoId} />
          </div>

          {/* 侧边栏 - 弹幕列表 */}
          <div className="lg:col-span-3">
            <DanmakuList videoId={videoId} onTimeJump={handleDanmakuTimeJump} />
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { DanmakuList } from './components/DanmakuList'
import NoVideoIDErrot from './components/NoVideoIDErrot'
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
  const [isSearching, setIsSearching] = useState(true) // 标记是否正在搜索参数
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
      try {
        setIsSearching(true)
        const { id } = await searchParams
        if (id) {
          setVideoId(id)
          console.log('📋 获取到 videoId:', id)
        } else {
          console.warn('⚠️ 未获取到 videoId')
        }
      } catch (error) {
        console.error('❌ 获取搜索参数失败:', error)
      } finally {
        setIsSearching(false)
      }
    }
    fetchSearchParams()
  }, [searchParams])

  // 首屏显示骨架屏（正在获取 videoId 或正在加载视频）
  if (isSearching || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 添加调试信息 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">🔍 调试信息</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>videoId: {videoId || '未设置'}</p>
                <p>isSearching: {isSearching ? 'true' : 'false'}</p>
                <p>isLoading: {isLoading ? 'true' : 'false'}</p>
                <p>
                  阶段:{' '}
                  {isSearching
                    ? '获取videoId中...'
                    : isLoading
                    ? '获取视频资源中...'
                    : '视频加载完成'}
                </p>
              </div>
            </div>
          )}

          {/* 当正在获取 videoId 时显示骨架屏 */}
          {isSearching ? (
            <VideoPlayerSkeleton stage="id" />
          ) : (
            /* 当正在加载视频时显示骨架屏，但VideoPlayer组件仍然渲染以触发数据加载 */
            <div className="relative">
              {/* 隐藏的VideoPlayer组件，用于触发useVideo hook和视频资源加载 */}
              <div className="hidden">
                <VideoPlayer
                  ref={videoPlayerRef}
                  videoId={videoId}
                  onLoadingStateChange={({ isLoading, stage }) => {
                    console.log('📊 加载状态变化:', { isLoading, stage })
                    // 当视频加载完成时，隐藏骨架屏
                    if (stage === 'complete') {
                      console.log('🎉 视频加载完成，隐藏骨架屏')
                      setTimeout(() => setIsLoading(false), 500)
                    }
                  }}
                />
              </div>

              {/* 显示骨架屏 */}
              <VideoPlayerSkeleton stage="video" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // 如果没有 videoId，显示错误状态
  if (!videoId) {
    return <NoVideoIDErrot />
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
              <p>isSearching: {isSearching ? 'true' : 'false'}</p>
              <p>isLoading: {isLoading ? 'true' : 'false'}</p>
              <p>
                阶段:{' '}
                {isSearching
                  ? '获取videoId中...'
                  : isLoading
                  ? '获取视频资源中...'
                  : '视频加载完成'}
              </p>
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
                console.log('📊 加载状态变化:', { isLoading, stage })
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

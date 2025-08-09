'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Users,
} from 'lucide-react'
import { Danmaku } from './Danmaku'
import { useVideo } from '@/app/hooks/use-videos'
import { useDanmakuList, useSendDanmaku } from '@/app/hooks/use-danmaku'
import { useStableUser } from '@/lib/query-hook/use-auth'
import './video-player.css'
import { useSocket } from '@/app/hooks/use-socket'

interface VideoPlayerProps {
  videoId: string
}

export function VideoPlayer({ videoId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [danmakuText, setDanmakuText] = useState('')
  const [showDanmaku, setShowDanmaku] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  const { userCount } = useSocket()
  // 获取用户信息
  const { user } = useStableUser()

  // 获取视频数据
  const {
    data: video,
    isLoading: videoLoading,
    error: videoError,
  } = useVideo(videoId)

  // 获取弹幕列表
  const { data: danmakuData = [], refetch: refetchDanmaku } = useDanmakuList(
    videoId,
    { limit: 100 }
  )

  // 转换弹幕数据格式
  const danmakuList = danmakuData.map((danmaku: any) => {
    // 安全处理日期
    let sendTime = 'Unknown'
    try {
      if (danmaku.createdAt) {
        const date = new Date(danmaku.createdAt)
        if (!isNaN(date.getTime())) {
          sendTime = date.toISOString()
        }
      }
    } catch (error) {
      console.warn('Invalid date for danmaku:', danmaku.id, danmaku.createdAt)
    }

    return {
      id: danmaku.id,
      text: danmaku.content,
      time: danmaku.timeMs / 1000, // 转换为秒
      color: `hsl(${
        (danmaku.id.charCodeAt(0) * danmaku.id.charCodeAt(1)) % 360
      }, 70%, 60%)`, // 基于ID的确定性颜色
      type: 'scroll' as const,
      sendTime,
    }
  })

  // 发送弹幕
  const sendDanmakuMutation = useSendDanmaku()

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万'
    }
    return num.toLocaleString()
  }

  // 播放/暂停
  const togglePlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        // 检查视频源是否有效
        if (!videoRef.current.src && !videoRef.current.currentSrc) {
          console.warn('视频源无效，无法播放')
          return
        }

        if (isPlaying) {
          videoRef.current.pause()
          setIsPlaying(false)
        } else {
          // 使用 async/await 处理播放
          await videoRef.current.play()
          setIsPlaying(true)
        }
      } catch (error) {
        console.error('播放视频失败:', error)
        setIsPlaying(false)
      }
    }
  }, [isPlaying])

  // 音量控制
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value)
      setVolume(newVolume)
      if (videoRef.current) {
        videoRef.current.volume = newVolume
        videoRef.current.muted = newVolume === 0
        setIsMuted(newVolume === 0)
      }

      // 动态更新滑块样式
      const slider = e.target
      const percentage = (newVolume * 100).toFixed(0)
      const gradient = `linear-gradient(to bottom, #00a1d6 0%, #00a1d6 ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%)`

      slider.style.background = gradient
    },
    []
  )

  // 静音切换
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !isMuted
      videoRef.current.muted = newMuted
      setIsMuted(newMuted)
    }
  }, [isMuted])

  // 进度控制 - 点击跳转
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !videoRef.current) return

      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const progressWidth = rect.width
      const newTime = (clickX / progressWidth) * duration

      setCurrentTime(newTime)
      videoRef.current.currentTime = newTime
    },
    [duration]
  )

  // 进度控制 - 拖拽
  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true)
      handleProgressClick(e)
    },
    [handleProgressClick]
  )

  // 倍速控制
  const handleSpeedChange = useCallback((speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
      setPlaybackRate(speed)
    }
  }, [])

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // 初始化音量滑块样式
  useEffect(() => {
    const slider = document.querySelector('.volume-slider') as HTMLInputElement
    if (slider) {
      const percentage = (volume * 100).toFixed(0)
      const gradient = `linear-gradient(to bottom, #00a1d6 0%, #00a1d6 ${percentage}%, rgba(255, 255, 255, 0.2) ${percentage}%)`
      slider.style.background = gradient
    }
  }, [volume])

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 发送弹幕
  const sendDanmaku = useCallback(async () => {
    if (!danmakuText.trim() || !videoRef.current || !user) {
      return
    }

    try {
      await sendDanmakuMutation.mutateAsync({
        userId: user.id,
        videoId,
        content: danmakuText,
        timeMs: Math.floor(videoRef.current.currentTime * 1000),
        type: 1, // 滚动弹幕
        color: `hsl(${
          (user.id.charCodeAt(0) * user.id.charCodeAt(1)) % 360
        }, 70%, 60%)`, // 基于用户ID的确定性颜色
      })

      // 发送成功后清空输入框并刷新弹幕列表
      setDanmakuText('')
      refetchDanmaku()
    } catch (error) {
      console.error('发送弹幕失败:', error)
    }
  }, [danmakuText, videoId, user, sendDanmakuMutation, refetchDanmaku])

  // 视频事件处理
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      // 使用视频元素的时长
      if (video.duration && video.duration > 0) {
        setDuration(video.duration)
      }
      console.log('视频元素时长:', video.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    // 添加错误处理
    const handleError = (e: Event) => {
      console.error('视频播放错误:', e)
      const target = e.target as HTMLVideoElement
      if (target.error) {
        console.error('视频错误代码:', target.error.code)
        console.error('视频错误消息:', target.error.message)
      }
    }

    // 添加加载处理
    const handleLoadStart = () => {
      console.log('开始加载视频')
    }

    const handleCanPlay = () => {
      console.log('视频可以播放')
    }

    // 添加键盘事件处理
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
    }

    // 添加鼠标拖拽事件
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && progressRef.current && video) {
        const rect = progressRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const progressWidth = rect.width
        const newTime = Math.max(
          0,
          Math.min((clickX / progressWidth) * duration, duration)
        )

        setCurrentTime(newTime)
        video.currentTime = newTime
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [togglePlay, isDragging, duration])

  // 当视频数据加载完成时，设置时长
  useEffect(() => {
    if (video && video.duration && video.duration > 0) {
      setDuration(video.duration)
    }
  }, [video])

  // 测试视频源是否可访问
  const testVideoSource = useCallback(async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      console.log('视频源测试结果:', {
        url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
      })
      return response.ok
    } catch (error) {
      console.error('视频源测试失败:', url, error)
      return false
    }
  }, [])

  // 调试：打印视频数据
  useEffect(() => {
    if (video) {
      console.log('视频数据:', video)
      console.log('视频时长:', video.duration)
      console.log('视频URL:', video.url)
      console.log('视频缩略图:', video.thumbnail)

      // 验证视频URL
      if (video.url) {
        try {
          const url = new URL(video.url)
          console.log('视频URL有效:', url.href)
          // 测试视频源
          testVideoSource(video.url)
        } catch (error) {
          console.error('视频URL无效:', video.url, error)
        }
      } else {
        console.warn('视频URL为空')
      }
    }
  }, [video, testVideoSource])

  // 自动隐藏控制栏
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isPlaying && showControls) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => clearTimeout(timeout)
  }, [isPlaying, showControls])

  // 加载状态
  if (videoLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <Card className="relative bg-black rounded-lg overflow-hidden">
          <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400">加载中...</div>
          </div>
        </Card>
      </div>
    )
  }

  // 错误状态
  if (videoError || !video) {
    return (
      <div className="space-y-4">
        <div className="text-center text-gray-500 py-8">
          <p>无法加载视频</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 视频标题区域 */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-900">{video.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{formatNumber(video.viewCount)}播放</span>
          <span>{formatNumber(video.danmakuCount)}弹幕</span>
          <span>
            {(() => {
              try {
                if (video.createdAt) {
                  const date = new Date(video.createdAt)
                  if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0]
                  }
                }
                return 'Unknown'
              } catch (error) {
                return 'Unknown'
              }
            })()}
          </span>
        </div>
      </div>

      {/* 视频播放器 */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        onMouseMove={() => setShowControls(true)}
      >
        {/* 视频元素 */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          src={video.url}
          poster={video.thumbnail || undefined}
          preload="metadata"
          controls={false}
          onError={(e) => {
            console.error('视频加载错误:', e)
            const target = e.target as HTMLVideoElement
            if (target.error) {
              console.error('视频错误代码:', target.error.code)
              console.error('视频错误消息:', target.error.message)
            }
          }}
        />

        {/* 弹幕层 */}
        {showDanmaku && (
          <Danmaku danmakuList={danmakuList} currentTime={currentTime} />
        )}

        {/* 观看人数 */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center gap-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
            <Users className="h-3 w-3" />
            <span>
              {userCount}人正在看, 已装填{danmakuList.length}条弹幕
            </span>
          </div>
        </div>

        {/* 控制栏 */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* 进度条 */}
          <div className="mb-4">
            <div
              ref={progressRef}
              className="progress-bar"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              <div
                className="progress-fill"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="progress-handle" />
              </div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 播放/暂停 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              {/* 时间显示 */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* 画质选择 */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                1080P 高清
              </Button>

              {/* 倍速选择 */}
              <div className="speed-selector">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  {playbackRate}x
                </Button>
                <div className="speed-menu">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <div
                      key={speed}
                      className={`speed-option ${
                        playbackRate === speed ? 'active' : ''
                      }`}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </div>
                  ))}
                </div>
              </div>

              {/* 音量控制 */}
              <div className="volume-control">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="volume-slider-container">
                  <div className="volume-value">{Math.round(volume * 100)}</div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-slider"
                  />
                </div>
              </div>

              {/* 全屏 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 弹幕输入框 - 独立部分 */}
      {user && (
        <div className="danmaku-input-area">
          <div className="flex items-center gap-3">
            {/* 左侧：观看人数和弹幕开关 */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{userCount}人正在看</span>
              <span>已装填{danmakuList.length}条弹幕</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDanmaku(!showDanmaku)}
                  className={`danmaku-toggle ${
                    showDanmaku ? 'active' : 'inactive'
                  }`}
                >
                  {showDanmaku ? '✓' : '弹'}
                </Button>
              </div>
            </div>

            {/* 中间：输入框 */}
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={danmakuText}
                onChange={(e) => setDanmakuText(e.target.value)}
                placeholder="发个友善的弹幕见证当下"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && sendDanmaku()}
                disabled={sendDanmakuMutation.isPending}
              />
            </div>

            {/* 右侧：弹幕礼仪和发送按钮 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={sendDanmaku}
                disabled={!danmakuText.trim() || sendDanmakuMutation.isPending}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sendDanmakuMutation.isPending ? '发送中...' : '发送'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 未登录提示 */}
      {!user && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-center text-gray-600">
          <p>请登录后发送弹幕</p>
        </div>
      )}
    </div>
  )
}

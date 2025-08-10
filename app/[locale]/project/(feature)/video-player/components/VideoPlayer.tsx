'use client'

import { useDanmakuList, useSendDanmaku } from '@/app/hooks/use-danmaku'
import { useSocketReadonly } from '@/app/hooks/use-socket'
import { useVideo } from '@/app/hooks/use-videos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStableUser } from '@/lib/query-hook/use-auth'
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Danmaku } from './Danmaku'
import './video-player.css'

interface VideoPlayerProps {
  videoId: string
  onLoadingStateChange?: (state: {
    isLoading: boolean
    stage: string
    progress: number
  }) => void
}

export interface VideoPlayerRef {
  jumpToTime: (timeMs: number) => void
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, onLoadingStateChange }, ref) => {
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
    const [hoverTime, setHoverTime] = useState<number | null>(null)
    const [showHoverTime, setShowHoverTime] = useState(false)

    // 新增状态
    const [videoError, setVideoError] = useState<string | null>(null)
    const [isRetrying, setIsRetrying] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>(
      'online'
    )
    const [videoLoadAttempts, setVideoLoadAttempts] = useState(0)
    const [localDanmaku, setLocalDanmaku] = useState<any[]>([]) // 本地弹幕状态

    const { userCount } = useSocketReadonly()
    // 获取用户信息
    const { user } = useStableUser()

    // 获取视频数据
    const {
      data: video,
      isLoading: videoLoading,
      error: videoDataError,
      refetch: refetchVideo,
    } = useVideo(videoId)

    // 添加调试日志
    useEffect(() => {
      console.log('🎬 VideoPlayer 状态:', {
        videoId,
        videoLoading,
        videoDataError,
        hasVideo: !!video,
        videoUrl: video?.url,
      })
    }, [videoId, videoLoading, videoDataError, video])

    // 强制触发视频查询
    useEffect(() => {
      if (videoId && !video && !videoLoading && !videoDataError) {
        console.log('🎬 强制触发视频查询，ID:', videoId)
        refetchVideo()
      }
    }, [videoId, video, videoLoading, videoDataError, refetchVideo])

    // 增强的错误状态监控
    useEffect(() => {
      if (videoDataError) {
        console.error('❌ VideoPlayer 检测到错误:', videoDataError)
        console.error('❌ 错误详情:', {
          message: videoDataError.message,
          stack: videoDataError.stack,
          name: videoDataError.name,
        })
      }
    }, [videoDataError])

    // 监控视频数据状态变化
    useEffect(() => {
      console.log('🎬 视频数据状态变化:', {
        hasVideoId: !!videoId,
        hasVideo: !!video,
        videoUrl: video?.url,
        isLoading: videoLoading,
        hasError: !!videoDataError,
        errorMessage: videoDataError?.message,
      })
    }, [videoId, video, videoLoading, videoDataError])

    // 添加测试函数
    const testVideoDataFetch = async () => {
      console.log('🧪 测试视频数据获取...')
      try {
        const response = await fetch(`/api/videos/${videoId}`)
        console.log('🧪 API 响应状态:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('🧪 API 响应数据:', data)
        } else {
          console.error('🧪 API 错误:', response.statusText)
        }
      } catch (error) {
        console.error('🧪 测试请求失败:', error)
      }
    }

    // 获取弹幕列表
    const { data: danmakuData = [], refetch: refetchDanmaku } = useDanmakuList(
      videoId,
      { limit: 100 }
    )

    // 转换弹幕数据格式
    const danmakuList = useMemo(() => {
      // 处理API返回的数据结构：{ danmaku: [...] }
      let actualDanmakuArray = danmakuData
      if (
        danmakuData &&
        typeof danmakuData === 'object' &&
        'danmaku' in danmakuData
      ) {
        actualDanmakuArray = danmakuData.danmaku || []
      }

      if (
        !Array.isArray(actualDanmakuArray) ||
        actualDanmakuArray.length === 0
      ) {
        return []
      }

      const serverDanmaku = actualDanmakuArray.map((danmaku: any) => {
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
          console.warn(
            'Invalid date for danmaku:',
            danmaku.id,
            danmaku.createdAt
          )
        }

        // 确保timeMs是数字类型，并正确转换为秒
        const timeMs = typeof danmaku.timeMs === 'number' ? danmaku.timeMs : 0
        const timeInSeconds = timeMs / 1000

        // 处理颜色：如果是数字格式，转换为CSS颜色
        let color = danmaku.color
        if (typeof color === 'number') {
          // 将数字转换为RGB格式
          const r = (color >> 16) & 255
          const g = (color >> 8) & 255
          const b = color & 255
          color = `rgb(${r}, ${g}, ${b})`
        } else if (!color || color === 'undefined' || color === 'null') {
          // 基于ID的确定性颜色
          color = `hsl(${
            (danmaku.id.charCodeAt(0) * danmaku.id.charCodeAt(1)) % 360
          }, 70%, 60%)`
        }

        return {
          id: danmaku.id,
          text: danmaku.content || '未知内容',
          time: timeInSeconds, // 转换为秒
          color: color,
          type: 'scroll' as const,
          sendTime,
        }
      })

      // 按时间排序服务器弹幕
      const sortedServerDanmaku = serverDanmaku.sort((a, b) => a.time - b.time)

      // 合并本地弹幕和服务器弹幕，本地弹幕优先显示
      const allDanmaku = [...localDanmaku, ...sortedServerDanmaku]

      // 检查ID重复
      const allIds = allDanmaku.map((d) => d.id)
      const uniqueIds = new Set(allIds)
      if (allIds.length !== uniqueIds.size) {
        // 找出重复的ID
        const idCount = allIds.reduce((acc, id) => {
          acc[id] = (acc[id] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const duplicateIds = Object.entries(idCount).filter(
          ([id, count]) => (count as number) > 1
        )
        console.warn('重复的ID:', duplicateIds)
      } else {
        console.log('✅ 所有ID都是唯一的')
      }

      // 检查时间分布
      const timeDistribution = allDanmaku.reduce((acc, danmaku) => {
        const timeKey = Math.floor(danmaku.time)
        acc[timeKey] = (acc[timeKey] || 0) + 1
        return acc
      }, {} as Record<number, number>)

      console.log('时间分布:', timeDistribution)

      // 检查最后一条弹幕
      if (allDanmaku.length > 0) {
        const lastDanmaku = allDanmaku[allDanmaku.length - 1]
        console.log('最后一条弹幕:', {
          id: lastDanmaku.id,
          time: lastDanmaku.time,
          text: lastDanmaku.text,
          source: localDanmaku.some((d) => d.id === lastDanmaku.id)
            ? 'local'
            : 'server',
        })
      }

      console.log('弹幕合并结果:', {
        localCount: localDanmaku.length,
        serverCount: sortedServerDanmaku.length,
        totalCount: allDanmaku.length,
        localDanmaku,
        sortedServerDanmaku,
      })

      return allDanmaku
    }, [danmakuData, localDanmaku])

    // 调试信息
    console.log('弹幕数据:', {
      rawData: danmakuData,
      processedList: danmakuList,
      count: danmakuList.length,
      videoId,
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

    // 播放/暂停切换
    const togglePlay = useCallback(async () => {
      if (videoRef.current) {
        try {
          console.log('🎬 尝试播放/暂停视频，当前状态:', isPlaying)
          console.log('视频元素状态:', {
            readyState: videoRef.current.readyState,
            networkState: videoRef.current.networkState,
            currentSrc: videoRef.current.currentSrc,
            src: videoRef.current.src,
            paused: videoRef.current.paused,
            ended: videoRef.current.ended,
            error: videoRef.current.error,
          })

          // 检查视频源是否有效
          if (!videoRef.current.src && !videoRef.current.currentSrc) {
            console.warn('视频源无效，无法播放')
            return
          }

          // 检查视频是否准备好播放
          if (videoRef.current.readyState < 2) {
            console.warn(
              '视频尚未准备好播放，readyState:',
              videoRef.current.readyState
            )
            return
          }

          if (isPlaying) {
            console.log('⏸️ 暂停视频')
            videoRef.current.pause()
            setIsPlaying(false)
          } else {
            console.log('▶️ 播放视频')

            // 尝试播放前先检查视频状态
            if (videoRef.current.paused) {
              // 使用 Promise 包装 play() 方法
              const playPromise = videoRef.current.play()

              if (playPromise !== undefined) {
                try {
                  await playPromise
                  setIsPlaying(true)
                  console.log('✅ 视频开始播放')
                } catch (playError: unknown) {
                  console.error('❌ 播放失败:', playError)

                  // 处理自动播放策略错误
                  if (
                    playError instanceof Error &&
                    playError.name === 'NotAllowedError'
                  ) {
                    console.log('🔄 自动播放被阻止，需要用户交互')
                    setVideoError('请点击视频区域开始播放')
                  } else {
                    setVideoError(
                      `播放失败: ${
                        playError instanceof Error
                          ? playError.message
                          : '未知错误'
                      }`
                    )
                  }
                  setIsPlaying(false)
                }
              }
            } else {
              console.log('视频已经在播放中')
              setIsPlaying(true)
            }
          }
        } catch (error) {
          console.error('❌ 播放视频失败:', error)
          setIsPlaying(false)
          setVideoError(
            `播放失败: ${error instanceof Error ? error.message : '未知错误'}`
          )
        }
      } else {
        console.warn('视频元素引用不存在')
      }
    }, [isPlaying, setVideoError])

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

    // 进度条点击处理
    const handleProgressClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !progressRef.current) return

        const rect = progressRef.current.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const progressWidth = rect.width
        const newTime = Math.max(
          0,
          Math.min((clickX / progressWidth) * duration, duration)
        )

        console.log(`🎯 进度条点击跳转: ${newTime}s`)
        setCurrentTime(newTime)
        videoRef.current.currentTime = newTime
      },
      [duration]
    )

    // 弹幕列表时间跳转处理
    const handleDanmakuTimeJump = useCallback(
      (timeMs: number) => {
        if (!videoRef.current) return

        const timeInSeconds = timeMs / 1000
        console.log(`🎯 弹幕列表跳转: ${timeMs}ms -> ${timeInSeconds}s`)

        // 跳转到指定时间
        setCurrentTime(timeInSeconds)
        videoRef.current.currentTime = timeInSeconds

        // 如果视频暂停，自动播放
        if (!isPlaying) {
          togglePlay()
        }
      },
      [isPlaying, togglePlay]
    )

    // 暴露给外部组件的方法
    useImperativeHandle(
      ref,
      () => ({
        jumpToTime: (timeMs: number) => {
          handleDanmakuTimeJump(timeMs)
        },
      }),
      [handleDanmakuTimeJump]
    )

    // 进度条鼠标悬停处理
    const handleProgressHover = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current) return

        const rect = progressRef.current.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const progressWidth = rect.width
        const hoverTimeValue = Math.max(
          0,
          Math.min((mouseX / progressWidth) * duration, duration)
        )

        setHoverTime(hoverTimeValue)
        setShowHoverTime(true)

        // 更新时间指示器的位置
        const timeIndicator = document.querySelector(
          '.hover-time-indicator'
        ) as HTMLElement
        if (timeIndicator) {
          const indicatorWidth = timeIndicator.offsetWidth
          const indicatorHalfWidth = indicatorWidth / 2

          // 计算理想位置（鼠标位置居中）
          let left = mouseX - indicatorHalfWidth

          // 确保不超出进度条边界
          if (left < 0) {
            left = 0
          } else if (left + indicatorWidth > progressWidth) {
            left = progressWidth - indicatorWidth
          }

          timeIndicator.style.left = `${left}px`
          timeIndicator.style.transform = 'none'
        }
      },
      [duration]
    )

    // 进度条鼠标离开处理
    const handleProgressLeave = useCallback(() => {
      setShowHoverTime(false)
      setHoverTime(null)
    }, [])

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
      const slider = document.querySelector(
        '.volume-slider'
      ) as HTMLInputElement
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
        // 创建新弹幕对象
        const newDanmaku = {
          id: `temp-${Date.now()}`, // 临时ID
          userId: user.id,
          videoId,
          content: danmakuText,
          timeMs: Math.floor(videoRef.current.currentTime * 1000),
          type: 1, // 滚动弹幕
          color: `hsl(${
            (user.id.charCodeAt(0) * user.id.charCodeAt(1)) % 360
          }, 70%, 60%)`, // 基于用户ID的确定性颜色
          createdAt: new Date().toISOString(),
        }

        // 立即添加到本地状态，实现即时显示
        const localDanmakuItem = {
          id: newDanmaku.id,
          text: newDanmaku.content,
          time: newDanmaku.timeMs / 1000,
          color: newDanmaku.color,
          type: 'scroll' as const,
          sendTime: newDanmaku.createdAt,
        }

        // 立即添加到本地弹幕列表
        setLocalDanmaku((prev) => [localDanmakuItem, ...prev])
        console.log('弹幕已添加到本地状态:', localDanmakuItem)

        // 发送到服务器
        const result = await sendDanmakuMutation.mutateAsync({
          userId: user.id,
          videoId,
          content: danmakuText,
          timeMs: Math.floor(videoRef.current.currentTime * 1000),
          type: 1, // 滚动弹幕
          color: newDanmaku.color,
        })

        console.log('弹幕发送成功:', result)

        // 发送成功后清空输入框并刷新弹幕列表
        setDanmakuText('')

        // 延迟移除本地弹幕，等待服务器数据更新
        setTimeout(() => {
          setLocalDanmaku((prev) => prev.filter((d) => d.id !== newDanmaku.id))
          refetchDanmaku()
        }, 1000)
      } catch (error) {
        console.error('发送弹幕失败:', error)
        // 发送失败时移除本地弹幕
        setLocalDanmaku((prev) =>
          prev.filter((d) => d.id !== `temp-${Date.now()}`)
        )
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

          // 根据错误代码设置具体的错误信息
          let errorMessage = '视频加载失败'
          switch (target.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = '视频加载被中断'
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = '网络错误，请检查网络连接'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = '视频格式不支持或文件损坏'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = '视频源不支持或格式错误'
              break
            default:
              errorMessage = `视频加载失败 (错误代码: ${target.error.code})`
          }

          setVideoError(errorMessage)
          setVideoLoadAttempts((prev) => prev + 1)
        }
      }

      // 添加加载处理
      const handleLoadStart = () => {
        console.log('开始加载视频')
        setVideoError(null)
        setVideoLoadAttempts((prev) => prev + 1)
      }

      const handleCanPlay = () => {
        console.log('视频可以播放')
        setVideoError(null)
        setVideoLoadAttempts(0) // 重置加载尝试次数
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

    // 重试加载视频
    const retryVideoLoad = useCallback(async () => {
      if (isRetrying || retryCount >= 3) return

      setIsRetrying(true)
      setRetryCount((prev) => prev + 1)

      try {
        console.log(`🔄 第${retryCount + 1}次重试加载视频`)

        // 重新获取视频数据
        if (refetchVideo) {
          await refetchVideo()
        }

        // 重置错误状态
        setVideoError(null)
        setVideoLoadAttempts(0)

        // 等待一下再重置重试状态
        setTimeout(() => {
          setIsRetrying(false)
        }, 1000)
      } catch (error) {
        console.error('重试加载视频失败:', error)
        setVideoError('重试失败，请检查网络连接')
        setIsRetrying(false)
      }
    }, [isRetrying, retryCount, refetchVideo])

    // 检测网络状态
    useEffect(() => {
      const handleOnline = () => {
        console.log('🌐 网络已连接')
        setNetworkStatus('online')
        setVideoError(null)
      }

      const handleOffline = () => {
        console.log('❌ 网络已断开')
        setNetworkStatus('offline')
        setVideoError('网络连接已断开，请检查网络设置')
      }

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      // 初始检查
      setNetworkStatus(navigator.onLine ? 'online' : 'offline')

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }, [])

    // 调试：打印视频数据
    useEffect(() => {
      if (video) {
        // 验证视频URL
        if (video.url) {
          try {
            const url = new URL(video.url)
            console.log('视频URL有效:', url.href)
            // 测试视频源
            testVideoSource(video.url)
          } catch (error) {
            console.error('视频URL无效:', video.url, error)
            setVideoError('视频URL格式无效')
          }
        } else {
          console.warn('视频URL为空')
          setVideoError('视频URL为空')
        }
      }
    }, [video, testVideoSource])

    // 加载状态回调
    useEffect(() => {
      if (onLoadingStateChange) {
        let stage: string
        let progress: number

        if (videoLoading) {
          stage = 'video'
          progress = 50 + Math.random() * 30 // 50-80% 之间
        } else if (videoDataError) {
          stage = 'error'
          progress = 100
        } else if (video && video.url) {
          stage = 'complete'
          progress = 100
        } else {
          stage = 'id'
          progress = 50
        }

        const state = {
          isLoading: videoLoading || !video?.url,
          stage,
          progress: Math.min(progress, 100),
        }
        console.log('📊 加载状态变化:', state)
        onLoadingStateChange(state)
      }
    }, [videoLoading, video?.url, videoDataError, onLoadingStateChange])

    // 视频加载状态监控
    useEffect(() => {
      if (!videoRef.current || !video?.url) {
        console.log('🎬 视频元素或URL未准备好:', {
          hasVideoRef: !!videoRef.current,
          hasVideoUrl: !!video?.url,
          videoUrl: video?.url,
        })
        return
      }

      const videoElement = videoRef.current
      console.log('🎬 开始监控视频加载状态，URL:', video.url)

      const handleLoadStart = () => {
        console.log('🎬 视频开始加载')
        setVideoError(null)
        setVideoLoadAttempts((prev) => prev + 1)
      }

      const handleLoadedData = () => {
        console.log('📊 视频数据已加载')
        setVideoError(null)
      }

      const handleCanPlay = () => {
        console.log('▶️ 视频可以播放')
        setVideoError(null)
        setVideoLoadAttempts(0) // 重置加载尝试次数
      }

      const handleCanPlayThrough = () => {
        console.log('🎯 视频可以流畅播放')
        setVideoError(null)
      }

      const handleError = (e: Event) => {
        console.error('❌ 视频加载错误:', e)
        const target = e.target as HTMLVideoElement

        if (target.error) {
          console.error('❌ 视频错误代码:', target.error.code)
          console.error('❌ 视频错误消息:', target.error.message)

          // 根据错误代码设置具体的错误信息
          let errorMessage = '视频加载失败'
          switch (target.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = '视频加载被中断'
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = '网络错误，请检查网络连接'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = '视频格式不支持或文件损坏'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = '视频源不支持或格式错误'
              break
            default:
              errorMessage = `视频加载失败 (错误代码: ${target.error.code})`
          }

          setVideoError(errorMessage)
          setVideoLoadAttempts((prev) => prev + 1)
        }
      }

      videoElement.addEventListener('loadstart', handleLoadStart)
      videoElement.addEventListener('loadeddata', handleLoadedData)
      videoElement.addEventListener('canplay', handleCanPlay)
      videoElement.addEventListener('canplaythrough', handleCanPlayThrough)
      videoElement.addEventListener('error', handleError)

      return () => {
        videoElement.removeEventListener('loadstart', handleLoadStart)
        videoElement.removeEventListener('loadeddata', handleLoadedData)
        videoElement.removeEventListener('canplay', handleCanPlay)
        videoElement.removeEventListener('canplaythrough', handleCanPlayThrough)
        videoElement.removeEventListener('error', handleError)
      }
    }, [video?.url])

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

    // 错误状态
    if (videoDataError || !video) {
      return (
        <div className="space-y-4">
          <div className="text-center text-gray-500 py-8">
            <p>无法加载视频</p>
            {videoDataError && (
              <p className="text-sm text-red-500 mt-2">
                错误: {videoDataError.message || '未知错误'}
              </p>
            )}
            {/* 添加手动重试按钮 */}
            <button
              onClick={() => {
                console.log('🔄 手动重试获取视频数据')
                refetchVideo()
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              重试加载
            </button>
            {/* 添加测试 API 按钮 */}
            <button
              onClick={testVideoDataFetch}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              测试 API 请求
            </button>
            {/* 显示当前状态信息 */}
            <div className="mt-4 text-xs text-gray-400">
              <p>视频ID: {videoId || '未设置'}</p>
              <p>加载状态: {videoLoading ? '加载中...' : '已停止'}</p>
              <p>
                错误详情:{' '}
                {videoDataError ? JSON.stringify(videoDataError) : '无'}
              </p>
            </div>
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
          {/* 调试信息面板 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-xs p-2 z-10">
              <div className="flex flex-wrap gap-4">
                <span>状态: {isPlaying ? '播放中' : '暂停'}</span>
                <span>时长: {duration ? formatTime(duration) : '加载中'}</span>
                <span>当前: {formatTime(currentTime)}</span>
                <span>视频ID: {videoId || '未设置'}</span>
                <span>
                  React Query:{' '}
                  {videoLoading
                    ? '加载中'
                    : videoDataError
                    ? '错误'
                    : video
                    ? '成功'
                    : '无数据'}
                </span>
                {videoRef.current && (
                  <>
                    <span>Ready: {videoRef.current.readyState}</span>
                    <span>Network: {videoRef.current.networkState}</span>
                    <span>Paused: {videoRef.current.paused ? '是' : '否'}</span>
                    <span>
                      Src: {videoRef.current.src ? '已设置' : '未设置'}
                    </span>
                    <span>
                      CurrentSrc:{' '}
                      {videoRef.current.currentSrc ? '已设置' : '未设置'}
                    </span>
                  </>
                )}
                <span>错误: {videoError || '无'}</span>
                <span>网络: {networkStatus}</span>
                <span>视频URL: {video?.url ? '已设置' : '未设置'}</span>
              </div>
              {/* 添加直接测试按钮 */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={testVideoDataFetch}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  测试 API
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 手动触发 refetch')
                    refetchVideo()
                  }}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  手动刷新
                </button>
              </div>
            </div>
          )}

          {/* 视频元素 */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain cursor-pointer"
            src={video.url}
            poster={video.thumbnail || undefined}
            preload="metadata"
            controls={false}
            onClick={togglePlay}
            onLoadStart={() => console.log('🎬 视频开始加载')}
            onLoadedData={() => console.log('📊 视频数据已加载')}
            onCanPlay={() => console.log('▶️ 视频可以播放')}
            onCanPlayThrough={() => console.log('🎯 视频可以流畅播放')}
            onPlay={() => console.log('🚀 视频开始播放')}
            onPause={() => console.log('⏸️ 视频已暂停')}
            onError={(e) => {
              console.error('❌ 视频加载错误:', e)
              const target = e.target as HTMLVideoElement
              if (target.error) {
                console.error('❌ 视频错误代码:', target.error.code)
                console.error('❌ 视频错误消息:', target.error.message)
              }
            }}
            onAbort={() => console.log('⏹️ 视频加载被中断')}
            onStalled={() => console.log('⏸️ 视频加载停滞')}
            onSuspend={() => console.log('⏸️ 视频加载被暂停')}
            onWaiting={() => console.log('⏳ 视频等待数据')}
            onProgress={() => console.log('📈 视频加载进度更新')}
          />

          {/* 视频加载状态指示器 */}
          {videoRef.current && videoRef.current.readyState < 3 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>视频加载中...</p>
                <p className="text-sm text-gray-300 mt-2">
                  ReadyState: {videoRef.current.readyState}
                </p>
              </div>
            </div>
          )}

          {/* 手动播放按钮 - 当视频加载完成但未播放时显示 */}
          {videoRef.current &&
            videoRef.current.readyState >= 3 &&
            !isPlaying &&
            !videoError && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
                >
                  <Play className="h-6 w-6" />
                  <span className="text-lg font-medium">点击播放</span>
                </button>
              </div>
            )}

          {/* 视频错误覆盖层 */}
          {videoError && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
              <div className="text-center space-y-4">
                <div className="text-6xl">⚠️</div>
                <h3 className="text-xl font-bold">视频加载失败</h3>
                <p className="text-gray-300 max-w-md">{videoError}</p>

                {/* 网络状态指示 */}
                {networkStatus === 'offline' && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span>📡</span>
                    <span>网络连接已断开</span>
                  </div>
                )}

                {/* 重试按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={retryVideoLoad}
                    disabled={isRetrying || retryCount >= 3}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 rounded-lg transition-colors"
                  >
                    {isRetrying ? '重试中...' : `重试 (${retryCount}/3)`}
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    刷新页面
                  </button>
                </div>

                {/* 重试次数提示 */}
                {retryCount >= 3 && (
                  <p className="text-sm text-gray-400">
                    已达到最大重试次数，请检查网络连接或联系管理员
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 弹幕层 */}
          {showDanmaku && (
            <Danmaku
              key={`danmaku-${videoId}`}
              danmakuList={danmakuList}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onNewDanmaku={(newDanmaku) => {
                console.log('新弹幕已播放:', newDanmaku.text)
              }}
            />
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
            <div className="mb-4 relative">
              <div
                ref={progressRef}
                className="progress-bar"
                onClick={handleProgressClick}
                onMouseDown={handleProgressMouseDown}
                onMouseMove={handleProgressHover}
                onMouseLeave={handleProgressLeave}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <div className="progress-handle" />
                </div>
              </div>
              {showHoverTime && hoverTime !== null && (
                <div className="hover-time-indicator">
                  {formatTime(hoverTime)}
                </div>
              )}
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
                    <div className="volume-value">
                      {Math.round(volume * 100)}
                    </div>
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
                  disabled={
                    !danmakuText.trim() || sendDanmakuMutation.isPending
                  }
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
)

import { useState, useCallback, useMemo } from 'react'

interface UseFullscreenAnimationOptions {
  duration?: number
  easing?: string
  scale?: number
  translateY?: number
  opacity?: number
}

interface AnimationState {
  isFullscreen: boolean
  isAnimating: boolean
  scale: number
  translateY: number
  opacity: number
}

export function useFullscreenAnimation(
  options: UseFullscreenAnimationOptions = {}
) {
  const {
    duration = 600,
    easing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    scale = 0.8,
    translateY = 20,
    opacity = 0.8,
  } = options

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // 切换全屏状态
  const toggleFullscreen = useCallback(() => {
    setIsAnimating(true)

    // 使用setTimeout确保状态切换的动画能够正确触发
    setTimeout(() => {
      setIsFullscreen((prev) => !prev)
      setIsAnimating(false)
    }, 50)
  }, [])

  // 设置全屏状态
  const setFullscreen = useCallback((fullscreen: boolean) => {
    setIsAnimating(true)

    setTimeout(() => {
      setIsFullscreen(fullscreen)
      setIsAnimating(false)
    }, 50)
  }, [])

  // 计算动画样式
  const animationStyles = useMemo(() => {
    if (isFullscreen) {
      return {
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity: opacity,
      }
    }
    return {}
  }, [isFullscreen, scale, translateY, opacity])

  // 计算动画类名
  const animationClasses = useMemo(() => {
    if (isAnimating) {
      return 'transition-all duration-300 ease-out'
    }
    return ''
  }, [isAnimating])

  // 计算全屏样式类名
  const fullscreenClasses = useMemo(() => {
    if (isFullscreen) {
      return 'fixed inset-4 z-[60] rounded-none w-auto h-auto'
    }
    return ''
  }, [isFullscreen])

  // 计算动画持续时间
  const transitionDuration = useMemo(() => {
    return `${duration}ms`
  }, [duration])

  // 计算缓动函数
  const transitionEasing = useMemo(() => {
    return easing
  }, [easing])

  // 计算变换原点
  const transformOrigin = useMemo(() => {
    return 'bottom right'
  }, [])

  // 获取完整的动画样式对象
  const getAnimationStyles = useCallback(
    () => ({
      transformOrigin,
      transition: `all ${transitionDuration} ${transitionEasing}`,
      ...animationStyles,
    }),
    [transformOrigin, transitionDuration, transitionEasing, animationStyles]
  )

  // 获取尺寸样式类名
  const getSizeClasses = useCallback(
    (normalClasses: string) => {
      if (isFullscreen) {
        return fullscreenClasses
      }
      return normalClasses
    },
    [isFullscreen, fullscreenClasses]
  )

  // 获取动画状态类名
  const getAnimationStateClasses = useCallback(() => {
    if (isAnimating) {
      return 'scale-95 opacity-80 translate-y-2'
    }

    if (isFullscreen) {
      return 'scale-100 opacity-100 translate-y-0'
    }

    return 'scale-100 opacity-100 translate-y-0'
  }, [isFullscreen, isAnimating])

  return {
    // 状态
    isFullscreen,
    isAnimating,

    // 方法
    toggleFullscreen,
    setFullscreen,

    // 样式
    animationStyles,
    animationClasses,
    fullscreenClasses,

    // 计算属性
    transitionDuration,
    transitionEasing,
    transformOrigin,

    // 工具方法
    getAnimationStyles,
    getSizeClasses,
    getAnimationStateClasses,
  }
}

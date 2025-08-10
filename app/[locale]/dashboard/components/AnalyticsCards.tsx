'use client'

import { useState, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/app/hooks/use-i18n'
import { ThemeText, ThemeText3XL } from '@/app/components/ui/theme-text'
import { ThemeCard, ThemeCardContent } from '@/components/ui/theme-card'

interface AnalyticsCardsProps {
  data: {
    pageViews: number
    uniqueVisitors: number
    realTimeUsers: number
    avgSessionDuration: number
  }
}

// 数字动画组件
function AnimatedNumber({
  value,
  className = '',
  duration = 1000,
}: {
  value: number
  className?: string
  duration?: number
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setIsAnimating(true)

      const startValue = prevValueRef.current
      const endValue = value
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // 使用缓动函数
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentValue = Math.floor(
          startValue + (endValue - startValue) * easeOutQuart
        )

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(endValue)
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
      prevValueRef.current = value
    }
  }, [value, duration])

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {displayValue.toLocaleString()}
    </span>
  )
}

// 时间动画组件
function AnimatedTime({
  seconds,
  className = '',
  duration = 1000,
}: {
  seconds: number
  className?: string
  duration?: number
}) {
  const [displaySeconds, setDisplaySeconds] = useState(seconds)
  const [isAnimating, setIsAnimating] = useState(false)
  const prevSecondsRef = useRef(seconds)
  const t = useI18n()

  useEffect(() => {
    if (seconds !== prevSecondsRef.current) {
      setIsAnimating(true)

      const startSeconds = prevSecondsRef.current
      const endSeconds = seconds
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const currentSeconds = Math.floor(
          startSeconds + (endSeconds - startSeconds) * easeOutQuart
        )

        setDisplaySeconds(currentSeconds)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplaySeconds(endSeconds)
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
      prevSecondsRef.current = seconds
    }
  }, [seconds, duration])

  const minutes = Math.floor(displaySeconds / 60)
  const remainingSeconds = displaySeconds % 60

  return (
    <span className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}>
      {minutes}
      {t.dashboard('分')}
      {remainingSeconds}
      {t.dashboard('秒')}
    </span>
  )
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  const t = useI18n()

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 页面浏览量 */}
      <ThemeCard variant="glass" hover={true}>
        <ThemeCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-blue-500/10 border-blue-500/20 text-blue-600 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400 text-xs"
            >
              {t.dashboard('总浏览量')}
            </Badge>
          </div>
          <div className="space-y-2">
            <ThemeText3XL weight="bold" variant="primary">
              <AnimatedNumber value={data.pageViews} />
            </ThemeText3XL>
          </div>
        </ThemeCardContent>
      </ThemeCard>

      {/* 独立访客 */}
      <ThemeCard variant="glass" hover={true}>
        <ThemeCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-green-500/10 border-green-500/20 text-green-600 dark:bg-green-500/20 dark:border-green-500/30 dark:text-green-400 text-xs"
            >
              {t.dashboard('独立访客')}
            </Badge>
          </div>
          <div className="space-y-2">
            <ThemeText3XL weight="bold" variant="primary">
              <AnimatedNumber value={data.uniqueVisitors} />
            </ThemeText3XL>
          </div>
        </ThemeCardContent>
      </ThemeCard>

      {/* 实时用户 */}
      <ThemeCard variant="glass" hover={true}>
        <ThemeCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:bg-yellow-500/20 dark:border-yellow-500/30 dark:text-yellow-400 text-xs"
            >
              {t.dashboard('实时用户')}
            </Badge>
          </div>
          <div className="space-y-2">
            <ThemeText3XL weight="bold" variant="primary">
              <AnimatedNumber value={data.realTimeUsers} />
            </ThemeText3XL>
          </div>
        </ThemeCardContent>
      </ThemeCard>

      {/* 平均会话时长 */}
      <ThemeCard variant="glass" hover={true}>
        <ThemeCardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-gray-500/10 border-gray-500/20 text-gray-600 dark:bg-gray-500/20 dark:border-gray-500/30 dark:text-gray-400 text-xs"
            >
              {t.dashboard('平均会话时长')}
            </Badge>
          </div>
          <div className="space-y-2">
            <ThemeText3XL weight="bold" variant="primary">
              <AnimatedTime seconds={data.avgSessionDuration} />
            </ThemeText3XL>
          </div>
        </ThemeCardContent>
      </ThemeCard>
    </div>
  )
}

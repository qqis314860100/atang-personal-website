'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      {minutes}分{remainingSeconds}秒
    </span>
  )
}

export function AnalyticsCards({ data }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 页面浏览量 */}
      <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-purple-500/20 border-purple-500/30 text-purple-400 text-xs"
            >
              总浏览量
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">
              <AnimatedNumber value={data.pageViews} />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 独立访客 */}
      <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-blue-500/20 border-blue-500/30 text-blue-400 text-xs"
            >
              总独立访客数
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">
              <AnimatedNumber value={data.uniqueVisitors} />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 在线人数 */}
      <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-green-500/20 border-green-500/30 text-green-400 text-xs"
            >
              实时在线人数
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">
              <AnimatedNumber value={data.realTimeUsers} />
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 平均会话时长 */}
      <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge
              variant="outline"
              className="bg-orange-500/20 border-orange-500/30 text-orange-400 text-xs"
            >
              平均会话时长
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-white">
              <AnimatedTime seconds={data.avgSessionDuration} />
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

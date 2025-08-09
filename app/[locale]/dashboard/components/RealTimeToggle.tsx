'use client'

import { Pause, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRealTime } from '@/app/components/providers/RealTimeProvider'

export function RealTimeToggle() {
  const { isEnabled, setIsEnabled, lastUpdate } = useRealTime()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
      <Button
        variant={isEnabled ? 'default' : 'secondary'}
        size="sm"
        onClick={() => setIsEnabled(!isEnabled)}
        className="flex items-center gap-2 relative overflow-hidden group cursor-pointer"
      >
        {/* 背景渐变动画 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* 图标和文字 */}
        <div className="relative z-10 flex items-center gap-2">
          {isEnabled ? (
            <>
              <span className="text-white  animate-pulse animate-infinite">
                实时更新中
              </span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 text-gray-300" />
              <span className="text-gray-300 font-medium">已暂停</span>
            </>
          )}
        </div>
      </Button>

      <div className="flex items-center gap-3 text-xs">
        {/* 网络状态指示器 */}
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-gray-400">在线</span>
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-2 text-gray-400">
          {isEnabled ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>最后更新: {formatTime(lastUpdate)}</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span>点击启用实时更新</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

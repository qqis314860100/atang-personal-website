'use client'

import { useDanmakuList } from '@/app/hooks/use-danmaku'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { MessageSquare } from 'lucide-react'

interface DanmakuListProps {
  videoId?: string
  onTimeJump?: (timeMs: number) => void // 添加时间跳转回调
}

export function DanmakuList({ videoId, onTimeJump }: DanmakuListProps) {
  const { data: recentDanmaku = [] } = useDanmakuList(videoId || '', {
    limit: 50,
  })

  const formatTime = (timeMs: number) => {
    const seconds = Math.floor(timeMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatSendTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt)
      if (!isNaN(date.getTime())) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${month}-${day} ${hours}:${minutes}`
      }
    } catch (error) {
      console.warn('Invalid date for danmaku:', createdAt)
    }
    return 'Unknown'
  }

  const handleDanmakuClick = (timeMs: number) => {
    if (onTimeJump) {
      console.log(`🎯 弹幕列表点击跳转: ${timeMs}ms (${formatTime(timeMs)})`)
      onTimeJump(timeMs)
    }
  }

  return (
    <div className="space-y-4 mt-[64px] w-full">
      {/* 弹幕列表 */}
      <ThemeCard variant="glass" className="w-full">
        <ThemeCardHeader className="pb-0">
          <ThemeCardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>弹幕列表</span>
            </div>
          </ThemeCardTitle>
        </ThemeCardHeader>
        <ThemeCardContent className="p-0">
          <ScrollArea className="h-[550px]">
            <div className="pl-2">
              {/* 测试跳转按钮 */}
              <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-200">
                <button
                  onClick={() => handleDanmakuClick(30000)} // 30秒
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  测试跳转到30秒
                </button>
                <span className="ml-2 text-xs text-gray-600">
                  点击测试弹幕列表跳转功能
                </span>
              </div>

              {recentDanmaku.length > 0 ? (
                <div className="space-y-1">
                  {/* 表头 */}
                  <div className="grid grid-cols-13 gap-2 pb-2 border-b border-gray-200 text-xs font-medium text-gray-600">
                    <div className="col-span-2">时间</div>
                    <div className="col-span-6 ">弹幕内容</div>
                    <div className="col-span-4 ">发送时间</div>
                  </div>

                  {/* 弹幕列表 */}
                  <div className="space-y-1">
                    {recentDanmaku.map((danmaku: any) => (
                      <div
                        key={danmaku.id}
                        className="grid grid-cols-12 gap-2 py-1.5 text-xs rounded px-1 cursor-pointer transition-colors duration-200 hover:bg-blue-50 hover:border-l-2 hover:border-l-blue-500"
                        onClick={() => handleDanmakuClick(danmaku.timeMs)}
                        title={`点击跳转到 ${formatTime(danmaku.timeMs)}`}
                      >
                        <div className="col-span-2 text-gray-600 font-mono">
                          {formatTime(danmaku.timeMs)}
                        </div>
                        <div className="col-span-7 text-gray-900 break-words leading-tight text-ellipsis overflow-hidden whitespace-nowrap">
                          {danmaku.content}
                        </div>
                        <div className="col-span-3 text-gray-500 text-xs ">
                          {formatSendTime(danmaku.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>暂无弹幕</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </ThemeCardContent>
      </ThemeCard>
    </div>
  )
}

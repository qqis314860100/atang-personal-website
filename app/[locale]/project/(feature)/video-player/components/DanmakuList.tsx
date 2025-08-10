'use client'

import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDanmakuList, useHotDanmaku } from '@/app/hooks/use-danmaku'
import {
  MessageSquare,
  TrendingUp,
  Clock,
  MoreVertical,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DanmakuListProps {
  videoId?: string
}

export function DanmakuList({
  videoId = 'example-video-id',
}: DanmakuListProps) {
  const { data: recentDanmaku = [] } = useDanmakuList(videoId, { limit: 50 })
  const { data: hotDanmaku = [] } = useHotDanmaku(videoId, 10)

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

  return (
    <div className="space-y-4 mt-[64px] w-full max-w-4xl">
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
            <div className="p-4">
              {recentDanmaku.length > 0 ? (
                <div className="space-y-1">
                  {/* 表头 */}
                  <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-200 text-xs font-medium text-gray-600">
                    <div className="col-span-2">时间</div>
                    <div className="col-span-6 ">弹幕内容</div>
                    <div className="col-span-3 ">发送时间</div>
                  </div>

                  {/* 弹幕列表 */}
                  <div className="space-y-1">
                    {recentDanmaku.map((danmaku: any) => (
                      <div
                        key={danmaku.id}
                        className="grid grid-cols-12 gap-2 py-1.5 text-xs hover:bg-gray-50 rounded px-1"
                      >
                        <div className="col-span-2 text-gray-600 font-mono">
                          {formatTime(danmaku.timeMs)}
                        </div>
                        <div className="col-span-6 text-gray-900 break-words leading-tight text-ellipsis overflow-hidden whitespace-nowrap">
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
                  <p className="text-sm">暂无弹幕</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 底部按钮 */}
          <div className="p-4 border-t border-gray-200">
            <Button variant="outline" className="w-full text-gray-600 text-sm">
              查看历史弹幕
            </Button>
          </div>
        </ThemeCardContent>
      </ThemeCard>
    </div>
  )
}

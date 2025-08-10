'use client'

import {
  ThemeCard,
  ThemeCardContent,
  ThemeCardHeader,
  ThemeCardTitle,
} from '@/components/ui/theme-card'
import { Badge } from '@/components/ui/badge'
import { Users, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from '@/app/hooks/use-socket'

export default function OnlineVisitors() {
  // 使用 Socket.IO WebSocket 获取实时数据
  const { isConnected, userCount } = useSocket()

  return (
    <ThemeCard
      variant="glass"
      className="bg-white/95 backdrop-blur-sm border-0 shadow-lg fixed z-50 top-24 right-6"
    >
      <ThemeCardHeader className="pb-3">
        <ThemeCardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          在线访客
        </ThemeCardTitle>
      </ThemeCardHeader>
      <ThemeCardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {isConnected ? '实时连接' : '连接断开'}
            </span>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {userCount}
          </Badge>
        </div>
      </ThemeCardContent>
    </ThemeCard>
  )
}

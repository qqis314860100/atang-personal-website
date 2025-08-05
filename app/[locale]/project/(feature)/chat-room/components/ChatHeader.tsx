'use client'

import { MessageCircle, Wifi, WifiOff, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { maskIp } from '@/utils/maskIp'

interface ChatHeaderProps {
  isConnected: boolean
  userCount: number
  myIp: string | null
}

export function ChatHeader({ isConnected, userCount, myIp }: ChatHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50  sticky top-[48px] ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">在线聊天室</h1>
              <p className="text-sm text-gray-600">实时交流，连接世界</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {isConnected ? '已连接' : '连接中...'}
              </span>
            </div>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {userCount} 人在线
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}

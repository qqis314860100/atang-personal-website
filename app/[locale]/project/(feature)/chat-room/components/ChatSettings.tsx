'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Wifi,
  WifiOff,
  Globe,
  Shield,
  Volume2,
  VolumeX,
  RefreshCw,
  Info,
} from 'lucide-react'
import { maskIp } from '@/utils/maskIp'

interface ChatSettingsProps {
  isConnected: boolean
  myIp: string | null
  onReconnect: () => void
}

export function ChatSettings({
  isConnected,
  myIp,
  onReconnect,
}: ChatSettingsProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [showIp, setShowIp] = useState(true)

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
        <Settings className="h-4 w-4" />
        聊天室设置
      </div>

      {/* 连接状态 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">连接状态</span>
          </div>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? '已连接' : '未连接'}
          </Badge>
        </div>

        {/* IP地址显示 */}
        {myIp && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm">我的IP地址</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {showIp ? maskIp(myIp) : '***.***.***.***'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIp(!showIp)}
                className="h-6 w-6 p-0"
              >
                <Shield className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* 声音设置 */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-red-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm">消息提示音</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? '开启' : '关闭'}
          </Button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          onClick={onReconnect}
          disabled={isConnected}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重新连接
        </Button>
      </div>

      {/* 聊天室信息 */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-700">聊天室信息</span>
        </div>
        <div className="text-xs text-blue-600 space-y-1">
          <p>• 支持实时消息发送</p>
          <p>• 显示在线用户列表</p>
          <p>• 消息历史记录</p>
          <p>• IP地址隐私保护</p>
        </div>
      </div>
    </div>
  )
}

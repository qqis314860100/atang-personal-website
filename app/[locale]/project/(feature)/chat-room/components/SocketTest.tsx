'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, RefreshCw, MessageCircle } from 'lucide-react'
import { useSocket } from '@/app/hooks/use-socket'

export function SocketTest() {
  const [testMessage, setTestMessage] = useState('')
  const {
    isConnected,
    messages,
    userCount,
    myIp,
    sendMessage,
    connect,
    disconnect,
  } = useSocket()

  const handleSendTestMessage = () => {
    if (testMessage.trim() && isConnected) {
      sendMessage(testMessage)
      setTestMessage('')
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Socket连接测试
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 连接状态 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">{isConnected ? '已连接' : '未连接'}</span>
          </div>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {userCount} 人在线
          </Badge>
        </div>

        {/* IP信息 */}
        {myIp && (
          <div className="text-sm text-gray-600">
            <strong>我的IP:</strong> {myIp}
          </div>
        )}

        {/* 连接控制 */}
        <div className="flex gap-2">
          <Button
            onClick={connect}
            disabled={isConnected}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            连接
          </Button>
          <Button
            onClick={disconnect}
            disabled={!isConnected}
            size="sm"
            variant="outline"
          >
            <WifiOff className="h-4 w-4 mr-1" />
            断开
          </Button>
        </div>

        {/* 测试消息 */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="输入测试消息..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendTestMessage()
                }
              }}
            />
            <Button
              onClick={handleSendTestMessage}
              disabled={!isConnected || !testMessage.trim()}
              size="sm"
            >
              发送
            </Button>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="max-h-40 overflow-y-auto space-y-2">
          <div className="text-sm font-medium">最近消息:</div>
          {messages.slice(-5).map((msg, index) => (
            <div key={index} className="text-xs bg-gray-50 p-2 rounded">
              <div className="font-medium">{msg.username}</div>
              <div>{msg.message}</div>
              <div className="text-gray-500">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

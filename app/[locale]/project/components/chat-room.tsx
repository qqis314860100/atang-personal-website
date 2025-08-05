'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, Send, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from '@/lib/hooks/use-socket'
import { maskIp } from '@/utils/maskIp'

export const ChatRoomHeader = () => {
  // 使用 Socket.IO WebSocket
  const {
    isConnected,
    messages,
    userCount,
    typingUsers,
    sendMessage,
    sendTyping,
    myIp,
  } = useSocket()
  return (
    <CardHeader className="pb-0">
      <div className="flex items-center gap-4">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        {/* 展示本机IP（脱敏） */}
        {myIp && (
          <div className="text-xs text-gray-400 mt-1">
            我的IP: {maskIp(myIp)}
          </div>
        )}

        <Badge variant="secondary" className="ml-2">
          在线人数:{userCount}
        </Badge>
      </div>
    </CardHeader>
  )
}

export default function ChatRoom({ hiddenHeader }: { hiddenHeader?: boolean }) {
  useEffect(() => {
    console.log('[MCP调试] ChatRoom 组件已渲染')
  }, [])

  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [visitorId] = useState(
    `访客${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`
  )

  // 使用 Socket.IO WebSocket
  const {
    isConnected,
    messages,
    userCount,
    typingUsers,
    sendMessage,
    sendTyping,
    myIp,
  } = useSocket()

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 处理发送消息
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return
    setIsLoading(true)
    sendMessage(inputMessage.trim())
    setInputMessage('')
    sendTyping(false)
    setIsLoading(false)
  }

  // 处理输入状态
  const handleInputChange = (value: string) => {
    setInputMessage(value)
    sendTyping(value.length > 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <Card className="h-96 shadow-2xl border-0 bg-white rounded-xl flex flex-col ">
      {!hiddenHeader && <ChatRoomHeader />}
      <CardContent className="p-0 h-full flex flex-col">
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-2 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>开始聊天吧！</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.username === visitorId
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 max-w-[70%] break-words shadow
                      ${
                        message.username === visitorId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    <div className="font-bold text-xs mb-1">
                      {/* 用IP替换visitorId展示 */}
                      {message.username === visitorId && myIp
                        ? maskIp(myIp)
                        : message.username}
                    </div>
                    <div className="text-sm">{message.message}</div>
                    <div className="text-[10px] text-gray-300 mt-1 text-right">
                      {formatTime(new Date(message.timestamp))}
                    </div>
                  </div>
                </div>
              ))
            )}
            {typingUsers.length > 0 && (
              <div className="text-xs text-gray-400 italic">
                {typingUsers.join(', ')} 正在输入...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-gray-100 bg-white">
          <div className="flex gap-2 items-center">
            <Input
              value={inputMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              disabled={!isConnected || isLoading}
              className="flex-1 rounded-full bg-gray-50 border border-gray-200"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!isConnected || isLoading || !inputMessage.trim()}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useRef, useEffect, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Clock } from 'lucide-react'
import { maskIp } from '@/utils/maskIp'

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  isSystem?: boolean
}

interface MessageListProps {
  messages: ChatMessage[]
  typingUsers: string[]
  myIp: string | null
}

export function MessageList({ messages, typingUsers, myIp }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  // 消息分组（按日期）
  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {}

    messages.forEach((message) => {
      const date = formatDate(new Date(message.timestamp))
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 px-4 py-2 chat-scroll-area max-h-[calc(100vh-300px)]"
      >
        <div className="space-y-2 pb-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">欢迎来到聊天室！</p>
              <p className="text-sm">发送第一条消息开始聊天吧</p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* 日期分隔符 - 微信风格 */}
                <div className="flex items-center justify-center my-3">
                  <div className="bg-gray-200/60 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {date}
                    </span>
                  </div>
                </div>

                {/* 当日消息 */}
                <div className="space-y-2">
                  {dateMessages.map((message) => {
                    const isMyMessage = message.username === myIp
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMyMessage ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] break-words message-bubble ${
                            isMyMessage
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                          style={{
                            borderRadius: isMyMessage
                              ? '18px 18px 4px 18px'
                              : '18px 18px 18px 4px',
                            padding: '8px 12px',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            position: 'relative',
                          }}
                        >
                          {/* 用户名 - 只在非自己消息时显示 */}
                          {!isMyMessage && (
                            <div className="text-xs text-gray-500 mb-1 font-medium">
                              {message.username}
                            </div>
                          )}

                          {/* 消息内容 */}
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.message}
                          </div>

                          {/* 时间戳 - 微信风格 */}
                          <div
                            className={`text-[10px] mt-1 message-timestamp ${
                              isMyMessage
                                ? 'text-blue-100 text-right'
                                : 'text-gray-500 text-left'
                            }`}
                            style={{
                              opacity: 0.8,
                              lineHeight: '1.2',
                            }}
                          >
                            {formatTime(new Date(message.timestamp))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}

          {/* 输入状态提示 - 微信风格 */}
          {typingUsers.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[70%] typing-indicator">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {typingUsers.join(', ')} 正在输入...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 滚动到底部的锚点 */}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>
      </ScrollArea>
    </div>
  )
}

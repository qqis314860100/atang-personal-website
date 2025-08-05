'use client'

import { useState, useCallback, memo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Users, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from '@/lib/hooks/use-socket'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { OnlineUsersList } from './OnlineUsersList'
import { ChatSettings } from './ChatSettings'
import { SocketTest } from './SocketTest'
import { SubtractNavBreadcrumbContainer } from '@/components/ui/subtractNavContainer'
import { Badge } from '@/components/ui/badge'
import './chat-room.css'

// 使用 memo 优化子组件性能
const MemoizedMessageList = memo(MessageList)
const MemoizedOnlineUsersList = memo(OnlineUsersList)
const MemoizedChatSettings = memo(ChatSettings)

export function ChatRoomEnhanced() {
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  // 使用 Socket.IO WebSocket
  const {
    isConnected,
    messages,
    onlineUsers,
    userCount,
    typingUsers,
    sendMessage,
    sendTyping,
    myIp,
    connect,
    disconnect,
  } = useSocket()

  // 处理发送消息 - 使用 useCallback 优化性能
  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim() || !isConnected) return

    setIsLoading(true)
    sendMessage(inputMessage.trim())
    setInputMessage('')
    sendTyping(false)
    setIsLoading(false)
  }, [inputMessage, isConnected, sendMessage, sendTyping])

  // 处理输入状态 - 使用 useCallback 优化性能
  const handleInputChange = useCallback(
    (value: string) => {
      setInputMessage(value)
      sendTyping(value.length > 0)
    },
    [sendTyping]
  )

  // 重新连接 - 使用 useCallback 优化性能
  const handleReconnect = useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 1000)
  }, [connect, disconnect])

  return (
    <SubtractNavBreadcrumbContainer className="bg-gray-50">
      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 聊天区域 */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-130px)] border-0 bg-white rounded-2xl flex flex-col shadow-lg gap-0">
              {/* 聊天头部 - 微信风格 */}
              <CardHeader className="pb-3 border-b border-gray-100 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        公共聊天室
                      </CardTitle>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        {isConnected ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full connection-indicator"></div>
                            <span>实时连接中</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span>正在连接...</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {userCount} 人在线
                  </Badge>
                </div>
              </CardHeader>

              {/* 消息区域 */}
              <CardContent className="p-0 h-full flex flex-col bg-gray-50">
                {/* 消息列表 */}
                <MemoizedMessageList
                  messages={messages}
                  typingUsers={typingUsers}
                  myIp={myIp}
                />

                {/* 消息输入 */}
                <MessageInput
                  inputMessage={inputMessage}
                  onInputChange={handleInputChange}
                  onSendMessage={handleSendMessage}
                  isConnected={isConnected}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger
                  value="users"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  在线用户
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  设置
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-4">
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <MemoizedOnlineUsersList users={onlineUsers} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardContent className="p-4">
                    <MemoizedChatSettings
                      isConnected={isConnected}
                      myIp={myIp}
                      onReconnect={handleReconnect}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SubtractNavBreadcrumbContainer>
  )
}

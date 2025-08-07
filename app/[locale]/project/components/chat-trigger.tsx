'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Badge,
  MessageCircle,
  MessageSquare,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { useSocket } from '@/lib/hooks/use-socket'
import { CardHeader } from '@/components/ui/card'

const ChatRoom = dynamic(
  () => import('@/app/[locale]/project/components/chat-room'),
  {
    ssr: false,
  }
)

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
          <div className="text-xs text-gray-400 mt-1">我的IP: {myIp}</div>
        )}

        <Badge className="ml-2 bg-gray-100 text-gray-800">
          在线人数:{userCount}
        </Badge>
      </div>
    </CardHeader>
  )
}
export default function ChatRoomTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="fixed z-50 bottom-6 right-6 bg-blue-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center hover:bg-blue-700 transition-colors"
        onClick={() => setOpen(true)}
        title="打开聊天室"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
      {open && (
        <div
          className="fixed z-50 bottom-24 right-6 w-[350px] max-w-[90vw] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
          style={{ minHeight: 400, maxHeight: '70vh' }}
        >
          <div className="h-full p-2 border-b">
            <div className="flex  p-2  justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-600" />
                <span className="font-bold text-base">聊天室</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-gray-100 rounded "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ChatRoomHeader />
          </div>

          <div className="flex-1 overflow-auto">
            <ChatRoom hiddenHeader={true} />
          </div>
        </div>
      )}
    </>
  )
}

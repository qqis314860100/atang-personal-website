'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketMessage {
  id: string
  username: string
  message: string
  timestamp: Date
  isSystem?: boolean
}

interface SocketUser {
  id: string
  username: string
  timestamp: Date
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<SocketMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [myIp, setMyIp] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)

  // 连接 Socket
  const connect = useCallback(() => {
    if (!socketRef.current) {
      // 根据环境动态设置Socket服务器地址
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'
      console.log('🔌 尝试连接到Socket服务器:', socketUrl)

      socketRef.current = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      })

      // 连接成功
      socketRef.current.on('connect', () => {
        console.log('✅ Socket 连接成功')
        setIsConnected(true)

        // 加入聊天室
        socketRef.current?.emit('join')
        console.log('📝 已发送join事件')
      })

      // 连接断开
      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Socket 连接断开，原因:', reason)
        setIsConnected(false)
      })

      // 接收新消息
      socketRef.current.on('new_message', (message: SocketMessage) => {
        console.log('📨 收到新消息:', message)
        setMessages((prev) => [...prev, message])
      })

      // 接收在线用户列表
      socketRef.current.on('online_users', (users: SocketUser[]) => {
        console.log('👥 收到在线用户列表:', users)
        setOnlineUsers(users)
        setUserCount(users.length)
      })

      // 接收用户数量更新
      socketRef.current.on('user_count', (count: number) => {
        console.log('📊 收到用户数量更新:', count)
        setUserCount(count)
      })

      // 用户加入
      socketRef.current.on('user_joined', (user: SocketUser) => {
        setOnlineUsers((prev) => [...prev, user])
        setUserCount((prev) => prev + 1)
      })

      // 用户离开
      socketRef.current.on('user_left', (user: SocketUser) => {
        setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id))
        setUserCount((prev) => Math.max(0, prev - 1))
      })

      // 用户正在输入
      socketRef.current.on(
        'user_typing',
        (data: { username: string; isTyping: boolean }) => {
          if (data.isTyping) {
            setTypingUsers((prev) => [...prev, data.username])
          } else {
            setTypingUsers((prev) => prev.filter((u) => u !== data.username))
          }
        }
      )

      // 监听 your_ip 事件
      socketRef.current.on(
        'your_ip',
        (data: { ip: string; info?: any; formatted?: string }) => {
          console.log('🌐 收到IP信息:', data)
          setMyIp(data.ip)

          // 如果有IP详细信息，也存储起来
          if (data.info) {
            console.log('📍 IP详细信息:', data.info)
          }
        }
      )

      // 连接错误处理
      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket连接错误:', error.message)
        setIsConnected(false)
      })
    }
  }, [])

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [])

  // 发送消息
  const sendMessage = useCallback(
    (message: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('send_message', { message })
      }
    },
    [isConnected]
  )

  // 发送输入状态
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('typing', { isTyping })
        setIsTyping(isTyping)
      }
    },
    [isConnected]
  )

  // 组件挂载时连接
  useEffect(() => {
    connect()

    // 组件卸载时断开连接
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    messages,
    onlineUsers,
    userCount,
    isTyping,
    typingUsers,
    sendMessage,
    sendTyping,
    connect,
    disconnect,
    myIp,
  }
}

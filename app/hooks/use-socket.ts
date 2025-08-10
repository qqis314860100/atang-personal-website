'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// 全局Socket管理器
class GlobalSocketManager {
  private static instance: GlobalSocketManager
  private socket: Socket | null = null
  private isConnecting = false

  // 全局状态
  private globalState = {
    isConnected: false,
    userCount: 0,
    messages: [] as any[],
    onlineUsers: [] as any[],
    typingUsers: [] as string[],
  }

  // 状态变化监听器
  private stateChangeListeners: Array<() => void> = []

  static getInstance(): GlobalSocketManager {
    if (!GlobalSocketManager.instance) {
      GlobalSocketManager.instance = new GlobalSocketManager()
    }
    return GlobalSocketManager.instance
  }

  // 添加状态变化监听器
  onStateChange(listener: () => void) {
    this.stateChangeListeners.push(listener)
  }

  // 移除状态变化监听器
  offStateChange(listener: () => void) {
    const index = this.stateChangeListeners.indexOf(listener)
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1)
    }
  }

  // 通知状态变化
  private notifyStateChange() {
    this.stateChangeListeners.forEach((listener) => listener())
  }

  // 更新全局状态
  private updateGlobalState(newState: Partial<typeof this.globalState>) {
    this.globalState = { ...this.globalState, ...newState }
    this.notifyStateChange()
  }

  connect(): Socket | null {
    if (this.socket?.connected) {
      console.log('🔄 复用现有全局Socket连接')
      return this.socket
    }

    if (this.isConnecting) {
      console.log('⏳ 全局Socket正在连接中，等待...')
      return null
    }

    this.isConnecting = true
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    console.log('🔌 创建新的全局Socket连接:', socketUrl)

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 15000,
      forceNew: false, // 不强制创建新连接
      reconnection: false,
    })

    // 设置连接事件监听器
    this.socket.on('connect', () => {
      console.log('✅ 全局Socket连接成功')
      this.updateGlobalState({ isConnected: true })
    })

    this.socket.on('disconnect', () => {
      console.log('❌ 全局Socket连接断开')
      this.updateGlobalState({ isConnected: false })
    })

    this.socket.on('user_count_update', (count: number) => {
      this.updateGlobalState({ userCount: count })
    })

    this.socket.on('user_list_update', (users: any[]) => {
      this.updateGlobalState({ onlineUsers: users })
    })

    this.socket.on('typing_users_update', (users: string[]) => {
      this.updateGlobalState({ typingUsers: users })
    })

    this.isConnecting = false
    console.log('✅ 全局Socket连接创建完成')
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 断开全局Socket连接')
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnecting = false
    this.updateGlobalState({
      isConnected: false,
      userCount: 0,
      messages: [],
      onlineUsers: [],
      typingUsers: [],
    })
  }

  getSocket(): Socket | null {
    return this.socket
  }

  // 获取全局状态
  getGlobalState() {
    return this.globalState
  }
}

// 全局Socket管理器实例
const socketManager = GlobalSocketManager.getInstance()

// 导出全局断开方法，用于应用关闭时
export const disconnectGlobalSocket = () => {
  socketManager.disconnect()
}

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

/**
 * 只读Socket状态Hook
 * 用于只需要读取数据而不需要发送消息的组件
 * 不会触发连接逻辑，只读取现有连接的状态
 */
export function useSocketReadonly() {
  const [isConnected, setIsConnected] = useState(false)
  const [userCount, setUserCount] = useState(0)
  const [messages, setMessages] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  useEffect(() => {
    // 获取现有连接的状态
    const updateState = () => {
      const globalState = socketManager.getGlobalState()
      if (globalState) {
        setIsConnected(globalState.isConnected)
        setUserCount(globalState.userCount)
        setMessages(globalState.messages)
        setOnlineUsers(globalState.onlineUsers)
        setTypingUsers(globalState.typingUsers)
      } else {
        setIsConnected(false)
        setUserCount(0)
        setMessages([])
        setOnlineUsers([])
        setTypingUsers([])
      }
    }

    // 初始状态更新
    updateState()

    // 监听全局状态变化
    const handleStateChange = () => {
      updateState()
    }

    // 添加状态变化监听器
    socketManager.onStateChange(handleStateChange)

    // 清理
    return () => {
      socketManager.offStateChange(handleStateChange)
    }
  }, [])

  return {
    isConnected,
    userCount,
    messages,
    onlineUsers,
    typingUsers,
  }
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<SocketMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([])
  const [userCount, setUserCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [myIp, setMyIp] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // 新增状态
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')
  const [lastError, setLastError] = useState<string | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastReconnectTimeRef = useRef<number>(0)
  const reconnectCooldown = 5000 // 5秒冷却时间
  const maxReconnectAttempts = 5
  const reconnectDelay = 2000 // 2秒

  // 清理重连定时器
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  // 重连逻辑
  const attemptReconnect = useCallback(() => {
    // 检查冷却时间
    const now = Date.now()
    if (now - lastReconnectTimeRef.current < reconnectCooldown) {
      console.log('⏰ 重连冷却中，跳过本次重连')
      return
    }

    if (reconnectAttempts >= maxReconnectAttempts || isReconnecting) {
      console.log('已达到最大重连次数或正在重连中，停止重连')
      setConnectionStatus('error')
      setLastError('重连失败，已达到最大尝试次数')
      setIsReconnecting(false)
      return
    }

    console.log(
      `🔄 尝试重连 (${reconnectAttempts + 1}/${maxReconnectAttempts})`
    )
    setIsReconnecting(true)
    setConnectionStatus('connecting')
    lastReconnectTimeRef.current = now

    // 延迟重连，避免立即重连
    reconnectTimeoutRef.current = setTimeout(() => {
      if (mounted && !isConnected) {
        console.log('执行重连...')
        // 断开现有连接
        if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current = null
        }

        // 使用全局Socket管理器重连
        const newSocket = socketManager.connect()
        if (newSocket) {
          socketRef.current = newSocket
          setupSocketListeners()
          setReconnectAttempts((prev) => prev + 1)
        }
      }
    }, reconnectDelay)
  }, [
    reconnectAttempts,
    maxReconnectAttempts,
    isReconnecting,
    mounted,
    isConnected,
    reconnectDelay,
    reconnectCooldown,
  ])

  // 设置Socket事件监听器
  const setupSocketListeners = useCallback(() => {
    if (!socketRef.current) return

    // 连接成功
    socketRef.current.on('connect', () => {
      if (mounted) {
        console.log('✅ Socket 连接成功')
        setIsConnected(true)
        setConnectionStatus('connected')
        setReconnectAttempts(0)
        setLastError(null)
        setIsReconnecting(false)
        clearReconnectTimeout()

        // 服务器端会自动处理用户加入，无需手动发送join事件
        console.log('🔄 等待服务器自动处理用户加入...')
      }
    })

    // 连接断开
    socketRef.current.on('disconnect', (reason) => {
      if (mounted) {
        console.log('❌ Socket 连接断开，原因:', reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')

        // 如果不是主动断开，尝试重连（但限制频率）
        if (
          reason !== 'io client disconnect' &&
          reason !== 'io server disconnect'
        ) {
          console.log('🔄 连接意外断开，准备重连...')
          attemptReconnect()
        } else {
          console.log('ℹ️ 忽略断开事件，不进行重连')
        }
      }
    })

    // 连接错误处理
    socketRef.current.on('connect_error', (error) => {
      if (mounted) {
        console.error('❌ Socket连接错误:', error.message)
        setConnectionStatus('error')
        setLastError(`连接错误: ${error.message}`)
        setIsConnected(false)

        // 连接错误时也尝试重连
        if (reconnectAttempts < maxReconnectAttempts) {
          attemptReconnect()
        }
      }
    })

    // 接收新消息
    socketRef.current.on('new_message', (message: SocketMessage) => {
      if (mounted) {
        console.log('📨 收到新消息:', message)
        setMessages((prev) => [...prev, message])
      }
    })

    // 接收在线用户列表
    socketRef.current.on('online_users', (users: SocketUser[]) => {
      if (mounted) {
        console.log('👥 收到在线用户列表:', users)
        setOnlineUsers(users)
        setUserCount(users.length)
      }
    })

    // 接收用户数量更新
    socketRef.current.on('user_count', (count: number) => {
      if (mounted) {
        console.log('📊 收到用户数量更新:', count)
        setUserCount(count)
      }
    })

    // 用户加入
    socketRef.current.on('user_joined', (user: SocketUser) => {
      if (mounted) {
        setOnlineUsers((prev) => [...prev, user])
        setUserCount((prev) => prev + 1)
      }
    })

    // 用户离开
    socketRef.current.on('user_left', (user: SocketUser) => {
      if (mounted) {
        setOnlineUsers((prev) => prev.filter((u) => u.id !== user.id))
        setUserCount((prev) => Math.max(0, prev - 1))
      }
    })

    // 用户正在输入
    socketRef.current.on(
      'user_typing',
      (data: { username: string; isTyping: boolean }) => {
        if (mounted) {
          if (data.isTyping) {
            setTypingUsers((prev) => [...prev, data.username])
          } else {
            setTypingUsers((prev) => prev.filter((u) => u !== data.username))
          }
        }
      }
    )

    // 监听 your_ip 事件
    socketRef.current.on(
      'your_ip',
      (data: { ip: string; info?: any; formatted?: string }) => {
        if (mounted) {
          console.log('🌐 收到IP信息:', data)
          setMyIp(data.ip)

          // 如果有IP详细信息，也存储起来
          if (data.info) {
            console.log('📍 IP详细信息:', data.info)
          }
        }
      }
    )
  }, [
    mounted,
    attemptReconnect,
    reconnectAttempts,
    maxReconnectAttempts,
    clearReconnectTimeout,
  ])

  // 连接 Socket
  const connect = useCallback(() => {
    if (!socketRef.current && mounted) {
      console.log('🔌 useSocket: 尝试连接...')
      // 使用全局Socket管理器
      const socket = socketManager.connect()
      if (socket) {
        console.log('✅ useSocket: 成功获取全局Socket连接')
        socketRef.current = socket
        setupSocketListeners()

        // 连接错误处理
        socket.on('connect_error', (error) => {
          if (mounted) {
            console.error('❌ Socket连接错误:', error.message)
            setIsConnected(false)
          }
        })
      } else {
        console.log('❌ useSocket: 无法获取全局Socket连接')
      }
    } else {
      console.log('ℹ️ useSocket: 已有连接或组件未挂载')
    }
  }, [mounted, setupSocketListeners])

  // 断开连接（只断开本地引用，不断开全局连接）
  const disconnect = useCallback(() => {
    console.log('🔌 断开本地Socket引用')
    clearReconnectTimeout()
    setIsReconnecting(false)
    setReconnectAttempts(0)

    if (socketRef.current) {
      socketRef.current = null
    }

    if (mounted) {
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }, [mounted, clearReconnectTimeout])

  // 手动重连
  const reconnect = useCallback(() => {
    console.log('🔄 手动重连')
    disconnect()
    setTimeout(() => {
      connect()
    }, 1000)
  }, [disconnect, connect])

  // 发送消息
  const sendMessage = useCallback(
    (message: string) => {
      if (socketRef.current && isConnected && mounted) {
        socketRef.current.emit('send_message', { message })
      } else {
        console.warn('Socket未连接，无法发送消息')
        setLastError('Socket未连接，无法发送消息')
      }
    },
    [isConnected, mounted]
  )

  // 发送输入状态
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (socketRef.current && isConnected && mounted) {
        socketRef.current.emit('typing', { isTyping })
        setIsTyping(isTyping)
      }
    },
    [isConnected, mounted]
  )

  // 组件挂载状态管理
  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // 组件挂载时连接
  useEffect(() => {
    if (mounted) {
      console.log('🚀 useSocket: 组件挂载，开始连接...')
      connect()
    }

    // 组件卸载时不断开连接，让其他组件继续使用
    return () => {
      console.log('🔌 useSocket: 组件卸载，清理本地状态...')
      // 只清理本地状态，不断开全局连接
      if (socketRef.current) {
        socketRef.current = null
      }
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }
  }, [mounted]) // 移除 connect, disconnect 依赖，避免无限重连

  return {
    isConnected,
    connectionStatus,
    lastError,
    reconnectAttempts,
    isReconnecting,
    messages,
    onlineUsers,
    userCount,
    isTyping,
    typingUsers,
    sendMessage,
    sendTyping,
    connect,
    disconnect,
    reconnect,
    myIp,
  }
}

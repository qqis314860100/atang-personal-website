'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface DashboardRealtimeData {
  currentUsers: number
  activeSessions: number
  pageViews: number
  events: number
  userActivity: Array<{
    user: string
    action: string
    page: string
    time: string
  }>
  systemStatus: {
    uptime: number
    responseTime: number
    errorRate: number
    activeConnections: number
  }
}

export function useDashboardSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [realtimeData, setRealtimeData] =
    useState<DashboardRealtimeData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [mounted, setMounted] = useState(false)

  const socketRef = useRef<Socket | null>(null)

  // 连接 Socket
  const connect = useCallback(() => {
    if (!socketRef.current && mounted) {
      const socketUrl =
        process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
      console.log('🔌 尝试连接到Dashboard Socket服务器:', socketUrl)

      socketRef.current = io(socketUrl, {
        path: '/api/socket/dashboard',
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
      })

      // 连接成功
      socketRef.current.on('connect', () => {
        if (mounted) {
          console.log('✅ Dashboard Socket 连接成功')
          setIsConnected(true)
        }
      })

      // 连接断开
      socketRef.current.on('disconnect', (reason) => {
        if (mounted) {
          console.log('❌ Dashboard Socket 连接断开，原因:', reason)
          setIsConnected(false)
        }
      })

      // 接收dashboard实时数据
      socketRef.current.on('dashboard_data', (data: DashboardRealtimeData) => {
        if (mounted) {
          console.log('📊 收到Dashboard实时数据:', data)
          setRealtimeData(data)
        }
      })

      // 连接错误处理
      socketRef.current.on('connect_error', (error) => {
        if (mounted) {
          console.error('❌ Dashboard Socket连接错误:', error.message)
          setIsConnected(false)
        }
      })
    }
  }, [mounted])

  // 断开连接
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      if (mounted) {
        setIsConnected(false)
      }
    }
  }, [mounted])

  // 请求实时数据
  const requestRealtimeData = useCallback(() => {
    if (socketRef.current && isConnected && mounted) {
      socketRef.current.emit('request_realtime_data')
    }
  }, [isConnected, mounted])

  // 切换监控状态
  const toggleMonitoring = useCallback(
    (tracking: boolean) => {
      if (socketRef.current && isConnected && mounted) {
        socketRef.current.emit('toggle_monitoring', tracking)
        setIsTracking(tracking)
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
      connect()
    }

    // 组件卸载时断开连接
    return () => {
      disconnect()
    }
  }, [connect, disconnect, mounted])

  return {
    isConnected,
    realtimeData,
    isTracking,
    requestRealtimeData,
    toggleMonitoring,
    connect,
    disconnect,
  }
}

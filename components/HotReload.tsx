'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface I18nUpdateMessage {
  type: 'i18n-update-start' | 'i18n-update-success' | 'i18n-update-error'
  message: string
  timestamp?: number
  error?: string
}

export default function HotReload() {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  useEffect(() => {
    // 只在开发环境启用
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connect = () => {
      try {
        ws = new WebSocket('ws://localhost:3002')

        ws.onopen = () => {
          console.log('🔥 已连接到 i18n 热更新服务')
          setIsConnected(true)
          reconnectAttempts = 0
        }

        ws.onmessage = (event) => {
          try {
            const message: I18nUpdateMessage = JSON.parse(event.data)
            handleI18nUpdate(message)
          } catch (error) {
            console.error('解析 WebSocket 消息失败:', error)
          }
        }

        ws.onclose = () => {
          console.log('📱 与 i18n 热更新服务断开连接')
          setIsConnected(false)
          
          // 自动重连
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            console.log(`🔄 尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})...`)
            reconnectTimer = setTimeout(connect, 2000 * reconnectAttempts)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket 连接错误:', error)
        }

      } catch (error) {
        console.error('创建 WebSocket 连接失败:', error)
      }
    }

    const handleI18nUpdate = (message: I18nUpdateMessage) => {
      switch (message.type) {
        case 'i18n-update-start':
          toast.loading(message.message, {
            id: 'i18n-update',
            duration: Infinity
          })
          break

        case 'i18n-update-success':
          toast.success(message.message, {
            id: 'i18n-update',
            duration: 3000
          })
          
          if (message.timestamp) {
            setLastUpdate(message.timestamp)
          }
          
          // 延迟刷新页面，让用户看到成功消息
          setTimeout(() => {
            window.location.reload()
          }, 1000)
          break

        case 'i18n-update-error':
          toast.error(`更新失败: ${message.message}`, {
            id: 'i18n-update',
            duration: 5000
          })
          break
      }
    }

    // 初始连接
    connect()

    // 清理函数
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (ws) {
        ws.close()
      }
    }
  }, [])

  // 开发环境显示连接状态
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
        }
      `}>
        <div className="flex items-center gap-2">
          <div className={`
            w-2 h-2 rounded-full
            ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}
          `} />
          <span>
            {isConnected ? 'i18n 热更新已连接' : 'i18n 热更新已断开'}
          </span>
        </div>
        
        {lastUpdate && (
          <div className="text-xs text-gray-600 mt-1">
            最后更新: {new Date(lastUpdate).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}

// 导出类型供其他组件使用
export type { I18nUpdateMessage }
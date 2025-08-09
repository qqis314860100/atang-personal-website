import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'

interface DashboardData {
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

// 存储连接的客户端
const connectedClients = new Map<string, any>()

// 模拟实时数据生成
function generateRealtimeData(): DashboardData {
  const now = new Date()
  const actions = ['浏览页面', '点击按钮', '提交表单', '下载文件', '搜索内容']
  const pages = ['/dashboard', '/blog', '/project', '/about', '/contact']

  return {
    currentUsers: Math.floor(Math.random() * 20) + 30,
    activeSessions: Math.floor(Math.random() * 50) + 100,
    pageViews: Math.floor(Math.random() * 10) + 80,
    events: Math.floor(Math.random() * 20) + 450,
    userActivity: [
      {
        user: `用户${Math.floor(Math.random() * 1000)}`,
        action: actions[Math.floor(Math.random() * actions.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        time: now.toLocaleTimeString('zh-CN', { hour12: false }),
      },
    ],
    systemStatus: {
      uptime: 99.9,
      responseTime: 0.8 + Math.random() * 0.4,
      errorRate: 0.1 + Math.random() * 0.2,
      activeConnections: Math.floor(Math.random() * 10) + 40,
    },
  }
}

export async function GET(req: NextRequest) {
  const res = NextResponse.next()

  // 类型断言
  const socketServer = (res as any).socket?.server

  if (socketServer && !socketServer.io) {
    console.log('🚀 初始化Dashboard Socket.IO服务器...')

    const httpServer: NetServer = socketServer as any
    const io = new SocketIOServer(httpServer, {
      path: '/api/socket/dashboard',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    })

    // 存储io实例
    socketServer.io = io

    // 连接处理
    io.on('connection', (socket) => {
      console.log('🔌 Dashboard客户端连接:', socket.id)
      connectedClients.set(socket.id, socket)

      // 发送初始数据
      socket.emit('dashboard_data', generateRealtimeData())

      // 加入dashboard房间
      socket.join('dashboard')

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log('❌ Dashboard客户端断开连接:', socket.id)
        connectedClients.delete(socket.id)
      })

      // 处理请求实时数据
      socket.on('request_realtime_data', () => {
        socket.emit('dashboard_data', generateRealtimeData())
      })

      // 处理开始/停止监控
      socket.on('toggle_monitoring', (isTracking: boolean) => {
        if (isTracking) {
          console.log('📊 开始Dashboard实时监控')
          // 开始定时发送数据
          const interval = setInterval(() => {
            if (connectedClients.has(socket.id)) {
              socket.emit('dashboard_data', generateRealtimeData())
            } else {
              clearInterval(interval)
            }
          }, 5000)

          // 存储interval ID
          socket.data.monitoringInterval = interval
        } else {
          console.log('⏸️ 停止Dashboard实时监控')
          if (socket.data.monitoringInterval) {
            clearInterval(socket.data.monitoringInterval)
            socket.data.monitoringInterval = null
          }
        }
      })
    })

    // 定期广播数据给所有连接的客户端
    setInterval(() => {
      const data = generateRealtimeData()
      io.to('dashboard').emit('dashboard_data', data)
    }, 10000) // 每10秒更新一次
  }

  return res
}

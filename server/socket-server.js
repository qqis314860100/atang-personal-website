import { createServer } from 'http'
import { Server } from 'socket.io'
import cluster from 'cluster'
import os from 'os'
import { IpUtils } from './ip-utils.js'

// 生产环境使用集群模式
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`主进程 ${process.pid} 正在运行`)

  // 为每个 CPU 核心创建一个工作进程
  const numCPUs = os.cpus().length
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`)
    // 自动重启工作进程
    cluster.fork()
  })
} else {
  // 工作进程或开发环境
  const httpServer = createServer()

  // 健康检查端点
  httpServer.on('request', (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          status: 'ok',
          timestamp: new Date().toISOString(),
          processId: process.pid,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          environment: process.env.NODE_ENV || 'development',
        })
      )
    } else {
      res.writeHead(404)
      res.end('Not Found')
    }
  })

  // 创建 Socket.IO 服务器
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    // 生产环境优化
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxHttpBufferSize: 1e6,
  })

  // 存储在线用户
  const onlineUsers = new Map()

  // 心跳检测
  let heartbeatInterval
  if (process.env.NODE_ENV === 'production') {
    heartbeatInterval = setInterval(() => {
      console.log(`[${new Date().toISOString()}] 在线用户: ${onlineUsers.size}`)
    }, 30000) // 每30秒记录一次
  }

  // Socket 连接处理
  io.on('connection', async (socket) => {
    console.log(`用户连接: ${socket.id} (进程: ${process.pid})`)

    // 获取用户真实IP地址
    const clientIp = IpUtils.getClientIp(socket)
    const normalizedIp = IpUtils.normalizeIp(clientIp)
    console.log(
      `用户 ${socket.id} 的IP地址: ${clientIp} -> 标准化: ${normalizedIp}`
    )

    // 如果是本地IP，尝试获取公网IP
    let finalIp = normalizedIp
    if (IpUtils.isLocalIp(normalizedIp)) {
      try {
        console.log('🌐 尝试获取公网IP...')
        const publicIp = await IpUtils.getPublicIp()
        finalIp = publicIp
        console.log(`🌐 获取到公网IP: ${publicIp}`)
      } catch (error) {
        console.log('❌ 获取公网IP失败:', error.message)
        finalIp = normalizedIp
      }
    }

    // 获取IP详细信息
    try {
      const ipInfo = await IpUtils.getIpInfo(finalIp)
      console.log('📍 IP详细信息:', ipInfo)

      // 发送IP地址和详细信息给客户端
      socket.emit('your_ip', {
        ip: finalIp,
        info: ipInfo,
        formatted: IpUtils.formatIp(finalIp),
      })
    } catch (error) {
      console.log('❌ 获取IP信息失败:', error.message)

      // 发送基本IP信息
      socket.emit('your_ip', {
        ip: finalIp,
        formatted: IpUtils.formatIp(finalIp),
      })
    }

    // 用户加入聊天室
    socket.on('join', (data) => {
      const userData = {
        id: socket.id,
        username: clientIp,
        timestamp: new Date(),
        processId: process.pid,
      }

      onlineUsers.set(socket.id, userData)

      // 广播用户加入消息
      socket.broadcast.emit('user_joined', {
        id: socket.id,
        username: clientIp,
        timestamp: new Date(),
      })

      // 发送在线用户列表
      socket.emit('online_users', Array.from(onlineUsers.values()))

      // 广播在线用户数量
      io.emit('user_count', onlineUsers.size)

      console.log(`用户 ${clientIp} 加入聊天室，当前在线: ${onlineUsers.size}`)
    })

    // 发送消息
    socket.on('send_message', (data) => {
      const messageData = {
        id: socket.id,
        username: data.username,
        message: data.message,
        timestamp: new Date(),
      }

      // 广播消息给所有用户
      io.emit('new_message', messageData)

      console.log(`用户 ${data.username} 发送消息: ${data.message}`)
    })

    // 用户正在输入
    socket.on('typing', (data) => {
      socket.broadcast.emit('user_typing', {
        username: data.username,
        isTyping: data.isTyping,
      })
    })

    // 用户断开连接
    socket.on('disconnect', (reason) => {
      const userData = onlineUsers.get(socket.id)
      if (userData) {
        onlineUsers.delete(socket.id)

        // 广播用户离开消息
        socket.broadcast.emit('user_left', {
          id: socket.id,
          username: userData.username,
          timestamp: new Date(),
        })

        // 广播在线用户数量
        io.emit('user_count', onlineUsers.size)

        console.log(
          `用户 ${userData.username} 离开聊天室 (原因: ${reason})，当前在线: ${onlineUsers.size}`
        )
      }
    })

    // 错误处理
    socket.on('error', (error) => {
      console.error(`Socket 错误: ${error.message}`)
    })
  })

  // 优雅关闭
  const gracefulShutdown = (signal) => {
    console.log(`收到 ${signal} 信号，正在优雅关闭...`)

    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
    }

    io.close(() => {
      console.log('Socket.IO 服务器已关闭')
      process.exit(0)
    })

    // 强制关闭超时
    setTimeout(() => {
      console.error('强制关闭服务器')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  // 启动服务器
  const PORT = process.env.SOCKET_PORT || 3001
  httpServer.listen(PORT, () => {
    console.log(`Socket.IO 服务器运行在端口 ${PORT} (进程: ${process.pid})`)
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`)
    console.log(`健康检查: http://localhost:${PORT}/health`)
  })
}

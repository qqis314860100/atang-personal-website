import { io } from 'socket.io-client'

// 模拟不同IP地址的用户
const mockUsers = [
  { ip: '192.168.1.100', name: '用户A' },
  { ip: '10.0.0.50', name: '用户B' },
  { ip: '172.16.0.25', name: '用户C' },
  { ip: '203.208.60.1', name: '用户D' },
  { ip: '8.8.8.8', name: '用户E' },
  { ip: '1.1.1.1', name: '用户F' },
  { ip: '114.114.114.114', name: '用户G' },
  { ip: '223.5.5.5', name: '用户H' },
]

const SOCKET_URL = 'http://localhost:3001'

// 创建多个Socket连接
const sockets = []

async function createMockUsers() {
  console.log('🚀 开始创建模拟用户...')

  for (let i = 0; i < mockUsers.length; i++) {
    const user = mockUsers[i]

    try {
      // 创建Socket连接
      const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        // 模拟不同的IP地址
        extraHeaders: {
          'x-forwarded-for': user.ip,
          'x-real-ip': user.ip,
        },
      })

      // 连接事件
      socket.on('connect', () => {
        console.log(`✅ ${user.name} (${user.ip}) 连接成功`)
      })

      socket.on('disconnect', () => {
        console.log(`❌ ${user.name} (${user.ip}) 断开连接`)
      })

      // 接收IP信息
      socket.on('your_ip', (data) => {
        console.log(`📍 ${user.name} 收到IP信息:`, data)
      })

      // 接收在线用户列表
      socket.on('online_users', (users) => {
        console.log(`👥 ${user.name} 收到在线用户列表:`, users.length, '个用户')
      })

      // 接收用户数量
      socket.on('user_count', (count) => {
        console.log(`📊 ${user.name} 收到用户数量:`, count)
      })

      // 接收新消息
      socket.on('new_message', (message) => {
        console.log(
          `💬 ${user.name} 收到消息:`,
          message.username,
          ':',
          message.message
        )
      })

      // 接收用户加入/离开通知
      socket.on('user_joined', (data) => {
        console.log(`👋 ${user.name} 收到用户加入:`, data.username)
      })

      socket.on('user_left', (data) => {
        console.log(`👋 ${user.name} 收到用户离开:`, data.username)
      })

      // 错误处理
      socket.on('error', (error) => {
        console.error(`❌ ${user.name} Socket错误:`, error)
      })

      sockets.push({ socket, user })

      // 延迟创建下一个用户，避免同时连接过多
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`❌ 创建用户 ${user.name} 失败:`, error)
    }
  }

  console.log(`✅ 成功创建 ${sockets.length} 个模拟用户`)
}

// 模拟用户发送消息
async function simulateMessages() {
  console.log('💬 开始模拟消息发送...')

  const messages = [
    '大家好！',
    '今天天气不错',
    '有人在线吗？',
    '测试消息',
    'Hello World!',
    '这是一个测试',
    '聊天室功能正常',
    '多用户测试',
  ]

  for (let i = 0; i < 10; i++) {
    // 随机选择一个用户发送消息
    const randomIndex = Math.floor(Math.random() * sockets.length)
    const { socket, user } = sockets[randomIndex]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    try {
      socket.emit('send_message', { message: `${user.name}: ${randomMessage}` })
      console.log(`📤 ${user.name} (${user.ip}) 发送消息: ${randomMessage}`)
    } catch (error) {
      console.error(`❌ ${user.name} 发送消息失败:`, error)
    }

    // 延迟发送下一条消息
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
}

// 模拟用户加入/离开
async function simulateUserActivity() {
  console.log('🔄 开始模拟用户活动...')

  // 随机断开一些用户
  setTimeout(async () => {
    const disconnectCount = Math.floor(sockets.length / 3)
    for (let i = 0; i < disconnectCount; i++) {
      const randomIndex = Math.floor(Math.random() * sockets.length)
      const { socket, user } = sockets[randomIndex]

      console.log(`🔌 断开用户: ${user.name} (${user.ip})`)
      socket.disconnect()

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }, 10000)

  // 重新连接一些用户
  setTimeout(async () => {
    console.log('🔄 重新连接一些用户...')
    // 这里可以添加重新连接逻辑
  }, 15000)
}

// 主函数
async function main() {
  try {
    console.log('🎯 开始多IP用户模拟测试')
    console.log('=' * 50)

    // 创建模拟用户
    await createMockUsers()

    // 等待所有用户连接完成
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // 开始模拟消息发送
    simulateMessages()

    // 开始模拟用户活动
    simulateUserActivity()

    // 保持程序运行
    console.log('⏰ 测试将持续运行，按 Ctrl+C 停止')
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭所有连接...')

  sockets.forEach(({ socket, user }) => {
    console.log(`🔌 断开 ${user.name} (${user.ip})`)
    socket.disconnect()
  })

  setTimeout(() => {
    console.log('✅ 所有连接已关闭')
    process.exit(0)
  }, 1000)
})

// 运行测试
main()

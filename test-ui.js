import { io } from 'socket.io-client'

console.log('🎨 测试新的微信风格聊天UI')
console.log('=' * 50)

// 创建Socket连接
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  extraHeaders: {
    'x-forwarded-for': '192.168.1.100',
    'x-real-ip': '192.168.1.100',
  },
})

// 连接事件
socket.on('connect', () => {
  console.log('✅ 连接成功')

  // 发送测试消息
  setTimeout(() => {
    socket.emit('send_message', { message: '测试新的微信风格UI！' })
    console.log('📤 发送测试消息')
  }, 1000)

  // 模拟输入状态
  setTimeout(() => {
    socket.emit('typing', { isTyping: true })
    console.log('⌨️ 模拟输入状态')
  }, 2000)

  // 停止输入状态
  setTimeout(() => {
    socket.emit('typing', { isTyping: false })
    console.log('⏹️ 停止输入状态')
  }, 4000)
})

socket.on('disconnect', () => {
  console.log('❌ 断开连接')
})

// 接收消息
socket.on('new_message', (message) => {
  console.log(`💬 收到消息: ${message.username}: ${message.message}`)
})

// 接收IP信息
socket.on('your_ip', (data) => {
  console.log(`📍 收到IP信息:`, data)
})

// 接收在线用户列表
socket.on('online_users', (users) => {
  console.log(`👥 在线用户:`, users.length, '个')
})

// 接收用户数量
socket.on('user_count', (count) => {
  console.log(`📊 用户数量:`, count)
})

// 错误处理
socket.on('error', (error) => {
  console.error(`❌ Socket错误:`, error)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭连接...')
  socket.disconnect()
  setTimeout(() => {
    console.log('✅ 连接已关闭')
    process.exit(0)
  }, 1000)
})

console.log('⏰ 按 Ctrl+C 停止测试')

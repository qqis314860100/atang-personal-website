const { io } = require('socket.io-client')

console.log('🧪 开始连接测试...')

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
})

socket.on('connect', () => {
  console.log('✅ 连接成功')
})

socket.on('online_users', (users) => {
  console.log('👥 收到在线用户列表:', users.length, '人')
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.username} (${user.id})`)
  })
})

socket.on('user_count', (count) => {
  console.log('📊 收到用户数量:', count)
})

socket.on('user_joined', (user) => {
  console.log('➕ 用户加入:', user.username)
})

socket.on('disconnect', (reason) => {
  console.log('❌ 连接断开:', reason)
})

socket.on('connect_error', (error) => {
  console.error('❌ 连接错误:', error.message)
})

// 10秒后断开连接
setTimeout(() => {
  console.log('🔄 测试完成，断开连接')
  socket.disconnect()
  process.exit(0)
}, 10000)

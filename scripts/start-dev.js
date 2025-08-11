import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 启动开发环境...')

// 启动 Socket 服务器
const socketServer = spawn('node', ['server/socket-server.js'], {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
})

// 启动 Next.js 开发服务器
const nextServer = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: join(__dirname, '..'),
})

// 处理进程退出
const cleanup = () => {
  console.log('\n🛑 正在关闭服务器...')
  socketServer.kill()
  nextServer.kill()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// 处理子进程退出
socketServer.on('close', (code) => {
  console.log(`Socket 服务器退出，代码: ${code}`)
  cleanup()
})

nextServer.on('close', (code) => {
  console.log(`Next.js 服务器退出，代码: ${code}`)
  cleanup()
})

console.log('✅ 开发环境已启动!')
console.log('📱 Next.js: http://localhost:3000')
console.log('🔌 Socket.IO: http://localhost:3001')
console.log('🧪 测试页面: http://localhost:3000/test-socket')

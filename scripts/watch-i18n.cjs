const chokidar = require('chokidar')
const path = require('path')
const { exec } = require('child_process')
const WebSocket = require('ws')

class I18nWatcher {
  constructor() {
    this.wss = null
    this.isGenerating = false
    this.debounceTimer = null
  }

  // 初始化 WebSocket 服务器
  initWebSocketServer() {
    this.wss = new WebSocket.Server({ port: 3002 })
    console.log('🔥 i18n 热更新服务启动在端口 3002')
    
    this.wss.on('connection', (ws) => {
      console.log('📱 客户端连接到 i18n 热更新服务')
      ws.on('close', () => {
        console.log('📱 客户端断开连接')
      })
    })
  }

  // 广播更新消息
  broadcast(message) {
    if (this.wss) {
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message))
        }
      })
    }
  }

  // 重新生成缓存
  async regenerateCache() {
    if (this.isGenerating) {
      console.log('⏳ 缓存生成中，跳过此次更新')
      return
    }

    this.isGenerating = true
    console.log('🔄 检测到翻译文件变更，重新生成缓存...')
    
    this.broadcast({
      type: 'i18n-update-start',
      message: '正在重新生成国际化缓存...'
    })

    try {
      await new Promise((resolve, reject) => {
        exec('node scripts/generate-zh-cache.cjs', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ 缓存生成失败:', error)
            reject(error)
            return
          }
          console.log('✅ 缓存生成成功')
          console.log(stdout)
          resolve()
        })
      })

      this.broadcast({
        type: 'i18n-update-success',
        message: '国际化缓存更新成功',
        timestamp: Date.now()
      })

    } catch (error) {
      this.broadcast({
        type: 'i18n-update-error',
        message: '缓存生成失败: ' + error.message,
        error: error.message
      })
    } finally {
      this.isGenerating = false
    }
  }

  // 防抖处理
  debouncedRegenerate() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    
    this.debounceTimer = setTimeout(() => {
      this.regenerateCache()
    }, 300) // 300ms 防抖
  }

  // 启动文件监听
  startWatching() {
    const watchPaths = [
      'messages/zh/**/*.json',
      'messages/en/**/*.json'
    ]

    console.log('👀 开始监听翻译文件变更...')
    console.log('📁 监听路径:', watchPaths)

    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    })

    watcher
      .on('change', (filePath) => {
        console.log(`📝 文件变更: ${filePath}`)
        this.debouncedRegenerate()
      })
      .on('add', (filePath) => {
        console.log(`➕ 新增文件: ${filePath}`)
        this.debouncedRegenerate()
      })
      .on('unlink', (filePath) => {
        console.log(`🗑️  删除文件: ${filePath}`)
        this.debouncedRegenerate()
      })
      .on('error', (error) => {
        console.error('❌ 文件监听错误:', error)
      })

    return watcher
  }

  // 启动服务
  start() {
    this.initWebSocketServer()
    this.startWatching()
    
    console.log('🚀 i18n 实时热更新服务已启动')
    console.log('💡 修改翻译文件将自动重新生成缓存')
  }
}

// 启动服务
if (require.main === module) {
  const watcher = new I18nWatcher()
  watcher.start()

  // 优雅退出
  process.on('SIGINT', () => {
    console.log('\n👋 正在关闭 i18n 热更新服务...')
    process.exit(0)
  })
}

module.exports = I18nWatcher
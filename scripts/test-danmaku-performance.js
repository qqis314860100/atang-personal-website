#!/usr/bin/env node

/**
 * 弹幕性能测试脚本
 * 测试弹幕组件的渲染性能和稳定性
 */

console.log('🚀 开始弹幕性能测试...\n')

// 模拟弹幕数据
const mockDanmakuList = [
  {
    id: '1',
    text: '测试弹幕1',
    time: 0,
    color: 'hsl(0, 70%, 60%)',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    text: '测试弹幕2',
    time: 1,
    color: 'hsl(120, 70%, 60%)',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:01Z',
  },
  {
    id: '3',
    text: '测试弹幕3',
    time: 2,
    color: 'hsl(240, 70%, 60%)',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:02Z',
  },
  {
    id: '4',
    text: '测试弹幕4',
    time: 3,
    color: 'hsl(60, 70%, 60%)',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:03Z',
  },
  {
    id: '5',
    text: '测试弹幕5',
    time: 4,
    color: 'hsl(180, 70%, 60%)',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:04Z',
  },
]

console.log('📊 弹幕数据:', mockDanmakuList)

// 测试弹幕组件性能
console.log('\n🔍 测试弹幕组件性能...')

// 模拟组件渲染
let renderCount = 0
let lastRenderTime = Date.now()

const simulateRender = () => {
  renderCount++
  const currentTime = Date.now()
  const timeSinceLastRender = currentTime - lastRenderTime

  console.log(`渲染 #${renderCount}: 间隔 ${timeSinceLastRender}ms`)

  if (timeSinceLastRender < 100) {
    console.warn('⚠️  警告: 渲染间隔过短，可能存在性能问题')
  }

  lastRenderTime = currentTime
}

// 模拟弹幕播放
console.log('\n🎬 模拟弹幕播放...')

mockDanmakuList.forEach((danmaku, index) => {
  setTimeout(() => {
    console.log(`播放弹幕: ${danmaku.text} (ID: ${danmaku.id})`)
    simulateRender()
  }, index * 1000)
})

// 性能监控
console.log('\n📈 性能监控启动...')

const performanceMonitor = setInterval(() => {
  const memoryUsage = process.memoryUsage()
  console.log(`内存使用: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`)

  if (renderCount > 10) {
    console.log('✅ 弹幕播放测试完成')
    clearInterval(performanceMonitor)
    process.exit(0)
  }
}, 2000)

console.log('\n⏳ 等待弹幕播放完成...')
console.log('按 Ctrl+C 停止测试')

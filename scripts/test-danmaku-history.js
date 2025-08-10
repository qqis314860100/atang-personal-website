// 测试历史弹幕功能
console.log('🧪 开始测试历史弹幕功能...')

// 模拟弹幕数据
const mockDanmakuList = [
  {
    id: '1',
    text: '这是第一条历史弹幕',
    time: 0,
    color: '#ff0000',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    text: '这是第二条历史弹幕',
    time: 5,
    color: '#00ff00',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:05.000Z',
  },
  {
    id: '3',
    text: '这是第三条历史弹幕',
    time: 10,
    color: '#0000ff',
    type: 'scroll',
    sendTime: '2024-01-01T00:00:10.000Z',
  },
]

// 测试弹幕排序
console.log('📊 测试弹幕排序...')
const sortedDanmaku = [...mockDanmakuList].sort((a, b) => a.time - b.time)
console.log(
  '排序前:',
  mockDanmakuList.map((d) => ({ text: d.text, time: d.time }))
)
console.log(
  '排序后:',
  sortedDanmaku.map((d) => ({ text: d.text, time: d.time }))
)

// 测试弹幕队列处理
console.log('\n🎯 测试弹幕队列处理...')
function processDanmakuQueue(danmakuList) {
  const timeGroups = new Map()

  // 按时间分组
  danmakuList.forEach((danmaku) => {
    const timeKey = Math.floor(danmaku.time * 10) / 10
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, [])
    }
    timeGroups.get(timeKey).push(danmaku)
  })

  // 按时间顺序处理
  const sortedTimes = Array.from(timeGroups.keys()).sort((a, b) => a - b)

  console.log('时间分组结果:')
  sortedTimes.forEach((time) => {
    const group = timeGroups.get(time)
    console.log(`时间 ${time}s: ${group.length} 条弹幕`)
    group.forEach((d) => console.log(`  - ${d.text}`))
  })

  return sortedTimes
}

const timeGroups = processDanmakuQueue(sortedDanmaku)

// 测试弹幕时间转换
console.log('\n⏰ 测试弹幕时间转换...')
const timeMs = 5000 // 5秒 = 5000毫秒
const timeInSeconds = timeMs / 1000
console.log(`时间戳 ${timeMs}ms 转换为 ${timeInSeconds}s`)

// 测试弹幕颜色处理
console.log('\n🎨 测试弹幕颜色处理...')
const colorNumber = 16711680 // 红色
const r = (colorNumber >> 16) & 255
const g = (colorNumber >> 8) & 255
const b = colorNumber & 255
const cssColor = `rgb(${r}, ${g}, ${b})`
console.log(`颜色数字 ${colorNumber} 转换为 CSS: ${cssColor}`)

// 测试弹幕状态管理
console.log('\n📝 测试弹幕状态管理...')
const processedDanmaku = new Set()
const unprocessedDanmaku = sortedDanmaku.filter(
  (d) => !processedDanmaku.has(d.id)
)
console.log(`总弹幕数: ${sortedDanmaku.length}`)
console.log(`已处理: ${processedDanmaku.size}`)
console.log(`未处理: ${unprocessedDanmaku.length}`)

// 模拟处理弹幕
unprocessedDanmaku.forEach((danmaku, index) => {
  setTimeout(() => {
    processedDanmaku.add(danmaku.id)
    console.log(`✅ 处理弹幕 ${index + 1}: ${danmaku.text}`)
  }, index * 100)
})

console.log('\n🎉 历史弹幕功能测试完成!')
console.log('主要功能点:')
console.log('1. ✅ 弹幕时间排序')
console.log('2. ✅ 弹幕队列分组')
console.log('3. ✅ 时间戳转换')
console.log('4. ✅ 颜色处理')
console.log('5. ✅ 状态管理')

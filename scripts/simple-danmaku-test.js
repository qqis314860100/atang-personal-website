console.log('🧪 测试弹幕队列功能...')

// 模拟弹幕数据
const mockDanmakuList = [
  { id: '1', text: '第一条弹幕', time: 0.0, color: '#ff0000' },
  { id: '2', text: '第二条弹幕', time: 0.0, color: '#00ff00' },
  { id: '3', text: '第三条弹幕', time: 0.1, color: '#0000ff' },
  { id: '4', text: '第四条弹幕', time: 0.1, color: '#ffff00' },
  { id: '5', text: '第五条弹幕', time: 0.1, color: '#ff00ff' },
  { id: '6', text: '第六条弹幕', time: 1.5, color: '#00ffff' },
]

console.log('\n📋 原始弹幕列表:')
mockDanmakuList.forEach((danmaku, index) => {
  console.log(`${index + 1}. [${danmaku.time}s] ${danmaku.text}`)
})

// 按时间分组弹幕
const timeGroups = new Map()
mockDanmakuList.forEach((danmaku) => {
  const timeKey = Math.floor(danmaku.time * 10) / 10 // 按0.1秒分组
  if (!timeGroups.has(timeKey)) {
    timeGroups.set(timeKey, [])
  }
  timeGroups.get(timeKey).push(danmaku)
})

console.log('\n📊 按时间分组结果:')
const sortedTimes = Array.from(timeGroups.keys()).sort((a, b) => a - b)

sortedTimes.forEach((time) => {
  const group = timeGroups.get(time)
  console.log(`\n⏰ 时间点 ${time}s:`)
  group.forEach((danmaku, index) => {
    console.log(`  ${index + 1}. ${danmaku.text} (轨道 ${index})`)
  })
})

console.log('\n🎉 弹幕队列功能测试完成!')

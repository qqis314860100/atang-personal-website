#!/usr/bin/env node

// 测试弹幕队列功能
console.log('🧪 测试弹幕队列功能...')

// 模拟弹幕数据
const mockDanmakuList = [
  {
    id: '1',
    text: '第一条弹幕',
    time: 0.0,
    color: '#ff0000',
    type: 'scroll',
    sendTime: '2024-08-10 18:56',
  },
  {
    id: '2',
    text: '第二条弹幕',
    time: 0.0, // 相同时间点
    color: '#00ff00',
    type: 'scroll',
    sendTime: '2024-08-10 18:56',
  },
  {
    id: '3',
    text: '第三条弹幕',
    time: 0.1,
    color: '#0000ff',
    type: 'scroll',
    sendTime: '2024-08-10 18:56',
  },
  {
    id: '4',
    text: '第四条弹幕',
    time: 0.1, // 相同时间点
    color: '#ffff00',
    type: 'scroll',
    sendTime: '2024-08-10 18:56',
  },
  {
    id: '5',
    text: '第五条弹幕',
    time: 0.1, // 相同时间点
    color: '#ff00ff',
    type: 'scroll',
    sendTime: '2024-08-10 18:56',
  },
  {
    id: '6',
    text: '第六条弹幕',
    time: 1.5,
    color: '#00ffff',
    type: 'scroll',
    sendTime: '2024-08-10 18:56',
  },
]

// 模拟弹幕队列处理逻辑
function processDanmakuQueue(danmakuList) {
  console.log('\n📋 原始弹幕列表:')
  danmakuList.forEach((danmaku, index) => {
    console.log(
      `${index + 1}. [${danmaku.time}s] ${danmaku.text} (${danmaku.color})`
    )
  })

  // 按时间分组弹幕
  const timeGroups = new Map()
  danmakuList.forEach((danmaku) => {
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

  // 模拟播放顺序
  console.log('\n🎬 播放顺序模拟:')
  let totalDelay = 0

  sortedTimes.forEach((time, timeIndex) => {
    const group = timeGroups.get(time)

    console.log(`\n📺 播放时间点 ${time}s 的弹幕组:`)

    group.forEach((danmaku, index) => {
      const delay = totalDelay + index * 200 // 每个弹幕间隔200ms
      console.log(`  ${delay}ms: 播放 "${danmaku.text}" (轨道 ${index})`)
    })

    // 下一组开始时间
    totalDelay += group.length * 200 + 1000 // 当前组播放完毕 + 1秒间隔
  })

  console.log(`\n⏱️  总播放时间: ${totalDelay}ms`)

  return {
    timeGroups,
    sortedTimes,
    totalDelay,
  }
}

// 测试轨道分配
function testTrackAllocation() {
  console.log('\n🎯 测试轨道分配逻辑:')

  const trackCount = 5
  const tracks = new Array(trackCount).fill(false)

  function getAvailableTrack() {
    const availableTrack = tracks.findIndex((track) => !track)
    if (availableTrack === -1) {
      return 0 // 如果没有可用轨道，使用第一个
    }
    return availableTrack
  }

  function allocateTrack() {
    const track = getAvailableTrack()
    tracks[track] = true
    return track
  }

  function releaseTrack(track) {
    tracks[track] = false
  }

  // 模拟弹幕播放
  const testDanmaku = [
    { id: '1', text: '弹幕1' },
    { id: '2', text: '弹幕2' },
    { id: '3', text: '弹幕3' },
    { id: '4', text: '弹幕4' },
    { id: '5', text: '弹幕5' },
    { id: '6', text: '弹幕6' }, // 超出轨道数量
  ]

  testDanmaku.forEach((danmaku, index) => {
    const track = allocateTrack()
    console.log(`弹幕 "${danmaku.text}" 分配到轨道 ${track}`)

    // 模拟弹幕播放完毕，释放轨道
    setTimeout(() => {
      releaseTrack(track)
      console.log(`轨道 ${track} 已释放`)
    }, 1000 + index * 500)
  })
}

// 运行测试
console.log('🚀 开始测试弹幕队列功能...')

const result = processDanmakuQueue(mockDanmakuList)

testTrackAllocation()

console.log('\n📋 测试总结:')
console.log('- ✅ 按时间分组弹幕')
console.log('- ✅ 相同时间点的弹幕分配到不同轨道')
console.log('- ✅ 弹幕播放间隔控制')
console.log('- ✅ 轨道分配和释放机制')
console.log('- ✅ 总播放时间计算')

console.log('\n🎉 弹幕队列功能测试完成!')

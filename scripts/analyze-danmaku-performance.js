#!/usr/bin/env node

/**
 * 弹幕性能分析脚本
 * 深入分析弹幕系统的性能表现和潜在问题
 */

console.log('🚀 开始弹幕性能分析...\n')

// 性能测试配置
const PERFORMANCE_CONFIG = {
  maxDanmaku: 1000,
  trackCount: 8,
  animationDuration: 12000, // 12秒
  frameRate: 60,
  testDuration: 30000, // 30秒测试
}

// 模拟大量弹幕数据
function generateTestDanmaku(count) {
  const danmaku = []
  for (let i = 0; i < count; i++) {
    danmaku.push({
      id: `test-${i}`,
      text: `测试弹幕${i}`,
      time: Math.random() * 300, // 0-300秒随机时间
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      type: 'scroll',
      sendTime: new Date().toISOString(),
    })
  }
  return danmaku
}

// 轨道分配算法测试
function testTrackAllocation(danmakuList, trackCount) {
  console.log('🎯 轨道分配算法测试:')

  const tracks = new Array(trackCount).fill(false)
  const trackUsage = new Array(trackCount).fill(0)
  const conflicts = []

  danmakuList.forEach((danmaku, index) => {
    // 模拟轨道分配
    let track = 0
    for (let i = 0; i < trackCount; i++) {
      if (!tracks[i]) {
        track = i
        tracks[i] = true
        trackUsage[i]++
        break
      }
    }

    // 检查轨道冲突
    if (index > 0) {
      const prevDanmaku = danmakuList[index - 1]
      if (Math.abs(danmaku.time - prevDanmaku.time) < 0.1 && track === 0) {
        conflicts.push({
          danmaku1: prevDanmaku.text,
          danmaku2: danmaku.text,
          time: danmaku.time,
        })
      }
    }

    // 模拟轨道释放
    setTimeout(() => {
      tracks[track] = false
    }, PERFORMANCE_CONFIG.animationDuration)
  })

  console.log(`✅ 轨道使用情况:`)
  trackUsage.forEach((usage, track) => {
    console.log(`  轨道 ${track}: ${usage} 次使用`)
  })

  if (conflicts.length > 0) {
    console.log(`⚠️  发现 ${conflicts.length} 个轨道冲突:`)
    conflicts.slice(0, 5).forEach((conflict) => {
      console.log(
        `  - "${conflict.danmaku1}" 与 "${conflict.danmaku2}" 在 ${conflict.time}s 冲突`
      )
    })
  } else {
    console.log('✅ 无轨道冲突')
  }

  return { trackUsage, conflicts }
}

// 内存使用分析
function analyzeMemoryUsage(danmakuList) {
  console.log('\n💾 内存使用分析:')

  // 估算DOM元素内存
  const domElementSize = 200 // 每个DOM元素约200字节
  const totalDomSize = danmakuList.length * domElementSize

  // 估算状态对象内存
  const stateObjectSize = 150 // 每个状态对象约150字节
  const totalStateSize = danmakuList.length * stateObjectSize

  // 估算动画内存
  const animationSize = 100 // 每个动画约100字节
  const totalAnimationSize = danmakuList.length * animationSize

  const totalMemory = totalDomSize + totalStateSize + totalAnimationSize

  console.log(`✅ DOM元素内存: ${(totalDomSize / 1024).toFixed(2)} KB`)
  console.log(`✅ 状态对象内存: ${(totalStateSize / 1024).toFixed(2)} KB`)
  console.log(`✅ 动画内存: ${(totalAnimationSize / 1024).toFixed(2)} KB`)
  console.log(`✅ 总内存使用: ${(totalMemory / 1024).toFixed(2)} KB`)

  // 内存使用建议
  if (totalMemory > 1024 * 1024) {
    // 超过1MB
    console.log('⚠️  内存使用较高，建议优化:')
    console.log('  - 减少同时显示的弹幕数量')
    console.log('  - 实现弹幕池回收机制')
    console.log('  - 使用虚拟滚动技术')
  } else {
    console.log('✅ 内存使用合理')
  }

  return totalMemory
}

// 渲染性能分析
function analyzeRenderingPerformance(danmakuList) {
  console.log('\n⚡ 渲染性能分析:')

  // 计算渲染复杂度
  const renderComplexity = danmakuList.length * PERFORMANCE_CONFIG.trackCount

  // 估算每帧渲染时间
  const estimatedFrameTime = renderComplexity * 0.01 // 每个弹幕约0.01ms

  // 检查是否超过16.67ms (60fps)
  const frameBudget = 1000 / PERFORMANCE_CONFIG.frameRate
  const performance = estimatedFrameTime < frameBudget ? 'good' : 'poor'

  console.log(`✅ 渲染复杂度: ${renderComplexity}`)
  console.log(`✅ 估算帧时间: ${estimatedFrameTime.toFixed(2)}ms`)
  console.log(`✅ 帧预算: ${frameBudget.toFixed(2)}ms`)
  console.log(`✅ 性能评级: ${performance === 'good' ? '良好' : '需要优化'}`)

  if (performance === 'poor') {
    console.log('⚠️  渲染性能建议:')
    console.log('  - 减少同时渲染的弹幕数量')
    console.log('  - 使用requestAnimationFrame优化')
    console.log('  - 实现弹幕分层渲染')
    console.log('  - 添加性能监控')
  }

  return { renderComplexity, estimatedFrameTime, performance }
}

// 时间同步分析
function analyzeTimeSynchronization(danmakuList) {
  console.log('\n⏰ 时间同步分析:')

  // 按时间分组
  const timeGroups = new Map()
  danmakuList.forEach((danmaku) => {
    const timeKey = Math.floor(danmaku.time * 10) / 10
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, [])
    }
    timeGroups.get(timeKey).push(danmaku)
  })

  // 分析时间分布
  const timeDistribution = Array.from(timeGroups.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([time, danmakuList]) => ({
      time,
      count: danmakuList.length,
      density: danmakuList.length / 0.1, // 每秒弹幕密度
    }))

  console.log('✅ 时间分布分析:')
  timeDistribution.slice(0, 10).forEach(({ time, count, density }) => {
    console.log(
      `  时间 ${time}s: ${count} 条弹幕 (密度: ${density.toFixed(1)}/s)`
    )
  })

  // 检查高密度时间段
  const highDensityTimes = timeDistribution.filter((item) => item.density > 10)
  if (highDensityTimes.length > 0) {
    console.log(`⚠️  发现 ${highDensityTimes.length} 个高密度时间段:`)
    highDensityTimes.slice(0, 5).forEach(({ time, density }) => {
      console.log(`  - ${time}s: ${density.toFixed(1)} 弹幕/秒`)
    })
    console.log('💡 建议: 在高密度时间段增加轨道数量或延迟播放')
  }

  return { timeDistribution, highDensityTimes }
}

// 主测试函数
function runPerformanceTest() {
  console.log(`📊 测试配置:`)
  console.log(`  - 弹幕数量: ${PERFORMANCE_CONFIG.maxDanmaku}`)
  console.log(`  - 轨道数量: ${PERFORMANCE_CONFIG.trackCount}`)
  console.log(`  - 动画时长: ${PERFORMANCE_CONFIG.animationDuration}ms`)
  console.log(`  - 目标帧率: ${PERFORMANCE_CONFIG.frameRate}fps`)
  console.log(`  - 测试时长: ${PERFORMANCE_CONFIG.testDuration}ms\n`)

  // 生成测试数据
  const testDanmaku = generateTestDanmaku(PERFORMANCE_CONFIG.maxDanmaku)
  console.log(`✅ 生成 ${testDanmaku.length} 条测试弹幕`)

  // 运行各项测试
  const trackResults = testTrackAllocation(
    testDanmaku,
    PERFORMANCE_CONFIG.trackCount
  )
  const memoryResults = analyzeMemoryUsage(testDanmaku)
  const renderResults = analyzeRenderingPerformance(testDanmaku)
  const timeResults = analyzeTimeSynchronization(testDanmaku)

  // 综合性能评估
  console.log('\n📋 综合性能评估:')

  const scores = {
    trackEfficiency:
      trackResults.conflicts.length === 0
        ? 100
        : Math.max(0, 100 - trackResults.conflicts.length * 10),
    memoryEfficiency:
      memoryResults < 512 * 1024
        ? 100
        : Math.max(0, 100 - (memoryResults - 512 * 1024) / 1024),
    renderEfficiency: renderResults.performance === 'good' ? 100 : 60,
    timeEfficiency:
      timeResults.highDensityTimes.length === 0
        ? 100
        : Math.max(0, 100 - timeResults.highDensityTimes.length * 20),
  }

  const overallScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 4
  )

  console.log(`✅ 轨道效率: ${scores.trackEfficiency}/100`)
  console.log(`✅ 内存效率: ${scores.memoryEfficiency}/100`)
  console.log(`✅ 渲染效率: ${scores.renderEfficiency}/100`)
  console.log(`✅ 时间效率: ${scores.timeEfficiency}/100`)
  console.log(`🎯 综合评分: ${overallScore}/100`)

  // 性能建议
  console.log('\n💡 性能优化建议:')
  if (overallScore >= 90) {
    console.log('🎉 弹幕系统性能优秀！')
  } else if (overallScore >= 70) {
    console.log('✅ 弹幕系统性能良好，有优化空间')
  } else {
    console.log('⚠️  弹幕系统性能需要优化')
  }

  if (scores.trackEfficiency < 80) {
    console.log('  - 优化轨道分配算法，减少冲突')
  }
  if (scores.memoryEfficiency < 80) {
    console.log('  - 实现弹幕池和内存回收机制')
  }
  if (scores.renderEfficiency < 80) {
    console.log('  - 优化渲染性能，减少帧时间')
  }
  if (scores.timeEfficiency < 80) {
    console.log('  - 优化时间同步，处理高密度弹幕')
  }
}

// 运行测试
try {
  runPerformanceTest()
  console.log('\n🎉 弹幕性能分析完成！')
} catch (error) {
  console.error('❌ 测试过程中出现错误:', error.message)
  console.error('错误堆栈:', error.stack)
}

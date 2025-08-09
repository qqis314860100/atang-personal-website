// 测试性能埋点修复
async function testPerformanceFix() {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 测试性能埋点修复...')

  try {
    // 测试1: 使用正确的字段名
    console.log('\n⚡ 测试1: 使用loadTime字段...')
    const test1Response = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'performance',
        page: '/test-page',
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        performanceMetrics: {
          loadTime: 1234.5,
          domContentLoaded: 567.8,
        },
      }),
    })

    const test1Result = await test1Response.text()
    console.log(`测试1结果: ${test1Response.status} - ${test1Result}`)

    // 测试2: 使用前端字段名
    console.log('\n⚡ 测试2: 使用page_load_time字段...')
    const test2Response = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'performance',
        page: '/test-page-2',
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        performanceMetrics: {
          page_load_time: 2345.6,
          domContentLoaded: 789.0,
        },
      }),
    })

    const test2Result = await test2Response.text()
    console.log(`测试2结果: ${test2Response.status} - ${test2Result}`)

    // 测试3: 检查Dashboard数据
    console.log('\n📈 测试3: 检查Dashboard数据...')
    const dashboardResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d`
    )
    const dashboardResult = await dashboardResponse.json()

    console.log('Dashboard状态:', dashboardResponse.status)
    if (dashboardResult.success) {
      console.log('✅ Dashboard数据获取成功')
      console.log('性能数据:', dashboardResult.data?.performance)
    } else {
      console.log('❌ Dashboard数据获取失败:', dashboardResult.error)
    }

    console.log('\n🎉 性能埋点测试完成！')
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
  }
}

// 检查是否在Node.js环境中运行
if (
  typeof process !== 'undefined' &&
  process.versions &&
  process.versions.node
) {
  // Node.js环境，需要导入fetch
  import('node-fetch')
    .then(({ default: fetch }) => {
      globalThis.fetch = fetch
      testPerformanceFix()
    })
    .catch(() => {
      console.error('请安装 node-fetch: npm install node-fetch')
    })
} else {
  // 浏览器环境
  testPerformanceFix()
}

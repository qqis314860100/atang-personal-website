// 简单测试埋点系统API
async function testAnalyticsAPIs() {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 开始测试埋点系统...')

  try {
    // 1. 测试页面埋点 API
    console.log('\n📊 测试页面埋点API...')
    const trackResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'pageview',
        page: '/test',
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        properties: {
          category: 'test',
          section: 'api_test',
        },
      }),
    })

    const trackResult = await trackResponse.text()
    console.log(`页面埋点结果: ${trackResponse.status} - ${trackResult}`)

    // 2. 测试仪表板数据API
    console.log('\n📈 测试仪表板数据API...')
    const dashboardResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d`
    )
    const dashboardResult = await dashboardResponse.json()

    console.log('仪表板API状态:', dashboardResponse.status)
    console.log('响应数据:', {
      success: dashboardResult.success,
      hasData: !!dashboardResult.data,
      error: dashboardResult.error,
    })

    if (dashboardResult.success && dashboardResult.data) {
      console.log('数据预览:', {
        pageViews: dashboardResult.data.pageViews,
        uniqueVisitors: dashboardResult.data.uniqueVisitors,
        realTimeUsers: dashboardResult.data.realTimeUsers,
        errorCount: dashboardResult.data.errors,
      })
    }

    // 3. 测试页面热力图API
    console.log('\n🔥 测试页面热力图API...')
    const heatmapResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d&type=pageHeatmap`
    )
    const heatmapResult = await heatmapResponse.json()

    console.log('页面热力图API状态:', heatmapResponse.status)
    console.log('热力图数据:', {
      success: heatmapResult.success,
      dataCount: heatmapResult.data?.length || 0,
      error: heatmapResult.error,
    })

    // 4. 测试设备热力图API
    console.log('\n📱 测试设备热力图API...')
    const deviceResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d&type=deviceHeatmap`
    )
    const deviceResult = await deviceResponse.json()

    console.log('设备热力图API状态:', deviceResponse.status)
    console.log('设备数据:', {
      success: deviceResult.success,
      dataCount: deviceResult.data?.length || 0,
      error: deviceResult.error,
    })

    console.log('\n🎉 埋点系统测试完成！')
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
      testAnalyticsAPIs()
    })
    .catch(() => {
      console.error('请安装 node-fetch: npm install node-fetch')
    })
} else {
  // 浏览器环境
  testAnalyticsAPIs()
}

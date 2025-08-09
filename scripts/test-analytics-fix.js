// 测试埋点系统修复
async function testAnalyticsFix() {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 测试埋点系统修复...')

  try {
    // 1. 测试性能指标埋点
    console.log('\n⚡ 测试性能指标埋点...')
    const performanceResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'performance',
        page: '/test-performance',
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        performanceMetrics: {
          loadTime: 1234.5,
          domContentLoaded: 567.8,
          firstContentfulPaint: 890.1,
          largestContentfulPaint: 1100.2,
          cumulativeLayoutShift: 0.05,
          firstInputDelay: 23.4,
        },
      }),
    })

    const performanceResult = await performanceResponse.text()
    console.log(
      `性能埋点结果: ${performanceResponse.status} - ${performanceResult}`
    )

    // 2. 测试页面浏览埋点
    console.log('\n📊 测试页面浏览埋点...')
    const pageViewResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'pageview',
        page: '/test-pageview',
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        deviceType: 'desktop',
        browser: 'chrome',
        os: 'windows',
        screenResolution: '1920x1080',
        language: 'zh-CN',
      }),
    })

    const pageViewResult = await pageViewResponse.text()
    console.log(`页面埋点结果: ${pageViewResponse.status} - ${pageViewResult}`)

    // 3. 测试用户事件埋点
    console.log('\n🎯 测试用户事件埋点...')
    const eventResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'event',
        eventType: 'click',
        eventName: 'test_button_click',
        page: '/test-event',
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        properties: {
          button_id: 'test-btn',
          section: 'header',
        },
        value: 1,
      }),
    })

    const eventResult = await eventResponse.text()
    console.log(`事件埋点结果: ${eventResponse.status} - ${eventResult}`)

    // 4. 测试Dashboard API
    console.log('\n📈 测试Dashboard数据API...')
    const dashboardResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d`
    )
    const dashboardResult = await dashboardResponse.json()

    console.log('Dashboard API状态:', dashboardResponse.status)
    console.log('数据响应:', {
      success: dashboardResult.success,
      hasData: !!dashboardResult.data,
      error: dashboardResult.error,
    })

    if (dashboardResult.success && dashboardResult.data) {
      console.log('数据概览:', {
        pageViews: dashboardResult.data.pageViews,
        uniqueVisitors: dashboardResult.data.uniqueVisitors,
        deviceTypesCount: dashboardResult.data.deviceTypes?.length || 0,
      })
    }

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
      testAnalyticsFix()
    })
    .catch(() => {
      console.error('请安装 node-fetch: npm install node-fetch')
    })
} else {
  // 浏览器环境
  testAnalyticsFix()
}

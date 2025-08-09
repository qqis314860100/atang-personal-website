// 简单测试埋点系统是否工作
async function testAnalytics() {
  try {
    console.log('🧪 测试埋点系统...')

    // 测试dashboard API
    const response = await fetch(
      'http://localhost:3000/api/analytics/dashboard?timeRange=7d'
    )
    const result = await response.json()

    console.log('Dashboard API响应:', {
      success: result.success,
      hasData: !!result.data,
      errors: result.error,
    })

    if (result.success) {
      console.log('✅ Dashboard API正常工作')
      console.log('数据概览:', {
        pageViews: result.data.pageViews,
        uniqueVisitors: result.data.uniqueVisitors,
        realTimeUsers: result.data.realTimeUsers,
        errorCount: result.data.errors,
      })
    } else {
      console.log('❌ Dashboard API失败:', result.error)
    }

    // 测试页面热力图API
    const heatmapResponse = await fetch(
      'http://localhost:3000/api/analytics/dashboard?timeRange=7d&type=pageHeatmap'
    )
    const heatmapResult = await heatmapResponse.json()

    console.log('页面热力图API:', {
      success: heatmapResult.success,
      dataCount: heatmapResult.data?.length || 0,
    })

    // 测试设备热力图API
    const deviceResponse = await fetch(
      'http://localhost:3000/api/analytics/dashboard?timeRange=7d&type=deviceHeatmap'
    )
    const deviceResult = await deviceResponse.json()

    console.log('设备热力图API:', {
      success: deviceResult.success,
      dataCount: deviceResult.data?.length || 0,
    })
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 如果是直接运行
if (typeof window === 'undefined') {
  // Node.js环境
  const fetch = (await import('node-fetch')).default
  testAnalytics()
} else {
  // 浏览器环境
  testAnalytics()
}

// 监控分析API请求
const monitorAnalytics = async () => {
  const baseUrl = 'http://localhost:3000'

  console.log('📊 监控分析API请求模式...')
  console.log('⏰ 开始时间:', new Date().toISOString())

  // 模拟正常的页面浏览请求
  const normalRequests = [
    {
      name: '页面浏览',
      data: {
        type: 'pageview',
        page: '/dashboard',
        sessionId: 'monitor_session_1',
        userId: 'monitor_user_1',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        language: 'zh-CN',
      },
    },
    {
      name: '用户事件',
      data: {
        type: 'event',
        eventType: 'click',
        eventName: 'button_click',
        page: '/dashboard',
        sessionId: 'monitor_session_1',
        userId: 'monitor_user_1',
        properties: { button_id: 'test-btn' },
        value: 1,
      },
    },
    {
      name: '性能指标',
      data: {
        type: 'performance',
        page: '/dashboard',
        sessionId: 'monitor_session_1',
        userId: 'monitor_user_1',
        performanceMetrics: {
          loadTime: 1234.5,
          domContentLoaded: 567.8,
          firstContentfulPaint: 890.1,
          largestContentfulPaint: 1100.2,
          cumulativeLayoutShift: 0.05,
          firstInputDelay: 23.4,
        },
      },
    },
  ]

  // 发送正常请求
  for (const request of normalRequests) {
    try {
      console.log(`\n📤 发送${request.name}请求...`)
      const response = await fetch(`${baseUrl}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.data),
      })

      if (response.ok) {
        console.log(`✅ ${request.name}请求成功`)
      } else {
        const errorText = await response.text()
        console.log(`❌ ${request.name}请求失败:`, errorText)
      }
    } catch (error) {
      console.log(`❌ ${request.name}请求异常:`, error.message)
    }

    // 等待1秒
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('\n🎉 监控完成！')
  console.log('⏰ 结束时间:', new Date().toISOString())
}

monitorAnalytics()

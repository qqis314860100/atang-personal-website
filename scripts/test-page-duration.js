// 测试页面停留时间功能
const testPageDuration = async () => {
  console.log('🧪 测试页面停留时间功能...')

  // 测试1: 模拟页面访问
  console.log('\n1. 模拟页面访问...')
  const pageviewResponse = await fetch(
    'http://localhost:3000/api/analytics/track',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'pageview',
        page: '/zh/dashboard',
        sessionId: 'test_session_001',
        userId: 'test_user_001',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
      }),
    }
  )

  if (pageviewResponse.ok) {
    console.log('✅ 页面访问记录成功')
  } else {
    console.log('❌ 页面访问记录失败:', await pageviewResponse.text())
  }

  // 等待2秒模拟用户浏览
  console.log('\n2. 等待2秒模拟用户浏览...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 测试2: 模拟页面停留时间
  console.log('\n3. 模拟页面停留时间...')
  const durationResponse = await fetch(
    'http://localhost:3000/api/analytics/track',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'page_duration',
        duration: 120, // 2分钟
        sessionId: 'test_session_001',
        userId: 'test_user_001',
      }),
    }
  )

  if (durationResponse.ok) {
    console.log('✅ 页面停留时间记录成功')
  } else {
    console.log('❌ 页面停留时间记录失败:', await durationResponse.text())
  }

  // 测试3: 获取Dashboard数据验证
  console.log('\n4. 获取Dashboard数据验证...')
  const dashboardResponse = await fetch(
    'http://localhost:3000/api/analytics/dashboard?timeRange=7d'
  )

  if (dashboardResponse.ok) {
    const dashboardData = await dashboardResponse.json()
    console.log('✅ Dashboard数据获取成功')
    console.log(
      '📊 页面热力图数据:',
      dashboardData.pageHeatmap?.length || 0,
      '个页面'
    )

    if (dashboardData.pageHeatmap && dashboardData.pageHeatmap.length > 0) {
      const dashboardPage = dashboardData.pageHeatmap.find(
        (p) => p.page === '/zh/dashboard'
      )
      if (dashboardPage) {
        console.log('📈 测试页面停留时间:', dashboardPage.avgTime, '秒')
      }
    }
  } else {
    console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
  }

  console.log('\n🎉 测试完成!')
}

// 运行测试
testPageDuration().catch(console.error)

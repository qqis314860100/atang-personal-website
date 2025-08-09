// 测试固定高度功能
const testFixedHeight = async () => {
  console.log('🧪 测试固定高度功能...')

  // 生成更多测试数据来验证滚动功能
  console.log('\n1. 生成更多测试数据...')

  const testPages = [
    '/zh/dashboard',
    '/zh/blog',
    '/zh/blog/1',
    '/zh/blog/2',
    '/zh/blog/3',
    '/zh/about',
    '/zh/contact',
    '/zh/profile',
    '/zh/settings',
    '/zh/admin',
    '/zh/users',
    '/zh/analytics',
    '/zh/reports',
    '/zh/export',
    '/zh/import',
  ]

  for (let i = 0; i < testPages.length; i++) {
    const pageviewResponse = await fetch(
      'http://localhost:3001/api/analytics/track',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'pageview',
          page: testPages[i],
          sessionId: `test_session_${i + 1}`,
          userId: `test_user_${i + 1}`,
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          deviceType:
            i % 3 === 0 ? 'mobile' : i % 3 === 1 ? 'tablet' : 'desktop',
          browser:
            i % 4 === 0
              ? 'Chrome'
              : i % 4 === 1
              ? 'Firefox'
              : i % 4 === 2
              ? 'Safari'
              : 'Edge',
          os: 'Windows',
        }),
      }
    )

    if (pageviewResponse.ok) {
      console.log(`✅ 页面访问记录成功: ${testPages[i]}`)
    }

    // 等待一小段时间
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // 等待2秒
  console.log('\n2. 等待2秒...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 为部分页面添加停留时间
  console.log('\n3. 添加页面停留时间...')
  for (let i = 0; i < 5; i++) {
    const durationResponse = await fetch(
      'http://localhost:3001/api/analytics/track',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page_duration',
          duration: Math.floor(Math.random() * 300) + 60, // 1-6分钟
          sessionId: `test_session_${i + 1}`,
          userId: `test_user_${i + 1}`,
        }),
      }
    )

    if (durationResponse.ok) {
      console.log(`✅ 页面停留时间记录成功: 会话 ${i + 1}`)
    }
  }

  // 获取Dashboard数据验证
  console.log('\n4. 获取Dashboard数据验证...')
  const dashboardResponse = await fetch(
    'http://localhost:3001/api/analytics/dashboard?timeRange=1d'
  )

  if (dashboardResponse.ok) {
    const dashboardData = await dashboardResponse.json()
    console.log('✅ Dashboard数据获取成功')
    console.log(
      '📊 页面热力图数据:',
      dashboardData.data.pageHeatmap?.length || 0,
      '个页面'
    )

    if (
      dashboardData.data.pageHeatmap &&
      dashboardData.data.pageHeatmap.length > 0
    ) {
      console.log('📈 前5个页面:')
      dashboardData.data.pageHeatmap.slice(0, 5).forEach((page, index) => {
        console.log(
          `  ${index + 1}. ${page.page} - ${page.views}次访问 - ${
            page.avgTime
          }秒停留`
        )
      })
    }
  } else {
    console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
  }

  console.log('\n🎉 测试完成!')
  console.log(
    '💡 现在可以访问 http://localhost:3001/zh/dashboard 查看固定高度效果'
  )
}

// 运行测试
testFixedHeight().catch(console.error)

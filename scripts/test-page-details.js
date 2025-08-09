// 测试页面详细信息功能
async function testPageDetails() {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 测试页面详细信息功能...')

  try {
    // 1. 测试页面热力图数据
    console.log('\n📊 测试页面热力图数据...')
    const pageHeatmapResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d&type=pageHeatmap`
    )
    const pageHeatmapResult = await pageHeatmapResponse.json()

    console.log('页面热力图状态:', pageHeatmapResponse.status)
    if (pageHeatmapResult.success && pageHeatmapResult.data) {
      console.log('✅ 页面热力图数据获取成功')
      console.log('页面数量:', pageHeatmapResult.data.length)

      // 检查第一个页面的详细信息
      if (pageHeatmapResult.data.length > 0) {
        const firstPage = pageHeatmapResult.data[0]
        console.log('\n📋 第一个页面详细信息:')
        console.log('- 页面名称:', firstPage.page)
        console.log('- 浏览量:', firstPage.views)
        console.log('- 平均时间:', firstPage.avgTime)
        console.log('- 热力强度:', firstPage.intensity)

        if (firstPage.pageDetails) {
          console.log('\n📈 详细统计信息:')
          console.log('- 独立访客:', firstPage.pageDetails.uniqueVisitors)
          console.log(
            '- 跳出率:',
            (firstPage.pageDetails.bounceRate * 100).toFixed(1) + '%'
          )
          console.log(
            '- 平均会话时长:',
            firstPage.pageDetails.avgSessionDuration
          )
          console.log(
            '- 设备分布:',
            firstPage.pageDetails.deviceDistribution?.length || 0,
            '种设备'
          )
          console.log(
            '- 浏览器分布:',
            firstPage.pageDetails.browserDistribution?.length || 0,
            '种浏览器'
          )
          console.log(
            '- 来源数量:',
            firstPage.pageDetails.topReferrers?.length || 0,
            '个来源'
          )
          console.log(
            '- 时间分布:',
            firstPage.pageDetails.timeDistribution?.length || 0,
            '小时数据'
          )
        }
      }
    } else {
      console.log('❌ 页面热力图数据获取失败:', pageHeatmapResult.error)
    }

    // 2. 测试设备热力图数据
    console.log('\n📱 测试设备热力图数据...')
    const deviceHeatmapResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d&type=deviceHeatmap`
    )
    const deviceHeatmapResult = await deviceHeatmapResponse.json()

    console.log('设备热力图状态:', deviceHeatmapResponse.status)
    if (deviceHeatmapResult.success && deviceHeatmapResult.data) {
      console.log('✅ 设备热力图数据获取成功')
      console.log('设备类型数量:', deviceHeatmapResult.data.length)

      // 检查第一个设备的详细信息
      if (deviceHeatmapResult.data.length > 0) {
        const firstDevice = deviceHeatmapResult.data[0]
        console.log('\n📱 第一个设备详细信息:')
        console.log('- 设备类型:', firstDevice.device)
        console.log('- 访问次数:', firstDevice.count)
        console.log('- 热力强度:', firstDevice.intensity)
        console.log('- 浏览器种类:', Object.keys(firstDevice.browsers).length)

        if (firstDevice.deviceDetails) {
          console.log('- 详细记录数:', firstDevice.deviceDetails.length)
        }
      }
    } else {
      console.log('❌ 设备热力图数据获取失败:', deviceHeatmapResult.error)
    }

    // 3. 测试Dashboard整体数据
    console.log('\n📈 测试Dashboard整体数据...')
    const dashboardResponse = await fetch(
      `${baseUrl}/api/analytics/dashboard?timeRange=7d`
    )
    const dashboardResult = await dashboardResponse.json()

    console.log('Dashboard状态:', dashboardResponse.status)
    if (dashboardResult.success && dashboardResult.data) {
      console.log('✅ Dashboard数据获取成功')
      console.log('核心指标:', {
        pageViews: dashboardResult.data.pageViews,
        uniqueVisitors: dashboardResult.data.uniqueVisitors,
        realTimeUsers: dashboardResult.data.realTimeUsers,
        avgSessionDuration: dashboardResult.data.avgSessionDuration,
        bounceRate: dashboardResult.data.bounceRate,
      })
    } else {
      console.log('❌ Dashboard数据获取失败:', dashboardResult.error)
    }

    console.log('\n🎉 页面详细信息测试完成！')
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
      testPageDetails()
    })
    .catch(() => {
      console.error('请安装 node-fetch: npm install node-fetch')
    })
} else {
  // 浏览器环境
  testPageDetails()
}

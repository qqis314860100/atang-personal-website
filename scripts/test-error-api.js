// 测试错误日志API
const testErrorAPI = async () => {
  console.log('🧪 测试错误日志API...')

  // 1. 记录一个错误日志
  console.log('\n1. 记录错误日志...')
  try {
    const response = await fetch('http://localhost:3001/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'error',
        error_type: 'TestError',
        error_message: 'This is a test error',
        stack_trace: 'at test (test.js:1:1)',
        page: '/zh/test',
        user_id: 'test_user',
        session_id: 'test_session',
        user_agent: 'Test Browser',
        ip_address: '127.0.0.1',
        severity: 'high',
      }),
    })

    if (response.ok) {
      console.log('✅ 错误日志记录成功')
    } else {
      console.log('❌ 错误日志记录失败:', await response.text())
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }

  // 2. 等待2秒
  console.log('\n2. 等待2秒...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 3. 查询Dashboard数据
  console.log('\n3. 查询Dashboard数据...')
  try {
    const dashboardResponse = await fetch(
      'http://localhost:3001/api/analytics/dashboard?timeRange=1d'
    )

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json()
      console.log('✅ Dashboard数据获取成功')
      console.log('📊 错误日志数量:', dashboardData.data.errorLogs?.length || 0)

      if (
        dashboardData.data.errorLogs &&
        dashboardData.data.errorLogs.length > 0
      ) {
        console.log('📋 错误日志详情:')
        dashboardData.data.errorLogs.forEach((error, index) => {
          console.log(
            `  ${index + 1}. ${error.type} - ${error.severity} - ${error.page}`
          )
        })
      } else {
        console.log('📭 没有错误日志数据')
      }
    } else {
      console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }

  console.log('\n🎉 测试完成!')
}

testErrorAPI()

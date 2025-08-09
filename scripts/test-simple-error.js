// 简单的错误日志测试
const testSimpleError = async () => {
  console.log('🧪 简单错误日志测试...')

  try {
    const response = await fetch('http://localhost:3001/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'error',
        error_type: 'TypeError',
        error_message: 'Cannot read property of undefined',
        stack_trace: 'at processData (app.js:15:3)',
        page: '/zh/dashboard',
        user_id: 'test_user_1',
        session_id: 'test_session_1',
        user_agent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: '192.168.1.1',
        severity: 'high',
      }),
    })

    if (response.ok) {
      console.log('✅ 错误日志记录成功')
    } else {
      const errorText = await response.text()
      console.log('❌ 错误日志记录失败:', errorText)
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }

  // 等待2秒
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 获取Dashboard数据
  try {
    const dashboardResponse = await fetch(
      'http://localhost:3001/api/analytics/dashboard?timeRange=7d'
    )

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json()
      console.log('✅ Dashboard数据获取成功')
      console.log('📊 错误日志数量:', dashboardData.data.errorLogs?.length || 0)
    } else {
      console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }
}

testSimpleError()

// 生成真实的错误日志数据
const generateRealErrors = async () => {
  console.log('🧪 生成真实错误日志数据...')

  // 生成多个错误日志
  for (let i = 0; i < 10; i++) {
    const errorTypes = [
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'NetworkError',
      'ValidationError',
    ]
    const pages = [
      '/zh/dashboard',
      '/zh/blog',
      '/zh/about',
      '/zh/contact',
      '/zh/profile',
    ]
    const severities = ['high', 'medium', 'low']

    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    const page = pages[Math.floor(Math.random() * pages.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    const count = Math.floor(Math.random() * 10) + 1

    // 生成不同的错误消息
    const errorMessages = {
      TypeError: "Cannot read property 'length' of undefined",
      ReferenceError: 'variable is not defined',
      SyntaxError: "Unexpected token '}'",
      NetworkError: 'Failed to fetch API endpoint',
      ValidationError: 'Invalid input format',
    }

    const errorData = {
      type: 'error',
      error_type: errorType,
      error_message: errorMessages[errorType],
      stack_trace: `at processData (app.js:${
        Math.floor(Math.random() * 100) + 1
      }:${
        Math.floor(Math.random() * 50) + 1
      })\nat renderComponent (component.js:${
        Math.floor(Math.random() * 50) + 1
      }:${Math.floor(Math.random() * 30) + 1})`,
      page: page,
      user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
      session_id: `session_${Math.floor(Math.random() * 10000) + 1}`,
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ip_address: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      severity: severity,
    }

    try {
      const response = await fetch(
        'http://localhost:3001/api/analytics/track',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorData),
        }
      )

      if (response.ok) {
        console.log(`✅ 错误日志记录成功: ${errorType} - ${page} - ${severity}`)
      } else {
        console.log(`❌ 错误日志记录失败: ${errorType}`)
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`)
    }

    // 等待一小段时间
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log('\n2. 等待3秒...')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  console.log('\n3. 验证数据...')
  try {
    const dashboardResponse = await fetch(
      'http://localhost:3001/api/analytics/dashboard?timeRange=7d'
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
            `  ${index + 1}. ${error.type} - ${error.severity} - ${
              error.count
            }次 - ${error.page}`
          )
        })
      }
    } else {
      console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }

  console.log('\n🎉 真实错误日志数据生成完成!')
  console.log('💡 现在可以访问 http://localhost:3001/zh/dashboard 查看:')
  console.log('   - 真实的错误日志数据')
  console.log('   - 点击展开查看详情功能')
  console.log('   - 搜索和过滤功能')
  console.log('   - 排序功能')
}

generateRealErrors().catch(console.error)

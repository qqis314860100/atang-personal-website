// 测试SLS风格的错误日志
const testSLSErrorLogs = async () => {
  console.log('🧪 测试SLS风格错误日志...')

  // 模拟不同类型的错误
  const errorTypes = [
    {
      type: 'TypeError',
      message: "Cannot read property 'length' of undefined",
      severity: 'high',
      source: 'frontend',
    },
    {
      type: 'ReferenceError',
      message: 'variable is not defined',
      severity: 'medium',
      source: 'frontend',
    },
    {
      type: 'SyntaxError',
      message: "Unexpected token '}'",
      severity: 'high',
      source: 'frontend',
    },
    {
      type: 'NetworkError',
      message: 'Failed to fetch API endpoint',
      severity: 'medium',
      source: 'frontend',
    },
    {
      type: 'ValidationError',
      message: 'Invalid input format',
      severity: 'low',
      source: 'frontend',
    },
    {
      type: 'TimeoutError',
      message: 'Request timeout after 30 seconds',
      severity: 'medium',
      source: 'frontend',
    },
    {
      type: 'MemoryError',
      message: 'Out of memory allocation',
      severity: 'high',
      source: 'frontend',
    },
    {
      type: 'DOMError',
      message: 'Element not found in DOM',
      severity: 'low',
      source: 'frontend',
    },
  ]

  const pages = [
    '/zh/dashboard',
    '/zh/blog',
    '/zh/blog/1',
    '/zh/about',
    '/zh/contact',
    '/zh/profile',
    '/zh/settings',
    '/zh/admin',
  ]

  console.log('\n1. 生成错误日志数据...')

  for (let i = 0; i < 15; i++) {
    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    const page = pages[Math.floor(Math.random() * pages.length)]
    const count = Math.floor(Math.random() * 10) + 1
    const timestamp = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const errorData = {
      type: errorType.type,
      message: errorType.message,
      stackTrace: `at processData (app.js:${
        Math.floor(Math.random() * 100) + 1
      }:${
        Math.floor(Math.random() * 50) + 1
      })\nat renderComponent (component.js:${
        Math.floor(Math.random() * 50) + 1
      }:${Math.floor(Math.random() * 30) + 1})`,
      page: page,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      severity: errorType.severity,
      userId: `user_${Math.floor(Math.random() * 1000) + 1}`,
      sessionId: `session_${Math.floor(Math.random() * 10000) + 1}`,
      timestamp: timestamp,
      source: errorType.source,
      traceId: `trace_${Math.random().toString(36).substr(2, 9)}`,
    }

    try {
      const response = await fetch(
        'http://localhost:3001/api/analytics/track',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'error',
            ...errorData,
          }),
        }
      )

      if (response.ok) {
        console.log(`✅ 错误日志记录成功: ${errorType.type} - ${page}`)
      } else {
        console.log(`❌ 错误日志记录失败: ${errorType.type}`)
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`)
    }

    // 等待一小段时间
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log('\n2. 等待2秒...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('\n3. 获取Dashboard数据验证...')
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
        console.log('📋 前5个错误日志:')
        dashboardData.data.errorLogs.slice(0, 5).forEach((error, index) => {
          console.log(
            `  ${index + 1}. ${error.type} - ${error.severity} - ${
              error.count
            }次`
          )
        })
      }
    } else {
      console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message)
  }

  console.log('\n🎉 SLS风格错误日志测试完成!')
  console.log(
    '💡 现在可以访问 http://localhost:3001/zh/dashboard 查看SLS风格的错误日志列表'
  )
  console.log('✨ 功能特性:')
  console.log('   - 搜索和过滤功能')
  console.log('   - 多字段排序')
  console.log('   - 分页显示')
  console.log('   - 详细的错误信息展示')
  console.log('   - 类似阿里云SLS的UI风格')
}

// 运行测试
testSLSErrorLogs().catch(console.error)

// 生成更多错误日志数据
const generateMoreErrors = async () => {
  console.log('🧪 生成更多错误日志数据...')

  // 生成更多错误日志
  for (let i = 0; i < 30; i++) {
    const errorTypes = [
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'NetworkError',
      'ValidationError',
      'RangeError',
      'EvalError',
      'URIError',
      'PermissionError',
      'TimeoutError',
    ]
    const pages = [
      '/zh/dashboard',
      '/zh/blog',
      '/zh/about',
      '/zh/contact',
      '/zh/profile',
      '/zh/settings',
      '/zh/admin',
      '/zh/users',
      '/zh/analytics',
      '/zh/reports',
      '/zh/login',
      '/zh/register',
      '/en/dashboard',
      '/en/blog',
      '/en/about',
    ]

    // 中文严重程度映射
    const severities = [
      { en: 'high', zh: '高' },
      { en: 'medium', zh: '中' },
      { en: 'low', zh: '低' },
      { en: 'critical', zh: '严重' },
      { en: 'warning', zh: '警告' },
    ]

    const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)]
    const page = pages[Math.floor(Math.random() * pages.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]

    // 生成不同的错误消息（中文）
    const errorMessages = {
      TypeError: "无法读取未定义对象的属性 'length'",
      ReferenceError: '变量未定义',
      SyntaxError: "意外的标记 '}'",
      NetworkError: '网络请求失败',
      ValidationError: '输入格式无效',
      RangeError: '超出最大调用堆栈大小',
      EvalError: '无效的 eval() 调用',
      URIError: '无效的 URI',
      PermissionError: '权限不足',
      TimeoutError: '请求超时',
    }

    const errorData = {
      type: 'error',
      error_type: errorType,
      error_message: errorMessages[errorType] || `${errorType}错误`,
      stack_trace: `at processData (app.js:${
        Math.floor(Math.random() * 100) + 1
      }:${
        Math.floor(Math.random() * 50) + 1
      })\nat renderComponent (component.js:${
        Math.floor(Math.random() * 50) + 1
      }:${Math.floor(Math.random() * 30) + 1})\nat handleClick (handler.js:${
        Math.floor(Math.random() * 25) + 1
      }:${Math.floor(Math.random() * 15) + 1})`,
      page: page,
      user_id: `user_${Math.floor(Math.random() * 1000) + 1}`,
      session_id: `session_${Math.floor(Math.random() * 10000) + 1}`,
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ip_address: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      severity: severity.zh, // 使用中文严重程度
      timestamp: new Date(
        Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
      ).toISOString(), // 随机过去7天内的时间
      source: 'frontend',
      trace_id: `trace_${Math.random().toString(36).substr(2, 9)}`,
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
        console.log(
          `✅ 错误日志记录成功: ${errorType} - ${page} - ${severity.zh}`
        )
      } else {
        const errorText = await response.text()
        console.log(`❌ 错误日志记录失败: ${errorType} - ${errorText}`)
      }
    } catch (error) {
      console.log(`❌ 请求失败: ${error.message}`)
    }

    // 等待一小段时间
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  console.log('\n⏳ 等待3秒钟数据同步...')
  await new Promise((resolve) => setTimeout(resolve, 3000))

  console.log('\n🔍 验证生成的数据...')
  try {
    const dashboardResponse = await fetch(
      'http://localhost:3001/api/analytics/dashboard?timeRange=7d'
    )

    if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json()
      console.log('✅ Dashboard数据获取成功')
      console.log('📊 错误日志总数:', dashboardData.data.errorLogs?.length || 0)

      if (
        dashboardData.data.errorLogs &&
        dashboardData.data.errorLogs.length > 0
      ) {
        console.log('\n📋 错误日志详情预览:')
        dashboardData.data.errorLogs.slice(0, 10).forEach((error, index) => {
          console.log(
            `  ${index + 1}. ${error.type} - 严重程度: ${
              error.severity
            } - 次数: ${error.count} - 页面: ${error.page}`
          )
        })

        if (dashboardData.data.errorLogs.length > 10) {
          console.log(
            `  ... 还有 ${dashboardData.data.errorLogs.length - 10} 条错误日志`
          )
        }

        // 统计严重程度分布
        const severityStats = {}
        dashboardData.data.errorLogs.forEach((error) => {
          severityStats[error.severity] =
            (severityStats[error.severity] || 0) + 1
        })

        console.log('\n📈 严重程度分布:')
        Object.entries(severityStats).forEach(([severity, count]) => {
          console.log(`  ${severity}: ${count} 条`)
        })
      }
    } else {
      console.log('❌ Dashboard数据获取失败:', await dashboardResponse.text())
    }
  } catch (error) {
    console.log('❌ 验证请求失败:', error.message)
  }

  console.log('\n🎉 更多错误日志数据生成完成!')
  console.log('💡 现在可以访问 http://localhost:3001/zh/dashboard 查看:')
  console.log('   ✨ 丰富的错误日志数据（中文严重程度）')
  console.log('   🔍 点击展开查看详情功能')
  console.log('   🔎 搜索和过滤功能')
  console.log('   📊 排序功能')
  console.log('   🌡️ 热力图视图切换')
}

generateMoreErrors().catch(console.error)

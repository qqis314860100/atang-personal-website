// 测试分析API修复
const testAnalyticsFix = async () => {
  const baseUrl = 'http://localhost:3000'

  console.log('🧪 测试分析API修复...')

  // 测试1: 正常请求
  try {
    console.log('\n📊 测试1: 正常页面浏览请求')
    const pageViewResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'pageview',
        page: '/test-page',
        sessionId: 'test_session_1',
        userId: 'test_user_1',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        language: 'zh-CN',
      }),
    })

    if (pageViewResponse.ok) {
      console.log('✅ 页面浏览请求成功')
    } else {
      const errorText = await pageViewResponse.text()
      console.log('❌ 页面浏览请求失败:', errorText)
    }
  } catch (error) {
    console.log('❌ 页面浏览请求异常:', error.message)
  }

  // 测试2: 空请求体
  try {
    console.log('\n📊 测试2: 空请求体')
    const emptyResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    })

    if (emptyResponse.status === 400) {
      const errorText = await emptyResponse.text()
      console.log('✅ 空请求体正确处理:', errorText)
    } else {
      console.log('❌ 空请求体处理异常:', emptyResponse.status)
    }
  } catch (error) {
    console.log('❌ 空请求体测试异常:', error.message)
  }

  // 测试3: 无效JSON
  try {
    console.log('\n📊 测试3: 无效JSON')
    const invalidJsonResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    })

    if (invalidJsonResponse.status === 400) {
      const errorText = await invalidJsonResponse.text()
      console.log('✅ 无效JSON正确处理:', errorText)
    } else {
      console.log('❌ 无效JSON处理异常:', invalidJsonResponse.status)
    }
  } catch (error) {
    console.log('❌ 无效JSON测试异常:', error.message)
  }

  // 测试4: 缺少事件类型
  try {
    console.log('\n📊 测试4: 缺少事件类型')
    const noTypeResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: '/test-page',
        sessionId: 'test_session_1',
      }),
    })

    if (noTypeResponse.status === 400) {
      const errorText = await noTypeResponse.text()
      console.log('✅ 缺少事件类型正确处理:', errorText)
    } else {
      console.log('❌ 缺少事件类型处理异常:', noTypeResponse.status)
    }
  } catch (error) {
    console.log('❌ 缺少事件类型测试异常:', error.message)
  }

  // 测试5: 错误事件
  try {
    console.log('\n📊 测试5: 错误事件')
    const errorResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'error',
        errorData: {
          error_type: 'TestError',
          error_message: 'This is a test error',
          stack_trace: 'at test (test.js:1:1)',
          severity: 'low',
        },
        page: '/test-page',
        sessionId: 'test_session_1',
        userId: 'test_user_1',
      }),
    })

    if (errorResponse.ok) {
      console.log('✅ 错误事件请求成功')
    } else {
      const errorText = await errorResponse.text()
      console.log('❌ 错误事件请求失败:', errorText)
    }
  } catch (error) {
    console.log('❌ 错误事件测试异常:', error.message)
  }

  console.log('\n🎉 测试完成！')
}

testAnalyticsFix()

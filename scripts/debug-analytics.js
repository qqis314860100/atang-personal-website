// 调试分析API的JSON解析问题
const debugAnalytics = async () => {
  const baseUrl = 'http://localhost:3000'

  console.log('🔍 调试分析API JSON解析问题...')

  // 测试1: 发送无效JSON
  try {
    console.log('\n📊 测试1: 发送无效JSON "invalid"')
    const invalidResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid',
    })

    console.log('状态码:', invalidResponse.status)
    const errorText = await invalidResponse.text()
    console.log('响应:', errorText)
  } catch (error) {
    console.log('❌ 请求异常:', error.message)
  }

  // 测试2: 发送空对象
  try {
    console.log('\n📊 测试2: 发送空对象 {}')
    const emptyObjResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    console.log('状态码:', emptyObjResponse.status)
    const errorText = await emptyObjResponse.text()
    console.log('响应:', errorText)
  } catch (error) {
    console.log('❌ 请求异常:', error.message)
  }

  // 测试3: 发送只有page字段的对象
  try {
    console.log('\n📊 测试3: 发送只有page字段的对象')
    const pageOnlyResponse = await fetch(`${baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: '/test-page',
        sessionId: 'test_session_1',
      }),
    })

    console.log('状态码:', pageOnlyResponse.status)
    const errorText = await pageOnlyResponse.text()
    console.log('响应:', errorText)
  } catch (error) {
    console.log('❌ 请求异常:', error.message)
  }

  console.log('\n🎉 调试完成！')
}

debugAnalytics()

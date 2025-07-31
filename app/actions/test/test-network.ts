'use server'

export async function testNetwork() {
  try {
    console.log('=== 测试网络连接 ===')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log('测试 URL:', url)

    if (!url) {
      return {
        success: false,
        message: 'NEXT_PUBLIC_SUPABASE_URL 环境变量未设置',
      }
    }

    // 1. 测试基本网络连接
    const testUrls = ['https://httpbin.org/get', 'https://api.github.com', url]

    const results: Record<string, any> = {}

    for (const testUrl of testUrls) {
      try {
        console.log(`测试连接: ${testUrl}`)
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Next.js/15.4.4',
          },
        })

        results[testUrl] = {
          success: true,
          status: response.status,
          statusText: response.statusText,
        }

        console.log(`✅ ${testUrl} - 状态: ${response.status}`)
      } catch (error) {
        results[testUrl] = {
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
        }
        console.log(
          `❌ ${testUrl} - 错误: ${
            error instanceof Error ? error.message : '未知错误'
          }`
        )
      }
    }

    // 2. 测试 DNS 解析
    let dnsResult = null
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      console.log('测试 DNS 解析:', hostname)

      // 简单的 DNS 测试
      const dnsResponse = await fetch(
        `https://dns.google/resolve?name=${hostname}`
      )
      const dnsData = await dnsResponse.json()

      dnsResult = {
        success: true,
        hostname,
        data: dnsData,
      }
    } catch (error) {
      dnsResult = {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }
    }

    return {
      success: true,
      message: '网络测试完成',
      results: {
        urlTests: results,
        dnsTest: dnsResult,
      },
    }
  } catch (error) {
    console.error('网络测试出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

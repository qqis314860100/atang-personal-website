'use server'

export async function checkSupabaseProject() {
  try {
    console.log('=== 检查 Supabase 项目状态 ===')

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRole = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE

    if (!url || !serviceRole) {
      return {
        success: false,
        message: '环境变量缺失',
      }
    }

    // 1. 测试不同的 API 端点
    const endpoints = [
      '/rest/v1/',
      '/auth/v1/',
      '/storage/v1/',
      '/realtime/v1/',
      '/functions/v1/',
    ]

    const results: Record<string, any> = {}

    for (const endpoint of endpoints) {
      try {
        const testUrl = `${url}${endpoint}`
        console.log(`测试端点: ${testUrl}`)

        const response = await fetch(testUrl, {
          method: 'GET',
          headers: {
            apikey: serviceRole,
            Authorization: `Bearer ${serviceRole}`,
            'User-Agent': 'Next.js/15.4.4',
          },
        })

        results[endpoint] = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          url: testUrl,
        }

        console.log(`✅ ${endpoint} - 状态: ${response.status}`)
      } catch (error) {
        results[endpoint] = {
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
          url: `${url}${endpoint}`,
        }
        console.log(
          `❌ ${endpoint} - 错误: ${
            error instanceof Error ? error.message : '未知错误'
          }`
        )
      }
    }

    // 2. 解析 URL 信息
    const urlObj = new URL(url)
    const projectId = urlObj.hostname.split('.')[0]

    // 3. 检查项目状态
    const projectInfo = {
      hostname: urlObj.hostname,
      projectId: projectId,
      protocol: urlObj.protocol,
      port: urlObj.port || '443',
      pathname: urlObj.pathname,
    }

    return {
      success: true,
      message: 'Supabase 项目检查完成',
      results: {
        endpoints: results,
        projectInfo: projectInfo,
        envVars: {
          hasUrl: !!url,
          hasServiceRole: !!serviceRole,
          urlLength: url.length,
          serviceRoleLength: serviceRole.length,
        },
      },
    }
  } catch (error) {
    console.error('Supabase 项目检查出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误',
      error,
    }
  }
}

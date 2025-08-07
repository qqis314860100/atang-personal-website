export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy' | 'error'
  message: string
  responseTime?: number
  error?: string
  timestamp: string
}

export async function checkDatabaseHealthFromClient(): Promise<DatabaseHealthStatus> {
  try {
    const startTime = Date.now()

    const response = await fetch('/api/health/database', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const responseTime = Date.now() - startTime
    const data = await response.json()

    return {
      ...data,
      responseTime,
    }
  } catch (error) {
    return {
      status: 'error',
      message: '无法连接到健康检查 API',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString(),
    }
  }
}

export async function waitForDatabaseConnectionFromClient(
  maxAttempts: number = 3,
  delayMs: number = 2000
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 检查数据库连接状态 (${attempt}/${maxAttempts})`)

    const health = await checkDatabaseHealthFromClient()

    if (health.status === 'healthy') {
      console.log('✅ 数据库连接正常')
      return true
    }

    console.warn(`⚠️ 数据库连接异常: ${health.message}`)

    if (attempt < maxAttempts) {
      console.log(`⏳ 等待 ${delayMs}ms 后重试...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  console.error('❌ 数据库连接检查失败，已达到最大重试次数')
  return false
}

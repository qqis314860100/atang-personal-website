import { prisma } from '@/lib/prisma/client'

export interface DatabaseHealthStatus {
  isConnected: boolean
  responseTime: number
  error?: string
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  // 只在服务器端执行数据库检查
  if (typeof window !== 'undefined') {
    return {
      isConnected: false,
      responseTime: 0,
      error: '数据库健康检查只能在服务器端执行',
    }
  }

  const startTime = Date.now()

  try {
    // 执行一个简单的查询来测试连接
    await prisma.$queryRaw`SELECT 1`

    const responseTime = Date.now() - startTime

    return {
      isConnected: true,
      responseTime,
    }
  } catch (error) {
    const responseTime = Date.now() - startTime

    return {
      isConnected: false,
      responseTime,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}

export async function waitForDatabaseConnection(
  maxAttempts: number = 5,
  delayMs: number = 1000
): Promise<boolean> {
  // 只在服务器端执行
  if (typeof window !== 'undefined') {
    console.warn('⚠️ 数据库连接等待只能在服务器端执行')
    return false
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`🔄 尝试连接数据库 (${attempt}/${maxAttempts})`)

    const health = await checkDatabaseHealth()

    if (health.isConnected) {
      console.log('✅ 数据库连接成功')
      return true
    }

    console.warn(`⚠️ 数据库连接失败: ${health.error}`)

    if (attempt < maxAttempts) {
      console.log(`⏳ 等待 ${delayMs}ms 后重试...`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  console.error('❌ 数据库连接失败，已达到最大重试次数')
  return false
}

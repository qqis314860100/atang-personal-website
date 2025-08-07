import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/utils/db-health-check'

// GET /api/health/database - 检查数据库连接状态
export async function GET() {
  try {
    const health = await checkDatabaseHealth()

    if (health.isConnected) {
      return NextResponse.json({
        status: 'healthy',
        message: '数据库连接正常',
        responseTime: health.responseTime,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          status: 'unhealthy',
          message: '数据库连接异常',
          error: health.error,
          responseTime: health.responseTime,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: '数据库健康检查失败',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
